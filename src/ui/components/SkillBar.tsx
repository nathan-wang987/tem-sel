/**
 * 界面层 · 技能栏。
 *
 * 需求 3：技能用完要等冷却，界面上能看见每个技能还剩多久。
 * 冷却中会盖一层从上往下的遮罩，并显示剩余秒数（0.1 秒精度）。
 */

import type { SkillSnapshot, UiSnapshot } from '../../game/snapshot';
import { PixelIcon } from './PixelIcon';

export interface SkillBarProps {
  snapshot: UiSnapshot;
}

export function SkillBar({ snapshot }: SkillBarProps) {
  return (
    <div className="skillbar">
      {snapshot.skills.map((skill, index) => (
        <SkillSlot key={skill.id} skill={skill} index={index} />
      ))}
    </div>
  );
}

function SkillSlot({ skill, index }: { skill: SkillSnapshot; index: number }) {
  const total = Math.max(0.001, skill.cooldownTotal);
  const ratio = Math.max(0, Math.min(1, skill.cooldown / total));
  const cooling = skill.cooldown > 0.05;
  const dimmed = !skill.ready;

  return (
    <div
      className={`skill-slot ${cooling ? 'is-cooling' : ''} ${skill.usable ? '' : 'is-unusable'}`}
      title={`${skill.name} ${skill.en}（${skill.keys.join(' / ')}）\n${skill.desc}\n冷却 ${total.toFixed(1)} 秒`}
    >
      <span className="skill-index">{index + 1}</span>
      <div className="skill-icon" style={{ opacity: dimmed ? 0.45 : 1, color: skill.color }}>
        <PixelIcon pixels={skill.icon} color={skill.color} accentColor="#ffffff" size={3} />
      </div>
      <span className="skill-key">{skill.keyLabel}</span>
      <span className="skill-name">{skill.name}</span>
      {cooling && (
        <div className="skill-cooldown">
          <div className="skill-cooldown-mask" style={{ height: `${ratio * 100}%` }} />
          <span className="skill-cooldown-text">{skill.cooldown.toFixed(1)}</span>
        </div>
      )}
      {!skill.usable && <span className="skill-full">满血</span>}
    </div>
  );
}
