/**
 * 引擎层 · 波次导演：一波一波派怪，越往后越强，并负责结算切换。
 *
 * 刷怪合法性（需求 10）：
 *  - 候选点必须落在场地内、身体不能和任何实心方块（墙 / 平台）重叠；
 *  - 与玩家保持最小距离，不会"贴脸刷怪"；
 *  - 与已有怪物保持包围盒间距，不允许一堆怪叠在同一个位置；
 *  - 随机尝试失败时会做一次确定性的全场地扫描兜底，保证波次不会卡死。
 */

import { clamp } from '../../engine/math';
import type { Solid } from '../../engine/physics';
import { ARENA, WAVE } from '../config';
import { MONSTER_DEFS } from '../content/monsters';
import { buildWave, maxAliveForWave, waveScaling } from '../content/waves';
import type { MonsterKind } from '../types';
import type { World } from '../world';
import { spawnMonsterAt } from './monsters';

export function stageForWave(wave: number): number {
  return Math.floor((wave - 1) / 5) + 1;
}

export function startWave(world: World, wave: number): void {
  const stage = stageForWave(wave);
  world.wave = wave;
  if (world.level.stage !== stage) world.rebuildLevel(stage);

  // 每波用 (种子, 波次) 派生出的确定性随机源，读档重开同一波时编排一致。
  world.waveRng.seed = (world.seed ^ Math.imul(wave, 0x9e3779b1)) >>> 0;
  const plan = buildWave(wave, world.waveRng);
  world.plan = plan;
  world.spawnCursor = 0;
  world.waveElapsed = 0;
  world.spawnTimer = 0;
  world.killsThisWave = 0;
  world.xpThisWave = 0;
  world.damageTakenThisWave = 0;
  world.phase = 'playing';
  world.events.emit('waveStarted', { wave, total: plan.total, elite: waveScaling(wave).elite });
}

export function updateWaveDirector(world: World, dt: number): void {
  const plan = world.plan;
  if (!plan) return;

  if (world.phase === 'waveClear') {
    world.intermission.remaining = Math.max(0, world.intermission.remaining - dt);
    if (world.intermission.remaining <= 0) startWave(world, world.wave + 1);
    return;
  }
  if (world.phase !== 'playing') return;

  world.waveElapsed += dt;
  world.spawnTimer -= dt;

  const maxAlive = maxAliveForWave(world.wave, WAVE.maxAliveBase, WAVE.maxAlivePerWave, WAVE.maxAliveCap);
  if (world.spawnTimer <= 0) {
    world.spawnTimer = WAVE.spawnTickInterval;
    while (world.spawnCursor < plan.spawns.length && world.monsters.count < maxAlive) {
      const entry = plan.spawns[world.spawnCursor];
      if (entry.time > world.waveElapsed) break;
      if (!trySpawnMonster(world, entry.kind, entry.elite)) break;
      world.spawnCursor++;
    }
  }

  // 计划里所有怪都已出场且场上清空 → 进入结算
  if (world.spawnCursor >= plan.spawns.length && world.monsters.count === 0) {
    beginWaveClear(world);
  }
}

function beginWaveClear(world: World): void {
  world.phase = 'waveClear';
  world.intermission.wave = world.wave;
  world.intermission.kills = world.killsThisWave;
  world.intermission.xp = Math.round(world.xpThisWave);
  world.intermission.seconds = world.waveElapsed;
  world.intermission.damageTaken = Math.round(world.damageTakenThisWave);
  world.intermission.remaining = WAVE.intermissionSeconds;
  world.events.emit('waveCleared', {
    wave: world.wave,
    kills: world.killsThisWave,
    xp: Math.round(world.xpThisWave),
    seconds: world.waveElapsed,
  });
}

/** 怪物身体是否和实心方块重叠（脚下那一层地面不算）。 */
function bodyBlocked(solids: readonly Solid[], x: number, y: number, w: number, h: number): boolean {
  const left = x - w * 0.5;
  const right = x + w * 0.5;
  const bottom = y + 0.06;
  const top = y + h;
  for (let i = 0; i < solids.length; i++) {
    const s = solids[i];
    if (right > s.left && left < s.left + s.w && top > s.bottom && bottom < s.bottom + s.h) return true;
  }
  return false;
}

/** 与已有怪物的包围盒是否靠得太近。 */
function tooCloseToMonsters(world: World, x: number, w: number): boolean {
  const monsters = world.monsters;
  for (let i = 0; i < monsters.count; i++) {
    const m = monsters.items[i];
    if (m.state === 'dead') continue;
    const required = (m.w + w) * 0.5 + 1.5;
    if (Math.abs(m.x - x) < required) return true;
  }
  return false;
}

export function trySpawnMonster(world: World, kind: MonsterKind, elite: boolean): boolean {
  const def = MONSTER_DEFS[kind];
  const sizeMul = elite ? 1.28 : 1;
  const w = def.w * sizeMul;
  const h = def.h * sizeMul;
  const rng = world.waveRng;
  const player = world.player;
  const scaling = waveScaling(world.wave);
  const minX = ARENA.minX + w * 0.5 + 0.5;
  const maxX = ARENA.maxX - w * 0.5 - 0.5;

  // 1) 随机尝试：偏向从玩家背后/远处两侧进场
  const bias: 1 | -1 = rng.chance(0.5) ? 1 : -1;
  for (let attempt = 0; attempt < 24; attempt++) {
    const side: 1 | -1 = (attempt % 2 === 0 ? bias : -bias) as 1 | -1;
    const distance = WAVE.minSpawnDistance + rng.range(0, 9);
    let x = player.x + side * distance;
    if (x < minX || x > maxX) x = player.x - side * distance;
    x = clamp(x, minX, maxX);
    if (Math.abs(x - player.x) < WAVE.minSpawnDistance * 0.62) continue;
    if (bodyBlocked(world.level.solids, x, ARENA.floorY, w, h)) continue;
    if (tooCloseToMonsters(world, x, w)) continue;
    return spawnMonsterAt(world, kind, elite, x, scaling) !== null;
  }

  // 2) 确定性兜底扫描：从离玩家最远的角落开始逐格找合法点
  const scanStep = 1.5;
  const startX = Math.abs(player.x - minX) > Math.abs(player.x - maxX) ? minX : maxX;
  const dir: 1 | -1 = startX === minX ? 1 : -1;
  let fallback = startX;
  let fallbackDistance = -1;
  for (let x = startX; dir > 0 ? x <= maxX : x >= minX; x += dir * scanStep) {
    if (Math.abs(x - player.x) < WAVE.minSpawnDistance * 0.62) continue;
    if (bodyBlocked(world.level.solids, x, ARENA.floorY, w, h)) continue;
    if (tooCloseToMonsters(world, x, w)) {
      // 记录一个"最不挤"的位置，作为最后的保底
      const distance = Math.abs(x - player.x);
      if (distance > fallbackDistance) {
        fallbackDistance = distance;
        fallback = x;
      }
      continue;
    }
    return spawnMonsterAt(world, kind, elite, x, scaling) !== null;
  }

  // 3) 实在没有空位：延后这一只（下个 tick 再试），避免叠怪或刷进墙里
  if (world.monsters.count === 0 && fallbackDistance > 0) {
    return spawnMonsterAt(world, kind, elite, fallback, scaling) !== null;
  }
  return false;
}
