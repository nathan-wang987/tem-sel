/**
 * 引擎层 · 怪物实体、AI 状态机与互相分离。
 *
 * 三种行为共用一套状态机：
 *   spawn → chase → windup(明显前摇) → attack → recover → chase
 * 刺影前摇最长（玩家有充足反应时间），石魔带超级护甲不会被普攻打断。
 */

import { ActiveList } from '../../engine/collections';
import { clamp } from '../../engine/math';
import { moveAndCollide } from '../../engine/physics';
import { ARENA, GRAVITY, PLAYER_BASE, WAVE } from '../config';
import { MONSTER_DEFS } from '../content/monsters';
import type { WaveScaling } from '../content/waves';
import type { Monster, MonsterKind } from '../types';
import type { World } from '../world';
import { damagePlayer } from './combat';
import { spawnDust } from './effects';

function createMonster(): Monster {
  return {
    active: false,
    id: 0,
    kind: 'grunt',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 1,
    h: 1,
    facing: 1,
    hp: 1,
    maxHp: 1,
    damage: 1,
    speed: 1,
    xpValue: 0,
    mass: 1,
    state: 'spawn',
    stateTime: 0,
    onGround: true,
    attackCooldown: 0,
    hitFlash: 0,
    staggerTimer: 0,
    aliveTime: 0,
    animPhase: 0,
    scale: 1,
    elite: false,
    lastDashHitId: -1,
    hasHitPlayer: false,
    spawnTimer: 0,
    deadTimer: 0,
  };
}

export function createMonsterList(capacity: number): ActiveList<Monster> {
  return new ActiveList<Monster>(capacity, createMonster);
}

export function spawnMonsterAt(
  world: World,
  kind: MonsterKind,
  elite: boolean,
  x: number,
  scaling: WaveScaling,
): Monster | null {
  const monster = world.monsters.spawn();
  if (!monster) return null;
  const def = MONSTER_DEFS[kind];
  const sizeMul = elite ? 1.28 : 1;

  monster.id = world.nextMonsterId++;
  monster.kind = kind;
  monster.x = x;
  monster.y = ARENA.floorY;
  monster.vx = 0;
  monster.vy = 0;
  monster.w = def.w * sizeMul;
  monster.h = def.h * sizeMul;
  monster.facing = world.player.x >= x ? 1 : -1;
  monster.maxHp = Math.round(def.hp * scaling.hp * (elite ? 2.3 : 1));
  monster.hp = monster.maxHp;
  monster.damage = def.damage * scaling.damage * (elite ? 1.3 : 1);
  monster.speed = def.speed * scaling.speed;
  monster.xpValue = def.xp * scaling.xp * (elite ? 2.5 : 1);
  monster.mass = def.mass * sizeMul;
  monster.state = 'spawn';
  monster.stateTime = 0;
  monster.onGround = true;
  monster.attackCooldown = 0.4;
  monster.hitFlash = 0;
  monster.staggerTimer = 0;
  monster.aliveTime = 0;
  monster.animPhase = world.fxRng.range(0, 6.28);
  monster.scale = sizeMul;
  monster.elite = elite;
  monster.lastDashHitId = -1;
  monster.hasHitPlayer = false;
  monster.spawnTimer = def.spawnTime;
  monster.deadTimer = 0;

  spawnDust(world, x, ARENA.floorY, 0, elite ? [255, 214, 120] : [140, 140, 160], elite ? 14 : 8);
  world.events.emit('monsterSpawned', { kind, x, y: ARENA.floorY, elite });
  return monster;
}

export function updateMonsters(world: World, dt: number): void {
  const monsters = world.monsters;
  const player = world.player;
  const result = world.moveResult;

  for (let i = 0; i < monsters.count; i++) {
    const m = monsters.items[i];
    const def = MONSTER_DEFS[m.kind];
    m.stateTime += dt;
    m.aliveTime += dt;
    m.animPhase += dt * (m.state === 'chase' ? m.speed * 1.6 : 3.4);
    if (m.hitFlash > 0) m.hitFlash = Math.max(0, m.hitFlash - dt * 5);
    if (m.attackCooldown > 0) m.attackCooldown = Math.max(0, m.attackCooldown - dt);

    switch (m.state) {
      case 'spawn': {
        m.spawnTimer -= dt;
        m.vx = 0;
        if (m.spawnTimer <= 0) {
          m.state = 'chase';
          m.stateTime = 0;
          spawnDust(world, m.x, m.y, 0, [170, 170, 190], 6);
        }
        break;
      }
      case 'dead': {
        m.deadTimer -= dt;
        if (m.deadTimer <= 0) {
          monsters.releaseAt(i);
          i--;
          continue;
        }
        break;
      }
      case 'hurt': {
        m.staggerTimer -= dt;
        m.vx *= 1 - Math.min(1, dt * 6);
        if (m.staggerTimer <= 0) {
          m.state = 'chase';
          m.stateTime = 0;
        }
        break;
      }
      case 'chase': {
        const dx = player.x - m.x;
        const dy = player.y - m.y;
        const dir: 1 | -1 = dx >= 0 ? 1 : -1;
        m.facing = dir;
        const inRange = Math.abs(dx) <= def.attackRange && dy > -1.6 && dy < m.h + 0.8;
        if (inRange) {
          m.vx *= 1 - Math.min(1, dt * 10);
          if (m.attackCooldown <= 0 && player.alive) {
            m.state = 'windup';
            m.stateTime = 0;
            m.hasHitPlayer = false;
            m.vx = 0;
            world.events.emit('monsterTelegraph', { kind: m.kind, x: m.x, y: m.y });
          }
        } else {
          const target = dir * m.speed;
          const accel = def.speed * 9;
          m.vx += clamp(target - m.vx, -accel * dt, accel * dt);
        }
        break;
      }
      case 'windup': {
        m.vx *= 1 - Math.min(1, dt * 12);
        if (m.stateTime >= def.windup) {
          m.state = 'attack';
          m.stateTime = 0;
          m.hasHitPlayer = false;
        }
        break;
      }
      case 'attack': {
        if (m.kind === 'brute') m.vx *= 1 - Math.min(1, dt * 12);
        else m.vx = m.facing * def.lungeSpeed;
        if (!m.hasHitPlayer && m.stateTime <= def.active + 0.02) {
          const reach = def.attackRange * 0.92;
          const left = m.facing > 0 ? m.x : m.x - reach;
          const right = m.facing > 0 ? m.x + reach : m.x;
          const bottom = m.y + 0.1;
          const top = m.y + m.h;
          if (
            player.x - player.w * 0.5 < right &&
            player.x + player.w * 0.5 > left &&
            player.y < top &&
            player.y + player.h > bottom
          ) {
            m.hasHitPlayer = true;
            damagePlayer(world, m.damage, m.x, m);
          }
        }
        if (m.stateTime >= def.active) {
          m.state = 'recover';
          m.stateTime = 0;
          m.attackCooldown = def.cooldown;
        }
        break;
      }
      case 'recover': {
        m.vx *= 1 - Math.min(1, dt * 8);
        if (m.stateTime >= def.recover) {
          m.state = 'chase';
          m.stateTime = 0;
        }
        break;
      }
    }

    // 重力 + 碰撞解算
    m.vy += GRAVITY * dt;
    if (m.vy < -PLAYER_BASE.maxFallSpeed) m.vy = -PLAYER_BASE.maxFallSpeed;
    moveAndCollide(m, m.vx * dt, m.vy * dt, world.level.solids, result);
    m.onGround = result.landed;
    if (result.landed) m.vy = 0;
    if (result.hitWall) m.vx = 0;

    const halfW = m.w * 0.5;
    if (m.x < ARENA.minX + halfW) {
      m.x = ARENA.minX + halfW;
      m.vx = 0;
    } else if (m.x > ARENA.maxX - halfW) {
      m.x = ARENA.maxX - halfW;
      m.vx = 0;
    }
    if (m.y < ARENA.floorY - 12) {
      m.y = ARENA.floorY;
      m.vy = 0;
    }
  }
}

/**
 * 怪物互相分离：不允许叠在同一个位置（需求 10）。
 * 空间网格做宽阶段，体重越大推得越少，最后再做一次墙体/边界校正。
 */
export function applyMonsterSeparation(world: World): void {
  const monsters = world.monsters;
  const grid = world.grid;
  grid.clear();
  for (let i = 0; i < monsters.count; i++) {
    const m = monsters.items[i];
    if (m.state === 'dead' || m.state === 'spawn') continue;
    grid.insert(i, m.x, m.y + m.h * 0.5, m.w * 0.5, m.h * 0.5);
  }

  const out = world.queryIds;
  for (let i = 0; i < monsters.count; i++) {
    const a = monsters.items[i];
    if (a.state === 'dead' || a.state === 'spawn') continue;
    const count = grid.query(a.x - a.w - 2, a.y, a.x + a.w + 2, a.y + a.h, out);
    for (let k = 0; k < count; k++) {
      const j = out[k];
      if (j <= i || j >= monsters.count) continue;
      const b = monsters.items[j];
      if (b.state === 'dead' || b.state === 'spawn') continue;
      const dx = b.x - a.x;
      const dist = Math.abs(dx);
      const required = (a.w + b.w) * 0.5 + WAVE.minMonsterSpacing;
      if (dist >= required) continue;
      const dir = dx === 0 ? (i % 2 === 0 ? 1 : -1) : dx > 0 ? 1 : -1;
      const push = (required - dist) * 0.55;
      const total = a.mass + b.mass;
      displace(world, a, -dir * push * ((b.mass / total) * 2));
      displace(world, b, dir * push * ((a.mass / total) * 2));
    }
  }

  // 玩家优先：把贴脸的怪物轻轻推开，避免怪物和玩家完全重叠。
  const player = world.player;
  for (let i = 0; i < monsters.count; i++) {
    const m = monsters.items[i];
    if (m.state === 'dead' || m.state === 'spawn') continue;
    const dx = m.x - player.x;
    const dist = Math.abs(dx);
    const required = (m.w + player.w) * 0.5 * 0.85;
    if (dist >= required) continue;
    const dir = dx === 0 ? (m.id % 2 === 0 ? 1 : -1) : dx > 0 ? 1 : -1;
    displace(world, m, dir * (required - dist) * 0.75);
  }

}

/** 水平推挤并按墙体/边界校正。 */
function displace(world: World, monster: Monster, dx: number): void {
  if (dx === 0) return;
  const before = monster.x;
  monster.x += dx;
  const halfW = monster.w * 0.5;
  const minX = ARENA.minX + halfW;
  const maxX = ARENA.maxX - halfW;
  if (monster.x < minX) monster.x = minX;
  if (monster.x > maxX) monster.x = maxX;
  const solids = world.level.solids;
  for (let i = 0; i < solids.length; i++) {
    const s = solids[i];
    const overlapping =
      monster.x - halfW < s.left + s.w &&
      monster.x + halfW > s.left &&
      monster.y < s.bottom + s.h &&
      monster.y + monster.h > s.bottom;
    if (overlapping) {
      monster.x = before;
      break;
    }
  }
}
