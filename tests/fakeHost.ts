/**
 * 测试用假宿主窗口：可控的 requestAnimationFrame、事件分发与 visibility 状态。
 * 有了它，会话层（暂停 / 切窗口 / 存档节流）也能在 Node 里跑真实测试。
 */

type Handler = (event: unknown) => void;

export interface FakeHost {
  /** 传给 GameSession 的宿主对象（结构上满足用到的 Window 能力）。 */
  window: Window;
  /** 推进指定毫秒并执行一次已登记的动画帧回调。 */
  advance(ms: number): void;
  dispatchWindow(type: string): void;
  dispatchDocument(type: string): void;
  setDocumentHidden(hidden: boolean): void;
  listenerCount(): number;
}

export function createFakeHost(): FakeHost {
  const windowListeners = new Map<string, Set<Handler>>();
  const documentListeners = new Map<string, Set<Handler>>();
  const rafCallbacks = new Map<number, (time: number) => void>();
  let nextHandle = 1;
  let now = 0;
  let hidden = false;

  const documentStub = {
    get hidden() {
      return hidden;
    },
    addEventListener(type: string, handler: Handler) {
      let set = documentListeners.get(type);
      if (!set) {
        set = new Set();
        documentListeners.set(type, set);
      }
      set.add(handler);
    },
    removeEventListener(type: string, handler: Handler) {
      documentListeners.get(type)?.delete(handler);
    },
  };

  const windowStub = {
    document: documentStub,
    addEventListener(type: string, handler: Handler) {
      let set = windowListeners.get(type);
      if (!set) {
        set = new Set();
        windowListeners.set(type, set);
      }
      set.add(handler);
    },
    removeEventListener(type: string, handler: Handler) {
      windowListeners.get(type)?.delete(handler);
    },
    requestAnimationFrame(callback: (time: number) => void) {
      const handle = nextHandle++;
      rafCallbacks.set(handle, callback);
      return handle;
    },
    cancelAnimationFrame(handle: number) {
      rafCallbacks.delete(handle);
    },
  };

  const dispatch = (map: Map<string, Set<Handler>>, type: string) => {
    const set = map.get(type);
    if (!set) return;
    for (const handler of Array.from(set)) handler({ type });
  };

  return {
    window: windowStub as unknown as Window,
    advance(ms: number) {
      now += ms;
      const callbacks = Array.from(rafCallbacks.values());
      rafCallbacks.clear();
      for (const callback of callbacks) callback(now);
    },
    dispatchWindow(type: string) {
      dispatch(windowListeners, type);
    },
    dispatchDocument(type: string) {
      dispatch(documentListeners, type);
    },
    setDocumentHidden(value: boolean) {
      hidden = value;
    },
    listenerCount() {
      let count = 0;
      windowListeners.forEach((set) => {
        count += set.size;
      });
      documentListeners.forEach((set) => {
        count += set.size;
      });
      return count;
    },
  };
}
