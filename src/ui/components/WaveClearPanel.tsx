/**
 * 界面层 · 波次结算。
 *
 * 需求 6：怪全死了进入结算时不能再攻击（世界层冻结了攻击与伤害，只推进倒计时）。
 */

import type { UiSnapshot } from '../../game/snapshot';

export interface WaveClearPanelProps {
  snapshot: UiSnapshot;
}

export function WaveClearPanel({ snapshot }: WaveClearPanelProps) {
  const summary = snapshot.waveSummary;
  if (!summary) return null;
  return (
    <div className="waveclear">
      <div className="waveclear-title">第 {summary.wave} 波 清空！</div>
      <div className="waveclear-grid">
        <span>击杀</span>
        <span>{summary.kills}</span>
        <span>获得经验</span>
        <span>{summary.xp}</span>
        <span>用时</span>
        <span>{summary.seconds.toFixed(1)} 秒</span>
        <span>受到伤害</span>
        <span>{summary.damageTaken}</span>
      </div>
      <div className="waveclear-next">
        下一波 <b>{Math.max(0, Math.ceil(summary.remaining))}</b> 秒后开始
      </div>
      <div className="waveclear-hint">结算中无法攻击，先喘口气</div>
    </div>
  );
}
