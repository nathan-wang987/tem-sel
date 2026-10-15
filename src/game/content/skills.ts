/**
 * 内容层 · 玩家的四个战斗动作（普攻 + 三个技能）。
 * 数据（冷却、倍率、判定尺寸、图标）与逻辑（systems/skills.ts）分离。
 */

import type { Rgb, SkillId } from '../types';

export interface SkillDef {
  id: SkillId;
  kind: 'melee' | 'area' | 'dash' | 'heal';
  name: string;
  en: string;
  keys: readonly string[];
  keyLabel: string;
  desc: string;
  color: Rgb;
  icon: readonly string[];
  cooldown: number;
  windup: number;
  active: number;
  recover: number;
  /** 判定半径（旋风 / 治疗视觉）。 */
  radius: number;
  /** 身前判定距离（普攻 / 冲刺）。 */
  reach: number;
  damageMul: number;
  /** 冲刺持续时间。 */
  duration: number;
  /** 冲刺速度。 */
  speed: number;
  healPct: number;
  knockback: number;
}

/** 8x9 像素图标：'.' 透明，'#' 主体色，'+' 亮色点缀。 */
export const SKILLS: Record<SkillId, SkillDef> = {
  attack: {
    id: 'attack',
    kind: 'melee',
    name: '斩击',
    en: 'Slash',
    keys: ['J', 'Z', '鼠标左键'],
    keyLabel: 'J',
    desc: '向前挥剑，三段连击第三段更重。',
    color: [214, 232, 255],
    icon: [
      '........+',
      '.......+#',
      '......+#.',
      '.....+#..',
      '+...+#...',
      '.+..##...',
      '..++#....',
      '...##....',
      '..#......',
    ],
    cooldown: 0.34,
    windup: 0.05,
    active: 0.09,
    recover: 0.14,
    radius: 0,
    reach: 2.5,
    damageMul: 1,
    duration: 0,
    speed: 0,
    healPct: 0,
    knockback: 3.2,
  },
  spin: {
    id: 'spin',
    kind: 'area',
    name: '旋风斩',
    en: 'Whirlwind',
    keys: ['K', '1'],
    keyLabel: 'K',
    desc: '原地旋转一圈，砍到身边所有怪。',
    color: [255, 203, 92],
    icon: [
      '...+....',
      '.######.',
      '.#....#.',
      '##....##',
      '.#....#.',
      '.######.',
      '...+....',
      '...++...',
      '........',
    ],
    cooldown: 5.5,
    windup: 0.12,
    active: 0.3,
    recover: 0.2,
    radius: 3.6,
    reach: 0,
    damageMul: 1.7,
    duration: 0,
    speed: 0,
    healPct: 0,
    knockback: 4.5,
  },
  dash: {
    id: 'dash',
    kind: 'dash',
    name: '影袭',
    en: 'Dash',
    keys: ['L', '2'],
    keyLabel: 'L',
    desc: '向前猛冲一段，冲刺期间不会被打到。',
    color: [124, 224, 255],
    icon: [
      '........',
      '+.......',
      '++..#...',
      '+++.##..',
      '++++###.',
      '+++.##..',
      '++..#...',
      '+.......',
      '........',
    ],
    cooldown: 6.5,
    windup: 0.03,
    active: 0.24,
    recover: 0.16,
    radius: 0,
    reach: 1.3,
    damageMul: 1.35,
    duration: 0.27,
    speed: 30,
    healPct: 0,
    knockback: 5,
  },
  heal: {
    id: 'heal',
    kind: 'heal',
    name: '生命回复',
    en: 'Mend',
    keys: ['H', '3'],
    keyLabel: 'H',
    desc: '立刻回复 35% 最大生命。',
    color: [110, 236, 148],
    icon: [
      '........',
      '..##....',
      '.####...',
      '.####...',
      '..##..#.',
      '......##',
      '.....###',
      '......##',
      '.......#',
    ],
    cooldown: 15,
    windup: 0.2,
    active: 0.1,
    recover: 0.25,
    radius: 2.6,
    reach: 0,
    damageMul: 0,
    duration: 0,
    speed: 0,
    healPct: 0.35,
    knockback: 0,
  },
};

export const SKILL_ORDER: readonly SkillId[] = ['attack', 'spin', 'dash', 'heal'];

/** 普攻三段连击的伤害倍率。 */
export const COMBO_MULTIPLIERS: readonly number[] = [1, 1, 1.5];
/** 连击窗口（秒）。 */
export const COMBO_WINDOW = 0.55;
