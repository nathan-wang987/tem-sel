/**
 * 引擎层 · 世界（模拟核心，无任何 DOM / React 依赖，可在 Node 里直接跑测试）。
 *
 * 职责：
 *  - 装配实体与系统，固定步长推进 "update(dt)" 管线；
 *  - 管理流程状态机：playing / paused / waveClear(结算) / levelUp(选卡) / gameOver；
 *  - 决定"什么时候不推进时间"：暂停、结算、选卡、死亡全部冻结（需求 6 / 8）。
 */

import { ActiveList } from '../engine/collections';
import { Emitter } from '../engine/events';
import type { Action, InputSource } from '../engine/input';
import type { MoveResult } from '../engine/physics';
import { SpatialGrid } from '../engine/spatial';
import { Rng } from '../engine/rng';
import { clamp, damp } from '../engine/math';
import { ARENA, CAMERA, FX, PLAYER_BASE, xpNeededForLevel } from './config';
import type { UpgradeDef } from './content/upgrades';
import type { WavePlan } from './content/waves';
import { createPlayer, resetPlayer } from './entities/player';
import { createLevel } from './level';
import type { RunSave } from './persistence';
import {
  createParticleList,
  createTextList,
  updateAmbient,
  updateEffects,
} from './systems/effects';
import { applyMonsterSeparation, createMonsterList, updateMonsters } from './systems/monsters';
import { updatePlayerMovement } from './systems/movement';
import { chooseUpgrade as applyUpgradeChoice, openUpgradeChoice, replayUpgrades } from './systems/progression';
import { updatePlayerSkills } from './systems/skills';
import { stageForWave, startWave, updateWaveDirector } from './systems/waves';
import type {
  FloatingText,
  IntermissionStats,
  Level,
  Monster,
  MonsterKind,
  Particle,
  Phase,
  Player,
  SkillId,
  WorldFx,
} from './types';

export interface WorldEvents {
  hit: { x: number; y: number; amount: number; crit: boolean; heavy: boolean; target: 'monster' | 'player' };
  monsterKilled: { kind: MonsterKind; x: number; y: number; xp: number; elite: boolean };
  monsterSpawned: { kind: MonsterKind; x: number; y: number; elite: boolean };
  monsterTelegraph: { kind: MonsterKind; x: number; y: number };
  playerDamaged: { amount: number; hp: number; killed: boolean };
  playerDied: { level: number; wave: number; kills: number };
  jump: { air: boolean };
  levelUp: { level: number };
  waveStarted: { wave: number; total: number; elite: boolean };
  waveCleared: { wave: number; kills: number; xp: number; seconds: number };
  skillUsed: { id: SkillId; combo: number };
  upgradeChosen: { id: string; name: string };
}

export class World {
  readonly events = new Emitter<WorldEvents>();
  readonly player: Player = createPlayer();
  readonly monsters: ActiveList<Monster> = createMonsterList(FX.maxMonsters);
  readonly particles: ActiveList<Particle> = createParticleList(FX.maxParticles);
  readonly texts: ActiveList<FloatingText> = createTextList(FX.maxTexts);
  readonly fx: WorldFx = {
    shake: 0,
    shakeSeed: 0.37,
    hitStop: 0,
    flash: 0,
    cameraX: 0,
    cameraY: 0,
    zoom: 1,
    runTime: 0,
  };

  readonly fxRng = new Rng(1);
  readonly combatRng = new Rng(2);
  readonly upgradeRng = new Rng(3);
  readonly waveRng = new Rng(4);
  readonly levelRng = new Rng(5);

  readonly pressedActions: Action[] = [];
  pressedCount = 0;

  readonly grid = new SpatialGrid(4);
  readonly queryIds: number[] = [];
  readonly moveResult: MoveResult = { hitWall: false, hitCeiling: false, landed: false };

  readonly intermission: IntermissionStats = {
    wave: 1,
    kills: 0,
    xp: 0,
    seconds: 0,
    damageTaken: 0,
    remaining: 0,
  };

  level: Level;
  phase: Phase = 'playing';
  pausedFrom: Phase = 'playing';
  phaseBeforeModal: Phase = 'playing';
  seed = 1;
  stage = 1;
  wave = 0;
  plan: WavePlan | null = null;
  spawnCursor = 0;
  waveElapsed = 0;
  spawnTimer = 0;
  kills = 0;
  killsThisWave = 0;
  xpThisWave = 0;
  damageTakenThisWave = 0;
  pendingLevelUps = 0;
  upgradeChoices: UpgradeDef[] = [];
  upgradeIds: string[] = [];
  upgradeStacks = new Map<string, number>();
  playTimeMs = 0;
  runActive = false;
  ambientTimer = 0;
  footstepTimer = 0;
  dashTrailTimer = 0;
  nextMonsterId = 1;
  nextDashId = 1;

  constructor(seed = 1) {
    this.seed = seed >>> 0 || 1;
    this.reseed();
    this.level = createLevel(this.seed, 1, this.levelRng);
    this.fx.cameraX = this.player.x;
    this.fx.cameraY = this.player.y;
  }

  get aliveCount(): number {
    return this.monsters.count;
  }

  get remainingInWave(): number {
    if (!this.plan) return 0;
    return Math.max(0, this.plan.total - this.spawnCursor) + this.monsters.count;
  }

  get isPaused(): boolean {
    return this.phase === 'paused';
  }

  private reseed(): void {
    this.fxRng.seed = (this.seed ^ 0x9e3779b9) >>> 0;
    this.combatRng.seed = (this.seed ^ 0x85ebca6b) >>> 0;
    this.upgradeRng.seed = (this.seed ^ 0xc2b2ae35) >>> 0;
    this.waveRng.seed = (this.seed ^ 0x27d4eb2f) >>> 0;
    this.levelRng.seed = (this.seed ^ 0x165667b1) >>> 0;
  }

  /** 开始全新的一局。 */
  newRun(seed?: number): void {
    this.seed = ((seed ?? Math.floor(Math.random() * 0xffffffff)) >>> 0) || 1;
    this.reseed();
    this.resetWorldState();
    resetPlayer(this.player, 0);
    this.level = createLevel(this.seed, 1, this.levelRng);
    this.stage = 1;
    this.runActive = true;
    this.fx.cameraX = this.player.x;
    this.fx.cameraY = this.player.y;
    startWave(this, 1);
  }

  /** 从存档恢复（存档只保留波次开头的状态）。 */
  loadRun(run: RunSave): void {
    this.seed = (run.seed >>> 0) || 1;
    this.reseed();
    this.resetWorldState();
    resetPlayer(this.player, 0);

    this.player.level = Math.max(1, Math.round(run.level));
    this.player.xpNeed = xpNeededForLevel(this.player.level);
    this.player.xp = clamp(run.xp, 0, this.player.xpNeed);
    this.player.maxHp = PLAYER_BASE.maxHp + (this.player.level - 1) * PLAYER_BASE.maxHpPerLevel;
    this.player.atk = PLAYER_BASE.atk + (this.player.level - 1) * PLAYER_BASE.atkPerLevel;
    replayUpgrades(this, run.upgrades);
    this.player.hp = clamp(run.hp, 1, this.player.maxHp);
    this.kills = Math.max(0, Math.round(run.kills));
    this.playTimeMs = Math.max(0, run.playTimeMs);

    this.stage = stageForWave(Math.max(1, run.wave));
    this.level = createLevel(this.seed, this.stage, this.levelRng);
    this.runActive = true;
    this.fx.cameraX = this.player.x;
    this.fx.cameraY = this.player.y;
    startWave(this, Math.max(1, Math.round(run.wave)));
  }

  private resetWorldState(): void {
    this.monsters.clear();
    this.particles.clear();
    this.texts.clear();
    this.kills = 0;
    this.killsThisWave = 0;
    this.xpThisWave = 0;
    this.damageTakenThisWave = 0;
    this.pendingLevelUps = 0;
    this.upgradeChoices = [];
    this.upgradeIds.length = 0;
    this.upgradeStacks.clear();
    this.playTimeMs = 0;
    this.plan = null;
    this.spawnCursor = 0;
    this.waveElapsed = 0;
    this.spawnTimer = 0;
    this.wave = 0;
    this.phase = 'playing';
    this.pausedFrom = 'playing';
    this.phaseBeforeModal = 'playing';
    this.fx.shake = 0;
    this.fx.flash = 0;
    this.fx.hitStop = 0;
    this.fx.runTime = 0;
    this.nextMonsterId = 1;
    this.nextDashId = 1;
  }

  /** 换关卡（每 5 波换一次场景主题）。 */
  rebuildLevel(stage: number): void {
    this.stage = stage;
    this.level = createLevel(this.seed, stage, this.levelRng);
    this.player.y = ARENA.floorY + 0.2;
    this.player.vy = 0;
  }

  /** 固定步长推进。paused / levelUp / gameOver 期间完全冻结（时间不前进）。 */
  update(dt: number, input: InputSource): void {
    this.fx.runTime += dt;
    if (this.phase === 'paused' || this.phase === 'levelUp' || this.phase === 'gameOver') return;

    // 顿帧：只让表现层继续走，逻辑与输入都停住。
    if (this.fx.hitStop > 0) {
      this.fx.hitStop = Math.max(0, this.fx.hitStop - dt);
      updateEffects(this, dt);
      this.updateCamera(dt);
      this.decayFx(dt);
      return;
    }

    this.pressedCount = input.drainPressed(this.pressedActions);
    const allowNewActions = this.phase === 'playing';

    updatePlayerMovement(this, dt, input);
    updatePlayerSkills(this, dt, allowNewActions);
    if (this.phase === 'playing') {
      updateMonsters(this, dt);
      applyMonsterSeparation(this);
    }
    updateWaveDirector(this, dt);
    updateEffects(this, dt);
    updateAmbient(this, dt);
    // 游玩计时（结算期间也继续走，和 HUD 上的计时一致）
    this.playTimeMs += dt * 1000;
    this.updateCamera(dt);
    this.decayFx(dt);

    // 攒够升级就弹三选一（弹窗期间彻底冻结，选完才能继续打）
    if (this.pendingLevelUps > 0 && (this.phase === 'playing' || this.phase === 'waveClear')) {
      openUpgradeChoice(this);
      this.events.emit('levelUp', { level: this.player.level });
    }

    if (!this.player.alive) this.endRun();
  }

  /** 菜单背景：只推进氛围粒子与镜头，不推进任何玩法逻辑。 */
  updateBackdrop(dt: number): void {
    updateEffects(this, dt);
    updateAmbient(this, dt);
    this.updateCamera(dt);
    this.decayFx(dt);
  }

  pause(): boolean {
    if (this.phase !== 'playing' && this.phase !== 'waveClear') return false;
    this.pausedFrom = this.phase;
    this.phase = 'paused';
    return true;
  }

  resume(): boolean {
    if (this.phase !== 'paused') return false;
    this.phase = this.pausedFrom === 'waveClear' ? 'waveClear' : 'playing';
    return true;
  }

  chooseUpgrade(id: string): boolean {
    return applyUpgradeChoice(this, id);
  }

  serializeRun(): RunSave | null {
    if (!this.runActive || this.phase === 'gameOver' || !this.player.alive) return null;
    return {
      seed: this.seed,
      level: this.player.level,
      xp: Math.round(this.player.xp * 100) / 100,
      hp: Math.round(this.player.hp * 100) / 100,
      wave: Math.max(1, this.wave),
      kills: this.kills,
      playTimeMs: Math.round(this.playTimeMs),
      upgrades: this.upgradeIds.slice(),
    };
  }

  private endRun(): void {
    this.phase = 'gameOver';
    this.runActive = false;
    this.events.emit('playerDied', { level: this.player.level, wave: this.wave, kills: this.kills });
  }

  private updateCamera(dt: number): void {
    const p = this.player;
    const lookAhead = CAMERA.lookAhead * p.facing * 0.45 + (p.state === 'dash' ? p.facing * 1.6 : 0);
    const targetX = p.x + lookAhead;
    const targetY = clamp(p.y * 0.4, 0, 3.2);
    this.fx.cameraX = damp(this.fx.cameraX, targetX, CAMERA.followLambda, dt);
    this.fx.cameraY = damp(this.fx.cameraY, targetY, CAMERA.verticalLambda, dt);
  }

  private decayFx(dt: number): void {
    this.fx.shake = Math.max(0, this.fx.shake - this.fx.shake * FX.shakeDecay * dt - dt * 0.05);
    this.fx.flash = Math.max(0, this.fx.flash - dt * 2.4);
  }
}
