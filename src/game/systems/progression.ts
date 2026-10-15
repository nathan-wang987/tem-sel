/**
 * 引擎层 · 成长系统：经验、升级、随机三选一加成。
 */

import { PLAYER_BASE, xpNeededForLevel } from '../config';
import { rollUpgrades, UPGRADES, type UpgradeDef } from '../content/upgrades';
import { createDefaultMods, type Phase } from '../types';
import type { World } from '../world';

/** 记录进入选卡界面前的阶段，选完卡后原样返回。 */
export function rememberPhase(world: World): void {
  if (world.phase === 'playing' || world.phase === 'waveClear') {
    world.phaseBeforeModal = world.phase;
  }
}

export function addXp(world: World, rawAmount: number): number {
  const player = world.player;
  const amount = rawAmount * player.mods.xpMul;
  player.xp += amount;
  let leveled = 0;
  while (player.xp >= player.xpNeed) {
    player.xp -= player.xpNeed;
    levelUp(world);
    leveled++;
  }
  return amount;
}

function levelUp(world: World): void {
  const player = world.player;
  player.level++;
  player.maxHp += PLAYER_BASE.maxHpPerLevel;
  player.atk += PLAYER_BASE.atkPerLevel;
  player.hp = player.maxHp;
  player.xpNeed = xpNeededForLevel(player.level);
  world.pendingLevelUps++;
}

/** 弹出三张随机加成卡，并把游戏冻结在选卡阶段。 */
export function openUpgradeChoice(world: World): void {
  rememberPhase(world);
  world.upgradeChoices = rollUpgrades(world.upgradeRng, 3);
  world.phase = 'levelUp';
}

export function chooseUpgrade(world: World, id: string): boolean {
  if (world.phase !== 'levelUp') return false;
  let picked: UpgradeDef | null = null;
  for (let i = 0; i < world.upgradeChoices.length; i++) {
    if (world.upgradeChoices[i].id === id) {
      picked = world.upgradeChoices[i];
      break;
    }
  }
  if (!picked) return false;

  picked.apply(world.player.mods, world.player);
  world.upgradeIds.push(picked.id);
  world.upgradeStacks.set(picked.id, (world.upgradeStacks.get(picked.id) ?? 0) + 1);

  if (world.pendingLevelUps > 0) world.pendingLevelUps--;

  if (world.pendingLevelUps > 0) {
    // 还攒着升级：直接发下一组卡，继续冻结。
    world.upgradeChoices = rollUpgrades(world.upgradeRng, 3);
  } else {
    world.upgradeChoices = [];
    const back: Phase = world.phaseBeforeModal === 'waveClear' ? 'waveClear' : 'playing';
    world.phase = back;
  }
  world.events.emit('upgradeChosen', { id: picked.id, name: picked.name });
  return true;
}

/** 读档时按顺序重放加成，保证属性与存档一致。 */
export function replayUpgrades(world: World, ids: readonly string[]): void {
  const player = world.player;
  player.mods = createDefaultMods();
  for (let i = 0; i < ids.length; i++) {
    const def = findUpgrade(ids[i]);
    if (!def) continue;
    def.apply(player.mods, player);
    world.upgradeIds.push(def.id);
    world.upgradeStacks.set(def.id, (world.upgradeStacks.get(def.id) ?? 0) + 1);
  }
}

function findUpgrade(id: string): UpgradeDef | null {
  for (let i = 0; i < UPGRADES.length; i++) {
    if (UPGRADES[i].id === id) return UPGRADES[i];
  }
  return null;
}
