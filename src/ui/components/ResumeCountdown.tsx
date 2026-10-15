/**
 * 界面层 · 切回窗口后的准备倒计时（需求 8）。
 */

import type { UiSnapshot } from '../../game/snapshot';

export function ResumeCountdown({ snapshot }: { snapshot: UiSnapshot }) {
  if (snapshot.resumeIn === null) return null;
  const seconds = Math.max(1, Math.ceil(snapshot.resumeIn));
  return (
    <div className="overlay overlay-countdown">
      <div className="countdown">
        <div className="countdown-number">{seconds}</div>
        <div className="countdown-text">准备…</div>
      </div>
    </div>
  );
}
