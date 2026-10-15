/**
 * 内容层 · 共享类型与实体结构。
 *
 * 这里的实体都是**长生命周期的可变对象**：创建一次放进入对象池，只改字段、不重新分配，
 * 这样长时间游玩也不会给 GC 堆越堆越大。
 */

import type { Solid } from '../engine/physics';

export type Rgb = readonly [number, number, number];

/** 游戏流程状态机：暂停 / 结算 / 升级选卡期间，逻辑时间都不推进。 */
export type Phase = 'playing' | 'paused' | 'waveClear' | 'levelUp' | 'gameOver';

export type MonsterKind = 'grunt' | 'assassin' | 'brute';
export type SkillId = 'attack' | 'spin' | 'dash' | 'heal';

export type PlayerState = 'idle' | 'run' | 'air' | 'attack' | 'spin' | 'dash' | 'heal' | 'hurt' | 'dead';
export type MonsterState = 'spawn' | 'chase' | 'windup' | 'attack' | 'recover' | 'hurt' | 'dead';

/** 升级加成累加出来的所有修正项。 */
export interface PlayerMods {
  atkMul: number;
  speedMul: number;
  maxHpBonus: number;
  cdMul: number;
  spinRadiusMul: number;
  spinDamageMul: number;
  dashDamageMul: number;
  dashInvulnBonus: number;
  healMul: number;
  critChance: number;
  critMul: number;
  killHeal: number;
  thornsMul: number;
  jumpMul: number;
  xpMul: number;
  knockbackMul: number;
  executeMul: number;
  airAttackMul: number;
}

export function createDefaultMods(): PlayerMods {
  return {
    atkMul: 1,
    speedMul: 1,
    maxHpBonus: 0,
    cdMul: 1,
    spinRadiusMul: 1,
    spinDamageMul: 1,
    dashDamageMul: 1,
    dashInvulnBonus: 0,
    healMul: 1,
    critChance: 0.05,
    critMul: 2,
    killHeal: 0,
    thornsMul: 0,
    jumpMul: 1,
    xpMul: 1,
    knockbackMul: 1,
    executeMul: 0,
    airAttackMul: 0,
  };
}

export interface Cooldowns {
  attack: number;
  spin: number;
  dash: number;
  heal: number;
}

export function createCooldowns(): Cooldowns {
  return { attack: 0, spin: 0, dash: 0, heal: 0 };
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1;

  hp: number;
  maxHp: number;
  atk: number;
  level: number;
  xp: number;
  xpNeed: number;

  onGround: boolean;
  jumpsLeft: number;
  coyote: number;
  jumpBuffer: number;
  landingSquash: number;

  state: PlayerState;
  stateTime: number;

  attackWindup: number;
  attackActive: number;
  attackRecover: number;
  comboIndex: number;
  comboWindow: number;
  swingHitIds: Int32Array;
  swingHitCount: number;

  invuln: number;
  hurtTimer: number;
  dashId: number;
  dashHits: number;

  cooldowns: Cooldowns;
  walkAnim: number;
  spinAngle: number;
  bodyRoll: number;
  attackSwing: number;

  mods: PlayerMods;
  alive: boolean;
  kills: number;
  damageDealt: number;
  damageTaken: number;
}

export interface Monster {
  active: boolean;
  id: number;
  kind: MonsterKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1;

  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  xpValue: number;
  mass: number;

  state: MonsterState;
  stateTime: number;
  onGround: boolean;
  attackCooldown: number;
  hitFlash: number;
  staggerTimer: number;
  aliveTime: number;
  animPhase: number;
  scale: number;
  elite: boolean;
  lastDashHitId: number;
  hasHitPlayer: boolean;
  spawnTimer: number;
  deadTimer: number;
}

export type ParticleKind = 'spark' | 'chunk' | 'dust' | 'ring' | 'ember' | 'slash';

export interface Particle {
  active: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  drag: number;
  gravity: number;
  r: number;
  g: number;
  b: number;
  /** 3D 盒子粒子（碎块）还是屏幕空间小方块（火花）。 */
  voxel: boolean;
  spin: number;
}

export interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  r: number;
  g: number;
  b: number;
  big: boolean;
}

/** 渲染层消费的表现层状态（镜头抖动、顿帧、闪光等）。 */
export interface WorldFx {
  shake: number;
  shakeSeed: number;
  hitStop: number;
  flash: number;
  cameraX: number;
  cameraY: number;
  zoom: number;
  runTime: number;
}

export interface IntermissionStats {
  wave: number;
  kills: number;
  xp: number;
  seconds: number;
  damageTaken: number;
  remaining: number;
}

export interface BestStats {
  level: number;
  wave: number;
  kills: number;
}

export type PropKind = 'pillar' | 'rubble' | 'crate' | 'torch' | 'banner' | 'bone';

export interface LevelProp {
  kind: PropKind;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotY: number;
  color: Rgb;
}

export interface Level {
  stage: number;
  solids: Solid[];
  props: LevelProp[];
  skyTop: Rgb;
  skyBottom: Rgb;
  fog: Rgb;
  groundA: Rgb;
  groundB: Rgb;
  groundEdge: Rgb;
}
