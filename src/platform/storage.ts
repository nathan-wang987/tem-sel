/**
 * 平台层 · 存档介质。
 *
 * 优先用 localStorage；如果浏览器禁用了存储（隐私模式 / file:// 限制），
 * 自动退回到内存实现并把 available 标为 false，游戏照常能玩，只是关掉就没了。
 */

import type { StorageLike } from '../game/persistence';

export interface StorageHandle {
  storage: StorageLike;
  available: boolean;
  /** 不可用时给 UI 的提示文案。 */
  reason: string;
}

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

export function createStorage(): StorageHandle {
  try {
    const probe = globalThis.localStorage;
    if (!probe) throw new Error('localStorage unavailable');
    const testKey = '__pixel_warden_probe__';
    probe.setItem(testKey, '1');
    probe.removeItem(testKey);
    return { storage: probe, available: true, reason: '' };
  } catch {
    return {
      storage: new MemoryStorage(),
      available: false,
      reason: '当前浏览器禁用了本地存储，进度只能保存在这次会话里。',
    };
  }
}
