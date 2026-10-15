/**
 * 内容层 · 数值配置。
 * 所有平衡性数字集中在此，方便调参；渲染与 UI 不硬编码任何数值。
 */

import { DEG } from '../engine/math';

export const ARENA = {
  /** 可站立的水平范围（墙在范围之外）。 */
  minX: -34,
  maxX: 34,
  /** 地面高度（脚底 y）。 */
  floorY: 0,
  /** 场景前后深度的一半（纯 3D 表现，玩法仍在一条线上）。 */
  depth: 9,
} as const;

export const GRAVITY = -52;
export const FIXED_STEP = 1 / 60;

/** 玩家基础数值。 */
export const PLAYER_BASE = {
  w: 1.15,
  h: 2.35,
  speed: 9.8,
  accel: 85,
  airAccel: 52,
  friction: 70,
  jumpVelocity: 18,
  airJumpMul: 0.96,
  maxJumpCount: 2,
  coyoteTime: 0.1,
  jumpBufferTime: 0.13,
  maxFallSpeed: 40,
  atk: 12,
  maxHp: 100,
  hitInvuln: 0.7,
  maxHpPerLevel: 14,
  atkPerLevel: 2,
  hurtKnockback: 6.5,
} as const;

/** 经验曲线：第 n 级升到 n+1 级所需经验。 */
export function xpNeededForLevel(level: number): number {
  return Math.round(48 * Math.pow(1.27, level - 1));
}

/** 相机参数（像素 3D 视角）。 */
export const CAMERA = {
  /** 相机在目标后上方的偏移。 */
  offsetY: 6.2,
  offsetZ: 17.5,
  /** 注视点在玩家上方的高度。 */
  lookAtY: 2.9,
  /** 水平跟随的朝向预判量。 */
  lookAhead: 3.4,
  followLambda: 7.5,
  /** 垂直跟随更慢，跳跃时画面不会晃太厉害。 */
  verticalLambda: 3.4,
  fovDeg: 38,
  near: 1.5,
} as const;

/** 波次节奏。 */
export const WAVE = {
  intermissionSeconds: 4.2,
  spawnTickInterval: 0.55,
  /** 场上同时存在的怪物上限（性能与体验双重考虑）。 */
  maxAliveBase: 7,
  maxAlivePerWave: 0.6,
  maxAliveCap: 14,
  /** 刷怪点与玩家的最小距离。 */
  minSpawnDistance: 11,
  /** 怪物包围盒之间要求保留的最小空气间隙（防止叠在一起）。 */
  minMonsterSpacing: 0.35,
} as const;

/** 表现层参数。 */
export const FX = {
  hitStopPerHit: 0.045,
  hitStopMax: 0.11,
  shakeOnHit: 0.16,
  shakeOnPlayerHit: 0.5,
  shakeDecay: 6.5,
  maxParticles: 420,
  maxTexts: 48,
  maxMonsters: 28,
} as const;

/** 渲染分辨率档位（内部像素画布），会根据性能自适应下调。 */
export const RENDER = {
  baseWidth: 400,
  baseHeight: 225,
  minWidth: 288,
  minHeight: 162,
  maxFaces: 3200,
  lightDir: [-0.42, 0.82, 0.39] as const,
  lightAmbient: 0.62,
  /** 3/4 视角俯角，营造像素 3D 的体积感。 */
  pitch: 11 * DEG,
} as const;
