/**
 * 界面层 · 阵亡结算。
 */

import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';

export interface GameOverOverlayProps {
  snapshot: UiSnapshot;
  session: GameSession;
}

export function GameOverOverlay({ snapshot, session }: GameOverOverlayProps) {
  const death = snapshot.lastDeath;
  return (
    <div className="overlay overlay-dim overlay-danger">
      <div className="modal modal-over">
        <h2 className="modal-title">你倒下了</h2>
        <div className="waveclear-grid">
          <span>坚持到</span>
          <span>第 {death?.wave ?? snapshot.wave} 波</span>
          <span>等级</span>
          <span>Lv.{death?.level ?? snapshot.level}</span>
          <span>击杀</span>
          <span>{death?.kills ?? snapshot.kills}</span>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => session.restart()}>
            再来一局
          </button>
          <button className="btn" onClick={() => session.backToMenu()}>
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
