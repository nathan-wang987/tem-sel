/**
 * 引擎层 → UI 的只读快照契约。
 *
 * React 只认识这个结构，完全不接触世界内部对象；
 * 每次发布都是一份新对象（不可变），配合 useSyncExternalStore 使用。
 */

import type { BestStats, Phase, SkillId } from './types';

export type SessionStatus = 'menu' | 'running';
export type WaveClearPhaseName = 'waveClear';

export interface SkillSnapshot {
  id: SkillId;
  name: string;
  en: string;
  keyLabel: string;
  keys: readonly string[];
  desc: string;
  icon: readonly string[];
  color: string;
  cooldown: number;
  cooldownTotal: number;
  ready: boolean;
  /** 该技能当前是否可用（例如满血时回血技能不可用）。 */
  usable: boolean;
}

export interface UpgradeChoiceSnapshot {
  id: string;
  name: string;
  en: string;
  desc: string;
  tier: string;
  color: string;
  stacks: number;
}

export interface WaveSummarySnapshot {
  wave: number;
  kills: number;
  xp: number;
  seconds: number;
  damageTaken: number;
  remaining: number;
}

export interface ToastSnapshot {
  id: number;
  text: string;
  tone: 'info' | 'good' | 'warn';
}

export interface UiSnapshot {
  status: SessionStatus;
  phase: Phase;
  /** 暂停原因：手动 / 切出窗口自动暂停 / 正在倒计时恢复。 */
  pauseReason: 'none' | 'manual' | 'auto' | 'resuming';
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpNeed: number;
  atk: number;
  wave: number;
  kills: number;
  runSeconds: number;
  monstersAlive: number;
  monstersRemaining: number;
  skills: SkillSnapshot[];
  upgradeChoices: UpgradeChoiceSnapshot[];
  pendingLevelUps: number;
  waveSummary: WaveSummarySnapshot | null;
  resumeIn: number | null;
  best: BestStats;
  hasSave: boolean;
  savedRun: { wave: number; level: number } | null;
  soundOn: boolean;
  storageOk: boolean;
  storageNote: string;
  fps: number;
  resolution: string;
  toast: ToastSnapshot | null;
  lastDeath: { wave: number; level: number; kills: number } | null;
}
