/**
 * 界面层 · 把游戏会话接进 React。
 *
 * 用 useSyncExternalStore 订阅快照：世界（模拟层）不关心 React，
 * React 也不会因为逐帧更新而重渲染——会话以 ~16Hz 推送不可变快照。
 */

import { useCallback, useSyncExternalStore } from 'react';
import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';

export function useSessionSnapshot(session: GameSession | null): UiSnapshot | null {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!session) return () => {};
      return session.subscribe(listener);
    },
    [session],
  );
  const getSnapshot = useCallback(() => (session ? session.getSnapshot() : null), [session]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
