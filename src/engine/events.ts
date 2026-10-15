/**
 * 引擎层 · 极简强类型事件总线（模拟层 → 上层 UI/音效 的单向通知）。
 */

export type Listener<T> = (payload: T) => void;

export class Emitter<Events extends object> {
  private handlers = new Map<keyof Events, Listener<never>[]>();

  on<K extends keyof Events>(type: K, fn: Listener<Events[K]>): () => void {
    let list = this.handlers.get(type);
    if (!list) {
      list = [];
      this.handlers.set(type, list);
    }
    list.push(fn as Listener<never>);
    return () => this.off(type, fn);
  }

  off<K extends keyof Events>(type: K, fn: Listener<Events[K]>): void {
    const list = this.handlers.get(type);
    if (!list) return;
    const index = list.indexOf(fn as Listener<never>);
    if (index >= 0) list.splice(index, 1);
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const list = this.handlers.get(type);
    if (!list || list.length === 0) return;
    // 允许监听者在回调中取消订阅：只在索引仍有效时调用。
    for (let i = 0; i < list.length; i++) {
      const fn = list[i];
      if (fn) (fn as Listener<Events[K]>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
