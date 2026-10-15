/**
 * 内容层 · 三种怪物的定义。
 *
 * 设计目标：一眼可分。
 *  - grunt    游荡者：普通杂兵，会追人，攻守均衡，橄榄绿矮胖体型。
 *  - assassin 刺影：高伤脆皮，出手前有极明显的蓄力（后仰 + 红光 + 头顶感叹号），细高红黑体型。
 *  - brute    石魔：又胖又肉，走得慢，打人不疼但极难砍死，宽大灰紫体型 + 超级护甲。
 */

import type { MonsterKind, Rgb } from '../types';

export interface MonsterDef {
  kind: MonsterKind;
  name: string;
  en: string;
  blurb: string;
  hp: number;
  damage: number;
  speed: number;
  xp: number;
  w: number;
  h: number;
  body: Rgb;
  accent: Rgb;
  eye: Rgb;
  /** 出手前摇（秒）——越长玩家越容易反应。 */
  windup: number;
  /** 判定窗口（秒）。 */
  active: number;
  /** 后摇（秒）。 */
  recover: number;
  /** 两次攻击之间的间隔（秒）。 */
  cooldown: number;
  attackRange: number;
  /** 攻击时的前冲速度。 */
  lungeSpeed: number;
  /** true 表示受击不会被打断（石魔）。 */
  superArmor: boolean;
  /** 体型 / 单次受击的最大僵直。 */
  spawnTime: number;
  /** 击退抗性：1 = 完全被击退，0 = 纹丝不动。 */
  knockbackResist: number;
  /** 分离力半径基准。 */
  mass: number;
  /** UI（血条等）用颜色。 */
  uiColor: string;
}

export const MONSTER_DEFS: Record<MonsterKind, MonsterDef> = {
  grunt: {
    kind: 'grunt',
    name: '游荡者',
    en: 'Grunt',
    blurb: '普通的杂兵，会追着你打。',
    hp: 28,
    damage: 8,
    speed: 3.9,
    xp: 12,
    w: 1.2,
    h: 2.1,
    body: [110, 143, 74],
    accent: [56, 78, 40],
    eye: [255, 210, 74],
    windup: 0.28,
    active: 0.12,
    recover: 0.34,
    cooldown: 1.5,
    attackRange: 1.6,
    lungeSpeed: 4.2,
    superArmor: false,
    spawnTime: 0.5,
    knockbackResist: 0,
    mass: 1.15,
    uiColor: '#8fbb5e',
  },
  assassin: {
    kind: 'assassin',
    name: '刺影',
    en: 'Assassin',
    blurb: '很脆，但一爪很疼。出手前会先蓄力，看准了躲开。',
    hp: 16,
    damage: 20,
    speed: 5.4,
    xp: 18,
    w: 0.95,
    h: 2.05,
    body: [196, 58, 74],
    accent: [104, 22, 42],
    eye: [255, 122, 138],
    windup: 0.58,
    active: 0.14,
    recover: 0.5,
    cooldown: 1.9,
    attackRange: 3,
    lungeSpeed: 16,
    superArmor: false,
    spawnTime: 0.34,
    knockbackResist: 0.35,
    mass: 0.95,
    uiColor: '#e2566d',
  },
  brute: {
    kind: 'brute',
    name: '石魔',
    en: 'Brute',
    blurb: '又胖又肉，走得慢，打你不疼，但非常难砍死。',
    hp: 130,
    damage: 4,
    speed: 1.85,
    xp: 40,
    w: 2.45,
    h: 2.9,
    body: [124, 112, 142],
    accent: [58, 50, 72],
    eye: [143, 224, 255],
    windup: 0.62,
    active: 0.2,
    recover: 0.85,
    cooldown: 2.4,
    attackRange: 2.4,
    lungeSpeed: 2.6,
    superArmor: true,
    spawnTime: 0.85,
    knockbackResist: 0.82,
    mass: 2.3,
    uiColor: '#a99cc4',
  },
};

export const MONSTER_ORDER: readonly MonsterKind[] = ['grunt', 'assassin', 'brute'];
