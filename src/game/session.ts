/**
 * 引擎层 · 会话（把纯模拟内核接到浏览器上）。
 *
 * 这里负责：主循环、固定步长、暂停语义、切窗口自动暂停 + 恢复倒计时、
 * 存档节流写入、音效触发、以及给 React 推送 UI 快照。
 * 世界（World）本身仍然与 DOM 无关，方便单测。
 */

import { GameClock } from '../engine/clock';
import { observeActivity, type ActivityObserver } from '../platform/activity';
import { createAudioBus, type AudioBus } from '../platform/audio';
import { KeyboardInput } from '../platform/keyboard';
import { createStorage, type StorageHandle } from '../platform/storage';
import { PixelRenderer } from '../render/renderer';
import { FIXED_STEP } from './config';
import { SKILLS, SKILL_ORDER } from './content/skills';
import { TIER_COLOR } from './content/upgrades';
import { createSaveFile, clearStoredSave, loadSave, writeSave, type RunSave, type SaveFile, type StorageLike } from './persistence';
import type { SessionStatus, SkillSnapshot, ToastSnapshot, UiSnapshot, UpgradeChoiceSnapshot } from './snapshot';
import { World } from './world';

const RESUME_COUNTDOWN_SECONDS = 3;
const AUTOSAVE_INTERVAL = 5;
const PUBLISH_INTERVAL = 0.06;

export interface SessionOptions {
  storage?: StorageLike;
  audio?: AudioBus;
  resumeCountdownSeconds?: number;
  /** 宿主窗口（测试时可注入假实现）。 */
  host?: Window;
  requestFrame?: (callback: (timeMs: number) => void) => number;
  cancelFrame?: (handle: number) => void;
}

export class GameSession {
  readonly world: World;
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: PixelRenderer;
  private readonly clock = new GameClock({ fixedStep: FIXED_STEP, maxStepsPerFrame: 5, maxFrameDelta: 0.2 });
  private readonly input = new KeyboardInput();
  private readonly audio: AudioBus;
  private readonly storageHandle: StorageHandle;
  private readonly host: Window | null;
  private readonly requestFrame: (callback: (timeMs: number) => void) => number;
  private readonly cancelFrame: (handle: number) => void;
  private activity: ActivityObserver | null = null;
  private readonly resumeCountdown: number;
  private readonly disposers: Array<() => void> = [];
  private readonly listeners = new Set<() => void>();

  private save: SaveFile;
  private status: SessionStatus = 'menu';
  private snapshot: UiSnapshot;
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private publishTimer = 0;
  private saveTimer = AUTOSAVE_INTERVAL;
  private toastTimer = 0;
  private toastSeq = 0;
  private toast: ToastSnapshot | null = null;
  private fps = 60;
  private hidden = false;
  private autoPaused = false;
  private resumeIn: number | null = null;
  private lastDeath: { wave: number; level: number; kills: number } | null = null;
  private runFinished = false;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, options: SessionOptions = {}) {
    this.canvas = canvas;
    this.host = options.host ?? ((globalThis as unknown as { window?: Window }).window ?? null);
    this.requestFrame =
      options.requestFrame ??
      ((callback) => {
        if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
        return setTimeout(() => callback(Date.now()), 16) as unknown as number;
      });
    this.cancelFrame =
      options.cancelFrame ??
      ((handle) => {
        if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(handle);
        else clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
      });
    this.storageHandle = options.storage
      ? { storage: options.storage, available: true, reason: '' }
      : createStorage();
    this.audio = options.audio ?? createAudioBus();
    this.resumeCountdown = options.resumeCountdownSeconds ?? RESUME_COUNTDOWN_SECONDS;
    this.renderer = new PixelRenderer(canvas);
    this.save = loadSave(this.storageHandle.storage);
    this.world = new World((Math.random() * 0xffffffff) >>> 0 || 1);
    this.audio.setMuted(!this.save.settings.sound);
    this.snapshot = this.buildSnapshot();
  }

  // ───────────────────────────── 生命周期 ─────────────────────────────

  start(): void {
    if (this.rafId !== null || this.destroyed) return;
    if (this.host) {
      this.input.attach(this.host);
      this.activity = observeActivity(this.handleInactive, this.handleActive, this.host);
    }
    this.bindWorldEvents();
    this.bindDom();
    this.lastFrameTime = 0;
    this.rafId = this.requestFrame(this.frame);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): UiSnapshot {
    return this.snapshot;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.persistRun();
    this.destroyed = true;
    if (this.rafId !== null) this.cancelFrame(this.rafId);
    this.rafId = null;
    for (let i = 0; i < this.disposers.length; i++) this.disposers[i]();
    this.disposers.length = 0;
    this.input.dispose();
    this.activity?.dispose();
    this.activity = null;
    this.audio.dispose();
    this.listeners.clear();
  }

  // ───────────────────────────── 菜单 / 局内操作 ─────────────────────────────

  newGame(seed?: number): void {
    this.audio.unlock();
    this.save.run = null;
    this.lastDeath = null;
    this.runFinished = false;
    this.world.newRun(seed);
    this.status = 'running';
    this.resetRuntimeFlags();
    this.persistRun();
    this.pushToast('第 1 波 来了！', 'info');
    this.publish(true);
  }

  continueGame(): void {
    const run = this.save.run;
    if (!run) {
      this.newGame();
      return;
    }
    this.audio.unlock();
    this.lastDeath = null;
    this.runFinished = false;
    this.world.loadRun(run);
    this.status = 'running';
    this.resetRuntimeFlags();
    this.pushToast(`继续第 ${run.wave} 波`, 'info');
    this.publish(true);
  }

  restart(): void {
    this.audio.unlock();
    this.save.run = null;
    this.lastDeath = null;
    this.runFinished = false;
    this.world.newRun();
    this.status = 'running';
    this.resetRuntimeFlags();
    this.persistRun();
    this.pushToast('重新开始，第 1 波！', 'info');
    this.publish(true);
  }

  pause(manual = true): void {
    if (this.status !== 'running') return;
    if (!this.world.pause()) return;
    if (manual) this.autoPaused = false;
    this.resumeIn = null;
    this.input.clear();
    this.clock.resetAccumulator();
    this.persistRun();
    this.pushToast(manual ? '已暂停' : '窗口失去焦点，已自动暂停', 'info');
    this.publish(true);
  }

  resume(): void {
    if (this.status !== 'running') return;
    if (this.world.phase !== 'paused') return;
    this.resumeIn = null;
    this.autoPaused = false;
    this.world.resume();
    this.input.clear();
    this.clock.resetAccumulator();
    this.audio.unlock();
    this.publish(true);
  }

  togglePause(): void {
    if (this.status !== 'running') return;
    if (this.world.phase === 'paused') this.resume();
    else this.pause(true);
  }

  chooseUpgrade(id: string): void {
    if (this.world.chooseUpgrade(id)) {
      this.audio.play('ui');
      this.persistRun();
      this.publish(true);
    }
  }

  setSound(enabled: boolean): void {
    this.save.settings.sound = enabled;
    this.audio.setMuted(!enabled);
    if (enabled) this.audio.unlock();
    this.persistRun();
    this.publish(true);
  }

  eraseSave(): void {
    clearStoredSave(this.storageHandle.storage);
    this.save = createSaveFile();
    this.audio.setMuted(!this.save.settings.sound);
    this.lastDeath = null;
    this.pushToast('存档已清空', 'warn');
    this.publish(true);
  }

  backToMenu(): void {
    this.save.run = this.world.serializeRun();
    this.persistRun();
    this.status = 'menu';
    this.resumeIn = null;
    this.autoPaused = false;
    this.publish(true);
  }

  // ───────────────────────────── 主循环 ─────────────────────────────

  private frame = (timestamp: number): void => {
    if (this.destroyed) return;
    this.rafId = this.requestFrame(this.frame);

    const seconds = timestamp / 1000;
    let dt = this.lastFrameTime === 0 ? FIXED_STEP : seconds - this.lastFrameTime;
    this.lastFrameTime = seconds;
    if (!Number.isFinite(dt) || dt <= 0) dt = FIXED_STEP;
    if (dt > 0.25) dt = 0.25;
    this.fps = this.fps * 0.92 + (1 / Math.max(dt, 1 / 240)) * 0.08;

    // 恢复倒计时用真实时间推进；期间世界保持冻结。
    if (this.resumeIn !== null) {
      this.resumeIn = Math.max(0, this.resumeIn - dt);
      if (this.resumeIn <= 0) {
        this.resumeIn = null;
        this.autoPaused = false;
        this.world.resume();
        this.input.clear();
        this.clock.resetAccumulator();
        this.pushToast('继续战斗！', 'good');
        this.publish(true);
      }
    }

    const frozen =
      this.world.phase === 'paused' ||
      this.world.phase === 'levelUp' ||
      this.world.phase === 'gameOver' ||
      this.resumeIn !== null;

    if (this.status === 'running') {
      if (!frozen && !this.hidden) {
        this.clock.advance(dt, (step) => {
          this.world.update(step, this.input);
        });
      } else {
        // 冻结期间丢弃待处理按键：避免恢复后一次性触发（例如选卡时按的 1/2/3）
        this.input.clearPressed();
      }
      if (!frozen) {
        this.saveTimer -= dt;
        if (this.saveTimer <= 0) {
          this.saveTimer = AUTOSAVE_INTERVAL;
          this.persistRun();
        }
      }
    } else {
      // 主菜单：只推进背景氛围（火星、镜头缓动），不推进任何玩法逻辑。
      this.clock.advance(dt, (step) => {
        this.world.updateBackdrop(step);
      });
    }

    if (this.toast) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toast = null;
        this.publish(true);
      }
    }

    this.renderer.render(this.world, dt);
    this.publishTimer -= dt;
    if (this.publishTimer <= 0) {
      this.publishTimer = PUBLISH_INTERVAL;
      this.publish();
    }
  };

  private resetRuntimeFlags(): void {
    this.autoPaused = false;
    this.resumeIn = null;
    this.toastTimer = 0;
    this.saveTimer = AUTOSAVE_INTERVAL;
    this.clock.reset();
    this.input.clear();
  }

  // ───────────────────────────── 事件绑定 ─────────────────────────────

  private bindWorldEvents(): void {
    const events = this.world.events;
    this.disposers.push(
      events.on('skillUsed', (payload) => {
        this.audio.play(payload.id === 'attack' ? 'swing' : payload.id);
      }),
      events.on('hit', (payload) => {
        this.audio.play(payload.crit || payload.heavy ? 'crit' : 'hit');
      }),
      events.on('monsterKilled', () => {
        this.audio.play('kill');
      }),
      events.on('monsterTelegraph', (payload) => {
        if (payload.kind !== 'grunt') this.audio.play('telegraph');
      }),
      events.on('playerDamaged', () => {
        this.audio.play('hurt');
      }),
      events.on('jump', () => {
        this.audio.play('jump');
      }),
      events.on('waveStarted', (payload) => {
        this.audio.play('waveStart');
        this.pushToast(`第 ${payload.wave} 波 · 共 ${payload.total} 只${payload.elite ? ' · 精英波次' : ''}`, 'info');
        this.persistRun();
        this.publish(true);
      }),
      events.on('waveCleared', (payload) => {
        this.audio.play('waveClear');
        this.pushToast(`第 ${payload.wave} 波清空！`, 'good');
        this.persistRun();
        this.publish(true);
      }),
      events.on('levelUp', (payload) => {
        this.audio.play('levelUp');
        this.pushToast(`升级！Lv.${payload.level} 选择一项强化`, 'good');
        this.persistRun();
        this.publish(true);
      }),
      events.on('upgradeChosen', () => {
        this.publish(true);
      }),
      events.on('playerDied', (payload) => {
        this.audio.play('death');
        this.lastDeath = { wave: payload.wave, level: payload.level, kills: payload.kills };
        const best = this.save.best;
        best.wave = Math.max(best.wave, payload.wave);
        best.level = Math.max(best.level, payload.level);
        best.kills = Math.max(best.kills, payload.kills);
        // 一局结束后清掉进行中的存档，下次回来是全新一局，但保留最佳纪录。
        this.runFinished = true;
        this.save.run = null;
        this.persistRun();
        this.publish(true);
      }),
    );
  }

  private bindDom(): void {
    const host = this.host;
    if (!host) return;
    const onBeforeUnload = () => {
      this.persistRun();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      this.audio.unlock();
      // 暂停 / 继续
      if (event.code === 'Escape' || event.code === 'KeyP') {
        if (this.status === 'running') {
          event.preventDefault();
          this.togglePause();
        }
        return;
      }
      if (event.code === 'KeyM') {
        this.setSound(!this.save.settings.sound);
        return;
      }
      // 升级三选一：数字键直接挑卡
      if (this.world.phase === 'levelUp') {
        const index = event.code === 'Digit1' ? 0 : event.code === 'Digit2' ? 1 : event.code === 'Digit3' ? 2 : -1;
        if (index >= 0 && index < this.world.upgradeChoices.length) {
          event.preventDefault();
          this.chooseUpgrade(this.world.upgradeChoices[index].id);
        }
      }
    };
    const onPointerDown = (event: Event) => {
      this.audio.unlock();
      const pointer = event as PointerEvent;
      if (pointer.button !== 0) return;
      if (this.status !== 'running' || this.world.phase !== 'playing') return;
      this.input.press('attack');
      // 立刻释放，保证下次点击还能触发"新按下"
      this.input.release('attack');
    };
    host.addEventListener('beforeunload', onBeforeUnload);
    host.addEventListener('keydown', onKeyDown as EventListener);
    const target = this.canvas as unknown as EventTarget;
    const supportsEvents = typeof (target as { addEventListener?: unknown }).addEventListener === 'function';
    if (supportsEvents) target.addEventListener('pointerdown', onPointerDown);
    this.disposers.push(
      () => host.removeEventListener('beforeunload', onBeforeUnload),
      () => host.removeEventListener('keydown', onKeyDown as EventListener),
      () => {
        if (supportsEvents) target.removeEventListener('pointerdown', onPointerDown);
      },
    );
  }

  private handleInactive = (): void => {
    this.hidden = true;
    this.input.clear();
    if (this.status !== 'running') return;
    if (this.world.phase === 'playing' || this.world.phase === 'waveClear') {
      this.world.pause();
      this.autoPaused = true;
      this.resumeIn = null;
      this.clock.resetAccumulator();
      this.persistRun();
      this.publish(true);
    }
  };

  private handleActive = (): void => {
    this.hidden = false;
    this.lastFrameTime = 0;
    if (this.status === 'running' && this.autoPaused && this.world.phase === 'paused') {
      this.resumeIn = this.resumeCountdown;
      this.publish(true);
    }
  };

  // ───────────────────────────── 存档 ─────────────────────────────

  private persistRun(): void {
    if (!this.runFinished) {
      const run: RunSave | null = this.world.serializeRun();
      if (run) this.save.run = run;
    }
    const ok = writeSave(this.storageHandle.storage, this.save);
    if (!ok && this.storageHandle.available) this.pushToast('存档写入失败（存储可能已满）', 'warn');
  }

  private pushToast(text: string, tone: ToastSnapshot['tone']): void {
    this.toastSeq++;
    this.toast = { id: this.toastSeq, text, tone };
    this.toastTimer = 2.1;
  }

  private publish(force = false): void {
    this.snapshot = this.buildSnapshot();
    if (force) this.publishTimer = PUBLISH_INTERVAL;
    this.listeners.forEach((listener) => listener());
  }

  private buildSnapshot(): UiSnapshot {
    const world = this.world;
    const player = world.player;
    const skills: SkillSnapshot[] = [];
    for (let i = 0; i < SKILL_ORDER.length; i++) {
      const def = SKILLS[SKILL_ORDER[i]];
      const remaining = player.cooldowns[def.id];
      const total = def.cooldown * player.mods.cdMul;
      const full = def.id === 'heal' && player.hp >= player.maxHp;
      skills.push({
        id: def.id,
        name: def.name,
        en: def.en,
        keyLabel: def.keyLabel,
        keys: def.keys,
        desc: def.desc,
        icon: def.icon,
        color: `rgb(${def.color[0]},${def.color[1]},${def.color[2]})`,
        cooldown: remaining,
        cooldownTotal: total,
        ready: remaining <= 0 && !full,
        usable: !full,
      });
    }

    const upgradeChoices: UpgradeChoiceSnapshot[] = [];
    for (let i = 0; i < world.upgradeChoices.length; i++) {
      const def = world.upgradeChoices[i];
      upgradeChoices.push({
        id: def.id,
        name: def.name,
        en: def.en,
        desc: def.desc,
        tier: def.tier,
        color: TIER_COLOR[def.tier],
        stacks: world.upgradeStacks.get(def.id) ?? 0,
      });
    }

    const summary =
      world.phase === 'waveClear'
        ? {
            wave: world.intermission.wave,
            kills: world.intermission.kills,
            xp: world.intermission.xp,
            seconds: world.intermission.seconds,
            damageTaken: world.intermission.damageTaken,
            remaining: world.intermission.remaining,
          }
        : null;

    const paused = world.phase === 'paused';
    const pauseReason: UiSnapshot['pauseReason'] = !paused
      ? 'none'
      : this.resumeIn !== null
        ? 'resuming'
        : this.autoPaused
          ? 'auto'
          : 'manual';

    const resolution = this.renderer.resolution;
    return {
      status: this.status,
      phase: world.phase,
      pauseReason,
      hp: Math.max(0, Math.round(player.hp)),
      maxHp: Math.round(player.maxHp),
      level: player.level,
      xp: Math.round(player.xp),
      xpNeed: Math.round(player.xpNeed),
      atk: Math.round(player.atk * player.mods.atkMul * 10) / 10,
      wave: world.wave,
      kills: world.kills,
      runSeconds: Math.round(world.playTimeMs / 1000),
      monstersAlive: world.monsters.count,
      monstersRemaining: world.remainingInWave,
      skills,
      upgradeChoices,
      pendingLevelUps: world.pendingLevelUps,
      waveSummary: summary,
      resumeIn: this.resumeIn,
      best: { ...this.save.best },
      hasSave: this.save.run !== null,
      savedRun: this.save.run ? { wave: this.save.run.wave, level: this.save.run.level } : null,
      soundOn: this.save.settings.sound,
      storageOk: this.storageHandle.available,
      storageNote: this.storageHandle.reason,
      fps: Math.round(this.fps),
      resolution: `${resolution.width}x${resolution.height}`,
      toast: this.toast,
      lastDeath: this.lastDeath,
    };
  }
}
