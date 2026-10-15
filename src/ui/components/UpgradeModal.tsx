/**
 * 界面层 · 升级三选一。
 *
 * 需求 6：没选完不能继续打（世界层会把时间完全冻结）。
 */

import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';

export interface UpgradeModalProps {
  snapshot: UiSnapshot;
  session: GameSession;
}

export function UpgradeModal({ snapshot, session }: UpgradeModalProps) {
  return (
    <div className="overlay overlay-dim">
      <div className="modal modal-upgrade">
        <h2 className="modal-title">
          升级！Lv.{snapshot.level}
          <span className="modal-sub">生命与攻击提升，并回满血量 · 选择一项强化</span>
        </h2>
        <div className="cards">
          {snapshot.upgradeChoices.map((choice, index) => (
            <button
              key={choice.id}
              className={`card card-${choice.tier}`}
              onClick={() => session.chooseUpgrade(choice.id)}
              style={{ borderColor: choice.color }}
            >
              <span className="card-index">{index + 1}</span>
              <span className="card-tier" style={{ color: choice.color }}>
                {choice.tier === 'epic' ? '史诗' : choice.tier === 'rare' ? '稀有' : '普通'}
              </span>
              <span className="card-name">{choice.name}</span>
              <span className="card-en">{choice.en}</span>
              <span className="card-desc">{choice.desc}</span>
              {choice.stacks > 0 && <span className="card-stack">已叠加 ×{choice.stacks}</span>}
            </button>
          ))}
        </div>
        <p className="modal-hint">也可以直接按数字键 1 / 2 / 3 选择</p>
        {snapshot.pendingLevelUps > 0 && <p className="modal-hint">还有 {snapshot.pendingLevelUps} 次升级待选</p>}
      </div>
    </div>
  );
}
