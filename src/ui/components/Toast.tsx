/**
 * 界面层 · 轻提示（波次提醒 / 存档提示 / 自动暂停）。
 */

import type { ToastSnapshot } from '../../game/snapshot';

export function Toast({ toast }: { toast: ToastSnapshot | null }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.tone}`} key={toast.id}>
      {toast.text}
    </div>
  );
}
