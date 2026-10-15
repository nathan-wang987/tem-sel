/**
 * 界面层 · 主菜单。
 */

import type { GameSession } from '../../game/session';
import type { UiSnapshot } from '../../game/snapshot';
import { ControlsHelp } from './ControlsHelp';

export interface StartScreenProps {
  snapshot: UiSnapshot;
  session: GameSession;
}

export function StartScreen({ snapshot, session }: StartScreenProps) {
  return (
    <div className="overlay overlay-start">
      <div className="start-card">
        <h1 className="game-title">
          像素守卫 <span className="game-title-en">PIXEL WARDEN</span>
        </h1>
        <p className="game-sub">横版打怪升级 · 一波接一波 · 越砍越强</p>

        <div className="start-actions">
          {snapshot.hasSave && snapshot.savedRun && (
            <button
              className="btn btn-primary"
              onClick={() => session.continueGame()}
              title="读取存档，从上次的波次继续"
            >
              继续进度（第 {snapshot.savedRun.wave} 波 · Lv.{snapshot.savedRun.level}）
            </button>
          )}
          <button className={`btn ${snapshot.hasSave ? '' : 'btn-primary'}`} onClick={() => session.newGame()}>
            开始新游戏
          </button>
        </div>

        <div className="start-stats">
          <span>最佳波次 {snapshot.best.wave}</span>
          <span>最高等级 {snapshot.best.level}</span>
          <span>最多击杀 {snapshot.best.kills}</span>
        </div>

        <ControlsHelp />

        {!snapshot.storageOk && <p className="warn-text">⚠ {snapshot.storageNote}</p>}
      </div>
    </div>
  );
}
