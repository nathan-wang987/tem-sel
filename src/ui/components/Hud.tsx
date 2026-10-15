/**
 * 界面层 · 顶部状态栏（等级 / 生命 / 经验 / 波次 / 战斗数据）。
 */

import type { UiSnapshot } from '../../game/snapshot';

export interface HudProps {
  snapshot: UiSnapshot;
}

export function Hud({ snapshot }: HudProps) {
  const hpPercent = snapshot.maxHp > 0 ? Math.max(0, Math.min(100, (snapshot.hp / snapshot.maxHp) * 100)) : 0;
  const xpPercent = snapshot.xpNeed > 0 ? Math.max(0, Math.min(100, (snapshot.xp / snapshot.xpNeed) * 100)) : 0;
  const lowHp = hpPercent <= 30;

  return (
    <div className="hud">
      <div className="panel panel-left">
        <div className="row row-between">
          <span className="badge">Lv.{snapshot.level}</span>
          <span className="stat">攻 {snapshot.atk}</span>
        </div>
        <div className="bar bar-hp">
          <div className={`bar-fill ${lowHp ? 'bar-fill-danger' : ''}`} style={{ width: `${hpPercent}%` }} />
          <span className="bar-label">
            {snapshot.hp} / {snapshot.maxHp}
          </span>
        </div>
        <div className="bar bar-xp">
          <div className="bar-fill bar-fill-xp" style={{ width: `${xpPercent}%` }} />
          <span className="bar-label small">
            经验 {snapshot.xp} / {snapshot.xpNeed}
          </span>
        </div>
      </div>

      <div className="panel panel-center">
        <div className="wave-title">第 {snapshot.wave} 波</div>
        <div className="wave-sub">
          场内 {snapshot.monstersAlive} · 剩余 {snapshot.monstersRemaining}
        </div>
      </div>

      <div className="panel panel-right">
        <div className="row row-between small">
          <span>击杀 {snapshot.kills}</span>
          <span>{formatTime(snapshot.runSeconds)}</span>
        </div>
        <div className="row row-between small dim">
          <span>
            {snapshot.fps} FPS · {snapshot.resolution}
          </span>
          <span>最佳 第{snapshot.best.wave}波</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
