/**
 * 引擎层 · 表现层对象（粒子 / 飘字）。
 *
 * 全部来自固定容量对象池：满了就丢新的，绝不扩容、绝不 new。
 * 死亡 / 命中 / 升级等表现都从这里取对象，生命周期结束立刻归还。
 */

import { ActiveList } from '../../engine/collections';
import type { Rgb } from '../types';
import type { FloatingText, Particle } from '../types';
import type { World } from '../world';

function createParticle(): Particle {
  return {
    active: false,
    kind: 'spark',
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    maxLife: 0,
    size: 1,
    drag: 0,
    gravity: 0,
    r: 255,
    g: 255,
    b: 255,
    voxel: false,
    spin: 0,
  };
}

function createText(): FloatingText {
  return {
    active: false,
    x: 0,
    y: 0,
    z: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    text: '',
    r: 255,
    g: 255,
    b: 255,
    big: false,
  };
}

export function createParticleList(capacity: number): ActiveList<Particle> {
  return new ActiveList<Particle>(capacity, createParticle);
}

export function createTextList(capacity: number): ActiveList<FloatingText> {
  return new ActiveList<FloatingText>(capacity, createText);
}

interface BurstOptions {
  count: number;
  color: Rgb;
  speed: number;
  spreadY?: number;
  gravity: number;
  drag?: number;
  life: number;
  size: number;
  voxel: boolean;
  kind: Particle['kind'];
  lift?: number;
}

function burst(world: World, x: number, y: number, z: number, options: BurstOptions): void {
  const rng = world.fxRng;
  const particles = world.particles;
  for (let i = 0; i < options.count; i++) {
    const p = particles.spawn();
    if (!p) return;
    const angle = rng.range(0, Math.PI * 2);
    const speed = options.speed * rng.range(0.45, 1.25);
    p.kind = options.kind;
    p.x = x + rng.range(-0.25, 0.25);
    p.y = y + rng.range(-0.25, 0.25);
    p.z = z + rng.range(-0.2, 0.2);
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.abs(Math.sin(angle)) * speed * (options.spreadY ?? 1) + (options.lift ?? 0);
    p.vz = rng.range(-0.4, 0.4) * speed * 0.2;
    p.life = options.life * rng.range(0.7, 1.2);
    p.maxLife = p.life;
    p.size = options.size * rng.range(0.7, 1.3);
    p.drag = options.drag ?? 1.6;
    p.gravity = options.gravity;
    p.voxel = options.voxel;
    p.spin = rng.range(-6, 6);
    const shade = rng.range(0.82, 1.18);
    p.r = Math.min(255, options.color[0] * shade);
    p.g = Math.min(255, options.color[1] * shade);
    p.b = Math.min(255, options.color[2] * shade);
  }
}

export function spawnHitSparks(world: World, x: number, y: number, z: number, color: Rgb, heavy: boolean): void {
  burst(world, x, y, z, {
    count: heavy ? 12 : 6,
    color,
    speed: heavy ? 11 : 7,
    gravity: -26,
    life: heavy ? 0.42 : 0.3,
    size: heavy ? 1.4 : 1,
    voxel: false,
    kind: 'spark',
  });
}

export function spawnDeathChunks(world: World, x: number, y: number, z: number, color: Rgb, count: number): void {
  burst(world, x, y + 0.6, z, {
    count,
    color,
    speed: 6,
    gravity: -30,
    life: 0.75,
    size: 0.34,
    voxel: true,
    kind: 'chunk',
    lift: 4,
  });
}

export function spawnDust(world: World, x: number, y: number, z: number, color: Rgb, count: number): void {
  burst(world, x, y, z, {
    count,
    color,
    speed: 3.2,
    spreadY: 0.35,
    gravity: -2,
    drag: 3.2,
    life: 0.5,
    size: 1.2,
    voxel: false,
    kind: 'dust',
  });
}

export function spawnAirJumpRing(world: World, x: number, y: number, z: number, color: Rgb): void {
  const p = world.particles.spawn();
  if (!p) return;
  p.kind = 'ring';
  p.x = x;
  p.y = y;
  p.z = z;
  p.vx = 0;
  p.vy = 0;
  p.vz = 0;
  p.life = 0.34;
  p.maxLife = p.life;
  p.size = 1.2;
  p.drag = 0;
  p.gravity = 0;
  p.voxel = false;
  p.r = color[0];
  p.g = color[1];
  p.b = color[2];
}

export function spawnSpinRing(world: World, x: number, y: number, z: number, radius: number, color: Rgb): void {
  const p = world.particles.spawn();
  if (!p) return;
  p.kind = 'ring';
  p.x = x;
  p.y = y;
  p.z = z;
  p.life = 0.3;
  p.maxLife = p.life;
  p.size = radius;
  p.gravity = 0;
  p.drag = 0;
  p.r = color[0];
  p.g = color[1];
  p.b = color[2];
}

export function spawnHealBurst(world: World, x: number, y: number, z: number, color: Rgb): void {
  burst(world, x, y + 1, z, {
    count: 14,
    color,
    speed: 3.4,
    spreadY: 1.6,
    gravity: -6,
    drag: 1.2,
    life: 0.85,
    size: 1,
    voxel: false,
    kind: 'spark',
  });
  spawnSpinRing(world, x, y + 1, z, 2.2, color);
}

export function spawnEmber(world: World, x: number, y: number, z: number, color: Rgb): void {
  burst(world, x, y, z, {
    count: 1,
    color,
    speed: 0.6,
    spreadY: 1,
    gravity: 1.4,
    drag: 0.3,
    life: 2.4,
    size: 0.9,
    voxel: false,
    kind: 'ember',
    lift: 1.6,
  });
}

export function spawnDamageText(
  world: World,
  x: number,
  y: number,
  z: number,
  text: string,
  color: Rgb,
  big: boolean,
): void {
  const item = world.texts.spawn();
  if (!item) return;
  item.x = x;
  item.y = y;
  item.z = z;
  item.vy = big ? 4.6 : 3.6;
  item.life = big ? 0.95 : 0.75;
  item.maxLife = item.life;
  item.text = text;
  item.r = color[0];
  item.g = color[1];
  item.b = color[2];
  item.big = big;
}

/** 每逻辑步更新粒子与飘字，过期的立即归还到对象池。 */
export function updateEffects(world: World, dt: number): void {
  const particles = world.particles;
  for (let i = 0; i < particles.count; i++) {
    const p = particles.items[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.releaseAt(i);
      i--;
      continue;
    }
    if (p.kind === 'ring') {
      p.size += dt * 14;
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.vy += p.gravity * dt;
    const damp = 1 - p.drag * dt;
    if (damp > 0) {
      p.vx *= damp;
      p.vy *= damp;
      p.vz *= damp;
    } else {
      p.vx = 0;
      p.vy = 0;
      p.vz = 0;
    }
    if (p.voxel && p.y < 0.2) {
      p.y = 0.2;
      p.vy = Math.abs(p.vy) * 0.35;
      p.vx *= 0.6;
    }
  }

  const texts = world.texts;
  for (let i = 0; i < texts.count; i++) {
    const t = texts.items[i];
    t.life -= dt;
    if (t.life <= 0) {
      texts.releaseAt(i);
      i--;
      continue;
    }
    t.y += t.vy * dt;
    t.vy = Math.max(1.1, t.vy - dt * 6.5);
  }
}

/** 环境氛围（菜单与游戏中共用）：偶尔飘起一颗火星。 */
export function updateAmbient(world: World, dt: number): void {
  world.ambientTimer -= dt;
  if (world.ambientTimer <= 0) {
    world.ambientTimer = world.fxRng.range(0.18, 0.5);
    spawnEmber(
      world,
      world.fx.cameraX + world.fxRng.range(-18, 18),
      world.fxRng.range(0.4, 2.4),
      world.fxRng.range(-8, 2),
      world.fxRng.chance(0.35) ? [255, 168, 84] : [255, 226, 156],
    );
  }
}
