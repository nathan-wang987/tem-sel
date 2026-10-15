/**
 * 界面层 · 暂停面板。
 */

import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';

export interface PauseOverlayProps {
  snapshot: UiSnapshot;
  session: GameSession;
}

export function PauseOverlay({ snapshot, session }: PauseOverlayProps) {
  const auto = snapshot.pauseReason === 'auto';
  return (
    <div className="overlay overlay-dim">
      <div className="modal modal-pause">
        <h2 className="modal-title">已暂停</h2>
        <p className="modal-sub">
          {auto ? '窗口失去焦点，游戏已自动停下（时间不会前进）' : '暂停期间时间不会前进，怪也不会动'}
        </p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => session.resume()}>
            继续游戏
          </button>
          <button className="btn" onClick={() => session.restart()}>
            重新开始
          </button>
          <button className="btn" onClick={() => session.backToMenu()}>
            返回主菜单
          </button>
          <button className="btn btn-danger" onClick={() => session.eraseSave()}>
            清空存档
          </button>
        </div>
        <p className="modal-hint">按 P 或 Esc 也可以继续</p>
      </div>
    </div>
  );
}
