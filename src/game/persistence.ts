/**
 * 引擎层 · 存档格式与读写（需求 7）。
 *
 * 存档只保存"可重建"的最小信息：种子、等级、经验、血量、波次、已选加成。
 * 读取时会做完整校验与钳制，坏档 / 老档不会把游戏搞崩。
 */

import type { BestStats } from './types';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'pixel-warden.save.v1';

export interface RunSave {
  seed: number;
  level: number;
  xp: number;
  hp: number;
  wave: number;
  kills: number;
  playTimeMs: number;
  upgrades: string[];
}

export interface SaveFile {
  version: number;
  savedAt: number;
  run: RunSave | null;
  best: BestStats;
  settings: {
    sound: boolean;
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createSaveFile(): SaveFile {
  return {
    version: SAVE_VERSION,
    savedAt: 0,
    run: null,
    best: { level: 1, wave: 1, kills: 0 },
    settings: { sound: true },
  };
}

function toInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

function toFloat(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}

/** 把任意来源的数据规整成可信的存档对象。 */
export function normalizeSave(raw: unknown): SaveFile {
  const file = createSaveFile();
  if (!raw || typeof raw !== 'object') return file;
  const source = raw as Partial<SaveFile>;
  file.version = toInt(source.version, SAVE_VERSION, 1, SAVE_VERSION);
  file.savedAt = toInt(source.savedAt, 0, 0, Number.MAX_SAFE_INTEGER);

  const best = source.best as Partial<BestStats> | undefined;
  if (best && typeof best === 'object') {
    file.best.level = toInt(best.level, 1, 1, 999);
    file.best.wave = toInt(best.wave, 1, 1, 9999);
    file.best.kills = toInt(best.kills, 0, 0, 9999999);
  }

  const settings = source.settings as Partial<SaveFile['settings']> | undefined;
  if (settings && typeof settings === 'object') {
    file.settings.sound = settings.sound !== false;
  }

  const run = source.run as Partial<RunSave> | undefined;
  if (run && typeof run === 'object' && run.seed !== undefined) {
    file.run = {
      seed: toInt(run.seed, 1, 1, 0xffffffff),
      level: toInt(run.level, 1, 1, 999),
      xp: toFloat(run.xp, 0, 0, 1e9),
      hp: toFloat(run.hp, 1, 1, 1e6),
      wave: toInt(run.wave, 1, 1, 9999),
      kills: toInt(run.kills, 0, 0, 9999999),
      playTimeMs: toFloat(run.playTimeMs, 0, 0, 1e12),
      upgrades: Array.isArray(run.upgrades)
        ? run.upgrades.filter((id): id is string => typeof id === 'string').slice(0, 400)
        : [],
    };
  }
  return file;
}

export function loadSave(storage: StorageLike): SaveFile {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return createSaveFile();
    return normalizeSave(JSON.parse(raw));
  } catch {
    return createSaveFile();
  }
}

export function writeSave(storage: StorageLike, file: SaveFile): boolean {
  try {
    file.version = SAVE_VERSION;
    file.savedAt = Date.now();
    storage.setItem(SAVE_KEY, JSON.stringify(file));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredSave(storage: StorageLike): void {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* 忽略：存储不可用时无需处理 */
  }
}
