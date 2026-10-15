/**
 * 引擎层 · 有界活跃列表。
 *
 * 长期运行不能越来越卡 / 越来越占内存：所有实体、粒子都放在**预分配**的定长数组里，
 * 用 count 表示活跃数量，回收时与末尾交换（swap-remove）。整个生命周期内不再分配新对象。
 */

export interface Active {
  active: boolean;
}

export class ActiveList<T extends Active> {
  readonly items: T[];
  count = 0;

  constructor(
    readonly capacity: number,
    create: (index: number) => T,
  ) {
    this.items = new Array<T>(capacity);
    for (let i = 0; i < capacity; i++) {
      const item = create(i);
      item.active = false;
      this.items[i] = item;
    }
  }

  get full(): boolean {
    return this.count >= this.capacity;
  }

  /** 申请一个槽位；达到上限时返回 null（调用方直接丢弃，不做扩容）。 */
  spawn(): T | null {
    if (this.count >= this.capacity) return null;
    const item = this.items[this.count];
    this.count++;
    item.active = true;
    return item;
  }

  /** 回收 index 处的对象（与最后一个活跃对象交换）。 */
  releaseAt(index: number): void {
    const last = this.count - 1;
    this.items[index].active = false;
    if (index !== last) {
      const tmp = this.items[index];
      this.items[index] = this.items[last];
      this.items[last] = tmp;
    }
    this.count = last;
  }

  forEach(fn: (item: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) fn(this.items[i], i);
  }

  clear(): void {
    for (let i = 0; i < this.count; i++) this.items[i].active = false;
    this.count = 0;
  }
}

export function swapRemove<T>(arr: T[], index: number): void {
  const last = arr.length - 1;
  if (index !== last) arr[index] = arr[last];
  arr.pop();
}
