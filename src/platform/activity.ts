/**
 * 平台层 · 窗口活动状态监听。
 *
 * 需求 8：切到别的程序 → 游戏自动暂停；切回来 → 给几秒准备时间再继续。
 */

export interface ActivityObserver {
  dispose(): void;
}

export function observeActivity(onInactive: () => void, onActive: () => void, target: Window = window): ActivityObserver {
  const doc = target.document;
  const onVisibility = () => {
    if (doc.hidden) onInactive();
    else onActive();
  };
  const onBlur = () => onInactive();
  const onFocus = () => onActive();
  const onPageHide = () => onInactive();

  doc.addEventListener('visibilitychange', onVisibility);
  target.addEventListener('blur', onBlur);
  target.addEventListener('focus', onFocus);
  target.addEventListener('pagehide', onPageHide);

  return {
    dispose() {
      doc.removeEventListener('visibilitychange', onVisibility);
      target.removeEventListener('blur', onBlur);
      target.removeEventListener('focus', onFocus);
      target.removeEventListener('pagehide', onPageHide);
    },
  };
}
