/**
 * 引擎层 · 可复现随机数（mulberry32）。
 * 模拟层所有随机都走这里，保证存档读档后行为一致、也便于测试。
 */

export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  get seed(): number {
    return this.state >>> 0;
  }

  set seed(value: number) {
    this.state = (value >>> 0) || 0x9e3779b9;
  }

  /** [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, maxExclusive: number): number {
    if (maxExclusive <= min) return min;
    return min + Math.floor(this.next() * (maxExclusive - min));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.min(items.length - 1, Math.floor(this.next() * items.length))];
  }

  /** 原地洗牌（Fisher-Yates）。 */
  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  /** 派生一个互不干扰的子随机源（不同用途不会互相串味）。 */
  fork(salt: number): Rng {
    return new Rng((Math.imul(this.state ^ salt, 0x85ebca6b) ^ (salt << 7)) >>> 0);
  }
}
