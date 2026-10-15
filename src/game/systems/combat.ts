/**
 * 引擎层 · 伤害判定与结算。
 *
 * 所有伤害都从这里进出：统一处理暴击、处决、击退、僵直、飘字、顿帧、屏幕震动、
 * 死亡掉落经验、荆棘反伤。技能系统只负责"框选目标"，不直接改血量。
 */

import { FX, PLAYER_BASE } from '../config';
import { MONSTER_DEFS } from '../content/monsters';
import { waveScaling } from '../content/waves';
import { circleTouchesBox } from '../../engine/math';
import type { Monster } from '../types';
import type { World } from '../world';
import { spawnDamageText, spawnDeathChunks, spawnDust, spawnHitSparks } from './effects';
import { addXp } from './progression';

export interface DamageOptions {
  /** 击退方向（-1 / 1），0 表示不击退。 */
  knockX?: number;
  knockPower?: number;
  heavy?: boolean;
  /** 允许暴击（普攻/技能默认允许，反伤等环境伤害不允许）。 */
  canCrit?: boolean;
  source: 'attack' | 'spin' | 'dash' | 'thorns' | 'monster';
}

export function isMonsterHittable(monster: Monster): boolean {
  return monster.state !== 'dead' && monster.state !== 'spawn';
}

export function monsterOverlapsCircle(monster: Monster, cx: number, cy: number, radius: number): boolean {
  return circleTouchesBox(cx, cy, radius, monster);
}

export function monsterOverlapsBox(
  monster: Monster,
  left: number,
  bottom: number,
  right: number,
  top: number,
): boolean {
  return (
    monster.x - monster.w * 0.5 < right &&
    monster.x + monster.w * 0.5 > left &&
    monster.y < top &&
    monster.y + monster.h > bottom
  );
}

/** 对怪物造成伤害；返回实际伤害值（0 表示未生效）。 */
export function damageMonster(world: World, monster: Monster, rawDamage: number, options: DamageOptions): number {
  if (!isMonsterHittable(monster)) return 0;
  const def = MONSTER_DEFS[monster.kind];
  const player = world.player;

  let amount = rawDamage;
  let crit = false;
  if (options.canCrit !== false && player.mods.critChance > 0 && world.combatRng.next() < player.mods.critChance) {
    crit = true;
    amount *= player.mods.critMul;
  }
  if (player.mods.executeMul > 0 && monster.hp / monster.maxHp < 0.3) {
    amount *= 1 + player.mods.executeMul;
  }
  amount = Math.max(1, Math.round(amount));
  monster.hp -= amount;
  monster.hitFlash = 1;

  const knockPower =
    (options.knockPower ?? 3) * player.mods.knockbackMul * (1 - def.knockbackResist) * (monster.elite ? 0.55 : 1);
  if (options.knockX) monster.vx += options.knockX * knockPower;

  if (def.superArmor) {
    // 石魔不会被普攻打断，只会短暂减速——"砍不动的肉"。
    monster.vx *= 0.86;
  } else {
    monitorInterrupt(monster);
  }

  player.damageDealt += amount;
  const impactY = monster.y + Math.min(monster.h - 0.2, monster.h * 0.62);
  const heavy = Boolean(options.heavy) || crit;
  spawnHitSparks(world, monster.x, impactY, 0, crit ? [255, 236, 150] : [255, 255, 230], heavy);
  spawnDamageText(
    world,
    monster.x,
    monster.y + monster.h + 0.35,
    0,
    crit ? `${amount}!` : `${amount}`,
    crit ? [255, 214, 92] : [255, 255, 255],
    heavy,
  );
  world.fx.shake = Math.max(world.fx.shake, FX.shakeOnHit + (crit ? 0.14 : 0));
  world.fx.hitStop = Math.min(FX.hitStopMax, world.fx.hitStop + FX.hitStopPerHit * (crit ? 1.6 : 1));
  world.events.emit('hit', {
    x: monster.x,
    y: impactY,
    amount,
    crit,
    heavy,
    target: 'monster',
  });

  if (monster.hp <= 0) killMonster(world, monster);
  return amount;
}

/** 受击僵直（同时打断前摇：脆皮怪可以被"读秒"打断）。 */
function monitorInterrupt(monster: Monster): void {
  monster.state = 'hurt';
  monster.stateTime = 0;
  monster.staggerTimer = 0.16;
}

export function killMonster(world: World, monster: Monster): void {
  if (monster.state === 'dead') return;
  const def = MONSTER_DEFS[monster.kind];
  const player = world.player;
  monster.hp = 0;
  monster.state = 'dead';
  monster.deadTimer = 0.42;
  monster.vx = 0;

  const xpRaw = def.xp * (monster.elite ? 2.5 : 1) * waveScaling(world.wave).xp;
  const gained = addXp(world, xpRaw);
  world.kills++;
  world.killsThisWave++;
  world.xpThisWave += gained;

  if (player.mods.killHeal > 0 && player.alive) {
    const before = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + player.mods.killHeal);
    const healed = player.hp - before;
    if (healed >= 1) {
      spawnDamageText(world, player.x, player.y + player.h + 0.3, 0, `+${Math.round(healed)}`, [126, 240, 158], false);
    }
  }

  spawnDeathChunks(world, monster.x, monster.y + monster.h * 0.5, 0, def.body, monster.elite ? 22 : 12);
  spawnDust(world, monster.x, monster.y, 0, [150, 148, 160], 6);
  world.fx.shake = Math.max(world.fx.shake, monster.kind === 'brute' ? 0.55 : 0.32);
  world.events.emit('monsterKilled', {
    kind: monster.kind,
    x: monster.x,
    y: monster.y,
    xp: Math.round(gained),
    elite: monster.elite,
  });
}

/** 对玩家造成伤害；冲刺无敌 / 受击无敌 / 非战斗阶段都会被拦截。 */
export function damagePlayer(world: World, rawDamage: number, sourceX: number, attacker: Monster | null): number {
  const player = world.player;
  if (!player.alive) return 0;
  // 结算、选卡、暂停期间一律不结算伤害。
  if (world.phase !== 'playing') return 0;
  // 冲刺途中不会被打到，受击后也有一小段无敌。
  if (player.state === 'dash' || player.invuln > 0) return 0;

  const amount = Math.max(1, Math.round(rawDamage));
  player.hp -= amount;
  player.damageTaken += amount;
  world.damageTakenThisWave += amount;
  player.invuln = PLAYER_BASE.hitInvuln;
  player.hurtTimer = 0.24;
  player.state = 'hurt';
  player.stateTime = 0;
  player.attackWindup = 0;
  player.attackActive = 0;
  player.attackRecover = 0;
  player.spinAngle = 0;

  const dir = sourceX === player.x ? -player.facing : player.x < sourceX ? -1 : 1;
  player.vx = dir * PLAYER_BASE.hurtKnockback;
  player.vy = Math.max(player.vy, 5.2);

  world.fx.shake = Math.max(world.fx.shake, FX.shakeOnPlayerHit);
  world.fx.flash = 0.4;
  world.fx.hitStop = Math.min(FX.hitStopMax, world.fx.hitStop + 0.05);
  spawnHitSparks(world, player.x, player.y + player.h * 0.6, 0, [255, 118, 118], true);
  spawnDamageText(world, player.x, player.y + player.h + 0.45, 0, `-${amount}`, [255, 104, 104], true);

  // 荆棘护甲：反伤给攻击者。
  if (attacker && player.mods.thornsMul > 0) {
    const reflected = amount * player.mods.thornsMul;
    spawnDamageText(
      world,
      attacker.x,
      attacker.y + attacker.h + 0.3,
      0,
      `-${Math.round(reflected)}`,
      [180, 240, 255],
      false,
    );
    damageMonster(world, attacker, reflected, { knockX: 0, knockPower: 0, canCrit: false, source: 'thorns' });
  }

  if (player.hp <= 0) {
    player.hp = 0;
    player.alive = false;
    player.state = 'dead';
  }
  world.events.emit('playerDamaged', { amount, hp: player.hp, killed: !player.alive });
  return amount;
}

/** 判断怪物是否与玩家包围盒相交（冲刺判定等复用）。 */
export function monsterTouchesPlayerBox(world: World, monster: Monster, padding: number): boolean {
  const player = world.player;
  return monsterOverlapsBox(
    monster,
    player.x - player.w * 0.5 - padding,
    player.y - padding,
    player.x + player.w * 0.5 + padding,
    player.y + player.h + padding,
  );
}
