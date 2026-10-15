/**
 * 引擎层 · 玩家攻击与三个技能。
 *
 *  - attack 斩击：三段连击，第三段更重，冷却极短。
 *  - spin   旋风斩：原地转一圈，360° 范围伤害。
 *  - dash   影袭：向前猛冲，期间无敌，穿过怪物造成伤害。
 *  - heal   生命回复：立刻回血，冷却很长。
 * 冷却用完后必须等待（需求 3），暂停/选卡期间冷却也不会偷偷走。
 */

import { wasActionPressed } from '../../engine/input';
import { COMBO_MULTIPLIERS, COMBO_WINDOW, SKILLS, type SkillDef } from '../content/skills';
import type { Cooldowns } from '../types';
import type { World } from '../world';
import { damageMonster, isMonsterHittable, monsterOverlapsBox, monsterOverlapsCircle } from './combat';
import { spawnDamageText, spawnHealBurst, spawnDust, spawnHitSparks, spawnSpinRing } from './effects';

function tickCooldowns(cd: Cooldowns, dt: number): void {
  if (cd.attack > 0) cd.attack = Math.max(0, cd.attack - dt);
  if (cd.spin > 0) cd.spin = Math.max(0, cd.spin - dt);
  if (cd.dash > 0) cd.dash = Math.max(0, cd.dash - dt);
  if (cd.heal > 0) cd.heal = Math.max(0, cd.heal - dt);
}

/**
 * 玩家的实际攻击力 = 基础攻击 × 攻击力加成（升级/装备加成）。
 * 普攻、旋风斩、冲刺都从这里取，保证"攻击力 +15%"这类加成真的生效。
 */
export function attackPower(world: World): number {
  return world.player.atk * world.player.mods.atkMul;
}

function finishAction(world: World): void {
  const p = world.player;
  p.state = p.onGround ? 'idle' : 'air';
  p.stateTime = 0;
  p.attackWindup = 0;
  p.attackActive = 0;
  p.attackRecover = 0;
}

function hasHit(dedupe: Int32Array, count: number, id: number): boolean {
  const limit = Math.min(count, dedupe.length);
  for (let i = 0; i < limit; i++) {
    if (dedupe[i] === id) return true;
  }
  return false;
}

function markHit(player: { swingHitIds: Int32Array; swingHitCount: number }, id: number): void {
  player.swingHitIds[player.swingHitCount % player.swingHitIds.length] = id;
  player.swingHitCount++;
}

export function updatePlayerSkills(world: World, dt: number, allowNewActions: boolean): void {
  const p = world.player;
  tickCooldowns(p.cooldowns, dt);
  if (p.comboWindow > 0) p.comboWindow = Math.max(0, p.comboWindow - dt);

  switch (p.state) {
    case 'attack':
      advanceAttack(world, dt);
      break;
    case 'spin':
      advanceSpin(world, dt);
      break;
    case 'dash':
      advanceDash(world, dt);
      break;
    case 'heal':
      advanceHeal(world, dt);
      break;
    default:
      break;
  }

  if (!allowNewActions || !p.alive) return;

  const pressed = world.pressedActions;
  const count = world.pressedCount;
  if (wasActionPressed(pressed, count, 'attack')) tryAttack(world);
  if (wasActionPressed(pressed, count, 'spin')) trySpin(world);
  if (wasActionPressed(pressed, count, 'dash')) tryDash(world);
  if (wasActionPressed(pressed, count, 'heal')) tryHeal(world);
}

/** 普攻（含连击）。 */
export function tryAttack(world: World): boolean {
  const p = world.player;
  const def = SKILLS.attack;
  if (p.cooldowns.attack > 0 || p.state === 'dash' || p.hurtTimer > 0) return false;
  // 出招过程中再按：只有到后摇阶段才允许接下一段（连击手感）。
  if (p.state === 'attack' && p.attackWindup > 0) return false;

  const combo = p.state === 'attack' && p.comboWindow > 0 ? (p.comboIndex + 1) % 3 : 0;
  p.state = 'attack';
  p.stateTime = 0;
  p.attackWindup = def.windup;
  p.attackActive = def.active;
  p.attackRecover = def.recover;
  p.swingHitCount = 0;
  p.attackSwing = 0;
  p.comboIndex = combo;
  p.comboWindow = 0;
  p.cooldowns.attack = def.cooldown * p.mods.cdMul;
  p.vx *= 0.35;
  world.events.emit('skillUsed', { id: 'attack', combo });
  return true;
}

function advanceAttack(world: World, dt: number): void {
  const p = world.player;
  const def = SKILLS.attack;
  const total = def.windup + def.active + def.recover;
  p.stateTime += dt;
  p.attackSwing = Math.min(1, p.stateTime / total);

  if (p.attackWindup > 0) {
    p.attackWindup -= dt;
    return;
  }
  if (p.attackActive > 0) {
    p.attackActive -= dt;
    resolveMelee(world, def);
    return;
  }
  if (p.attackRecover > 0) {
    p.attackRecover -= dt;
    if (p.attackRecover <= 0) {
      finishAction(world);
      p.comboWindow = COMBO_WINDOW;
    }
  }
}

function resolveMelee(world: World, def: SkillDef): void {
  const p = world.player;
  const mul = COMBO_MULTIPLIERS[p.comboIndex] ?? 1;
  let damage = attackPower(world) * def.damageMul * mul;
  if (!p.onGround) damage *= 1 + p.mods.airAttackMul;
  const heavy = p.comboIndex === 2;
  const reach = def.reach;
  const left = p.facing > 0 ? p.x + 0.1 : p.x - reach;
  const right = p.facing > 0 ? p.x + reach : p.x - 0.1;
  const bottom = p.y;
  const top = p.y + p.h + 0.4;

  for (let i = 0; i < world.monsters.count; i++) {
    const m = world.monsters.items[i];
    if (!isMonsterHittable(m)) continue;
    if (hasHit(p.swingHitIds, p.swingHitCount, m.id)) continue;
    if (!monsterOverlapsBox(m, left, bottom, right, top)) continue;
    markHit(p, m.id);
    damageMonster(world, m, damage, {
      knockX: p.facing,
      knockPower: def.knockback * (heavy ? 1.6 : 1),
      heavy,
      source: 'attack',
    });
  }
}

export function trySpin(world: World): boolean {
  const p = world.player;
  const def = SKILLS.spin;
  if (p.cooldowns.spin > 0 || p.state === 'dash' || p.hurtTimer > 0) return false;
  p.state = 'spin';
  p.stateTime = 0;
  p.spinAngle = 0;
  p.swingHitCount = 0;
  p.cooldowns.spin = def.cooldown * p.mods.cdMul;
  p.vx *= 0.2;
  spawnSpinRing(world, p.x, p.y + p.h * 0.45, 0, def.radius * p.mods.spinRadiusMul * 0.6, def.color);
  world.events.emit('skillUsed', { id: 'spin', combo: 0 });
  return true;
}

function advanceSpin(world: World, dt: number): void {
  const p = world.player;
  const def = SKILLS.spin;
  const total = def.windup + def.active + def.recover;
  p.stateTime += dt;
  const progress = Math.min(1, p.stateTime / total);
  p.spinAngle = progress * Math.PI * 2;
  p.vx *= 1 - Math.min(1, dt * 6);

  const activeStart = def.windup;
  const activeEnd = def.windup + def.active;
  if (p.stateTime >= activeStart && p.stateTime <= activeEnd) {
    const radius = def.radius * p.mods.spinRadiusMul;
    const damage = attackPower(world) * def.damageMul * p.mods.spinDamageMul;
    const cy = p.y + p.h * 0.45;
    for (let i = 0; i < world.monsters.count; i++) {
      const m = world.monsters.items[i];
      if (!isMonsterHittable(m)) continue;
      if (hasHit(p.swingHitIds, p.swingHitCount, m.id)) continue;
      if (!monsterOverlapsCircle(m, p.x, cy, radius)) continue;
      markHit(p, m.id);
      const dir = m.x >= p.x ? 1 : -1;
      damageMonster(world, m, damage, { knockX: dir, knockPower: def.knockback, heavy: true, source: 'spin' });
    }
  }

  if (p.stateTime >= total) {
    p.spinAngle = 0;
    finishAction(world);
  }
}

export function tryDash(world: World): boolean {
  const p = world.player;
  const def = SKILLS.dash;
  if (p.cooldowns.dash > 0 || p.state === 'dash' || p.hurtTimer > 0) return false;
  p.state = 'dash';
  p.stateTime = 0;
  p.dashId = world.nextDashId++;
  p.dashHits = 0;
  p.swingHitCount = 0;
  p.cooldowns.dash = def.cooldown * p.mods.cdMul;
  // 冲刺期间无敌：不会被任何攻击命中。
  p.invuln = Math.max(p.invuln, def.duration + 0.05 + p.mods.dashInvulnBonus);
  p.vy = 0;
  spawnDust(world, p.x, p.y + 0.1, 0, [124, 224, 255], 8);
  world.events.emit('skillUsed', { id: 'dash', combo: 0 });
  return true;
}

function advanceDash(world: World, dt: number): void {
  const p = world.player;
  const def = SKILLS.dash;
  p.stateTime += dt;
  p.vx = p.facing * def.speed * (1 + (p.mods.speedMul - 1) * 0.4);
  p.vy = 0;
  p.invuln = Math.max(p.invuln, dt + p.mods.dashInvulnBonus);

  const damage = attackPower(world) * def.damageMul * p.mods.dashDamageMul;
  for (let i = 0; i < world.monsters.count; i++) {
    const m = world.monsters.items[i];
    if (!isMonsterHittable(m)) continue;
    if (m.lastDashHitId === p.dashId) continue;
    if (!monsterOverlapsBox(m, p.x - p.w * 0.5 - def.reach, p.y - 0.2, p.x + p.w * 0.5 + def.reach, p.y + p.h + 0.2)) {
      continue;
    }
    m.lastDashHitId = p.dashId;
    p.dashHits++;
    damageMonster(world, m, damage, { knockX: p.facing, knockPower: def.knockback, heavy: true, source: 'dash' });
    spawnHitSparks(world, m.x, m.y + m.h * 0.5, 0, [160, 240, 255], true);
  }

  // 冲刺拖影
  world.dashTrailTimer -= dt;
  if (world.dashTrailTimer <= 0) {
    world.dashTrailTimer = 0.035;
    spawnDust(world, p.x - p.facing * 0.5, p.y + 0.2, 0, [124, 224, 255], 3);
  }

  if (p.stateTime >= def.duration) {
    finishAction(world);
    p.vx = p.facing * def.speed * 0.35;
  }
}

export function tryHeal(world: World): boolean {
  const p = world.player;
  const def = SKILLS.heal;
  if (p.cooldowns.heal > 0 || p.state === 'dash' || p.hurtTimer > 0) return false;
  if (p.hp >= p.maxHp) return false;

  const amount = Math.round(p.maxHp * def.healPct * p.mods.healMul);
  const before = p.hp;
  p.hp = Math.min(p.maxHp, p.hp + amount);
  const healed = Math.round(p.hp - before);
  p.state = 'heal';
  p.stateTime = 0;
  p.cooldowns.heal = def.cooldown * p.mods.cdMul;
  p.vx *= 0.2;
  spawnHealBurst(world, p.x, p.y, 0, def.color);
  if (healed > 0) {
    spawnDamageText(world, p.x, p.y + p.h + 0.5, 0, `+${healed}`, [126, 240, 158], true);
  }
  world.events.emit('skillUsed', { id: 'heal', combo: 0 });
  return true;
}

function advanceHeal(world: World, dt: number): void {
  const p = world.player;
  const def = SKILLS.heal;
  p.stateTime += dt;
  p.vx *= 1 - Math.min(1, dt * 8);
  if (p.stateTime >= def.windup + def.active + def.recover) finishAction(world);
}
