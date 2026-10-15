/**
 * 界面层 · 右上角按钮组（音效 / 暂停 / 重开 / 返回菜单）。
 */

import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';

export interface TopBarProps {
  snapshot: UiSnapshot;
  session: GameSession;
}

export function TopBar({ snapshot, session }: TopBarProps) {
  const paused = snapshot.phase === 'paused';
  return (
    <div className="topbar">
      <button
        className="icon-btn"
        title={snapshot.soundOn ? '关闭音效 (M)' : '开启音效 (M)'}
        onClick={() => session.setSound(!snapshot.soundOn)}
      >
        {snapshot.soundOn ? '♪' : '♪̸'}
      </button>
      <button
        className="icon-btn"
        title={paused ? '继续 (P / Esc)' : '暂停 (P / Esc)'}
        onClick={() => session.togglePause()}
      >
        {paused ? '▶' : '❚❚'}
      </button>
      <button className="icon-btn" title="重新开始本局" onClick={() => session.restart()}>
        ↻
      </button>
    </div>
  );
}
