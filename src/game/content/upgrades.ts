/**
 * 内容层 · 升级加成池。
 * 升级时从池中按稀有度随机抽 3 个互不相同的加成供玩家选择，可重复叠加。
 */

import type { Rng } from '../../engine/rng';
import type { Player, PlayerMods } from '../types';

export type UpgradeTier = 'common' | 'rare' | 'epic';

export interface UpgradeDef {
  id: string;
  name: string;
  en: string;
  desc: string;
  tier: UpgradeTier;
  apply(mods: PlayerMods, player: Player): void;
}

export const TIER_WEIGHT: Record<UpgradeTier, number> = {
  common: 62,
  rare: 30,
  epic: 8,
};

export const TIER_COLOR: Record<UpgradeTier, string> = {
  common: '#9fb6d4',
  rare: '#7cc9ff',
  epic: '#ffcf5c',
};

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: 'sharp',
    name: '锋锐',
    en: 'Keen Edge',
    desc: '攻击力 +15%',
    tier: 'common',
    apply: (mods) => {
      mods.atkMul *= 1.15;
    },
  },
  {
    id: 'swift',
    name: '疾风步',
    en: 'Swift Boots',
    desc: '移动速度 +12%',
    tier: 'common',
    apply: (mods) => {
      mods.speedMul *= 1.12;
    },
  },
  {
    id: 'tough',
    name: '铁骨',
    en: 'Iron Bones',
    desc: '最大生命 +25，并立刻回复等量生命',
    tier: 'common',
    apply: (mods, player) => {
      mods.maxHpBonus += 25;
      player.maxHp += 25;
      player.hp = Math.min(player.maxHp, player.hp + 25);
    },
  },
  {
    id: 'meditate',
    name: '冥想',
    en: 'Meditation',
    desc: '所有技能冷却 -10%',
    tier: 'common',
    apply: (mods) => {
      mods.cdMul *= 0.9;
    },
  },
  {
    id: 'bounce',
    name: '弹跳靴',
    en: 'Spring Heels',
    desc: '跳跃高度 +9%',
    tier: 'common',
    apply: (mods) => {
      mods.jumpMul *= 1.09;
    },
  },
  {
    id: 'hunter',
    name: '猎人直觉',
    en: 'Hunter Instinct',
    desc: '获得经验 +20%',
    tier: 'common',
    apply: (mods) => {
      mods.xpMul *= 1.2;
    },
  },
  {
    id: 'heavy',
    name: '重击',
    en: 'Heavy Blow',
    desc: '击退效果 +40%',
    tier: 'common',
    apply: (mods) => {
      mods.knockbackMul *= 1.4;
    },
  },
  {
    id: 'giant_blade',
    name: '巨刃回旋',
    en: 'Giant Blade',
    desc: '旋风斩范围 +25%、伤害 +20%',
    tier: 'rare',
    apply: (mods) => {
      mods.spinRadiusMul *= 1.25;
      mods.spinDamageMul *= 1.2;
    },
  },
  {
    id: 'void_dash',
    name: '破空',
    en: 'Void Step',
    desc: '冲刺伤害 +50%，冲刺后无敌延长 0.15 秒',
    tier: 'rare',
    apply: (mods) => {
      mods.dashDamageMul *= 1.5;
      mods.dashInvulnBonus += 0.15;
    },
  },
  {
    id: 'blood_spring',
    name: '血之泉',
    en: 'Blood Spring',
    desc: '治疗效果 +45%，立刻回复 20% 生命',
    tier: 'rare',
    apply: (mods, player) => {
      mods.healMul *= 1.45;
      player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.2);
    },
  },
  {
    id: 'crit_rate',
    name: '致命节奏',
    en: 'Lethal Rhythm',
    desc: '暴击率 +12%',
    tier: 'rare',
    apply: (mods) => {
      mods.critChance += 0.12;
    },
  },
  {
    id: 'crit_power',
    name: '战意',
    en: 'Battle Spirit',
    desc: '暴击伤害 +50%',
    tier: 'rare',
    apply: (mods) => {
      mods.critMul += 0.5;
    },
  },
  {
    id: 'soul_eater',
    name: '噬魂',
    en: 'Soul Eater',
    desc: '每次击杀回复 6 点生命',
    tier: 'rare',
    apply: (mods) => {
      mods.killHeal += 6;
    },
  },
  {
    id: 'thorns',
    name: '荆棘护甲',
    en: 'Thorn Mail',
    desc: '受到近战伤害时反弹 50% 伤害',
    tier: 'rare',
    apply: (mods) => {
      mods.thornsMul += 0.5;
    },
  },
  {
    id: 'aerial',
    name: '空中猎手',
    en: 'Aerial Hunter',
    desc: '空中攻击伤害 +35%',
    tier: 'rare',
    apply: (mods) => {
      mods.airAttackMul += 0.35;
    },
  },
  {
    id: 'execute',
    name: '处决',
    en: 'Executioner',
    desc: '对生命低于 30% 的敌人伤害 +60%',
    tier: 'epic',
    apply: (mods) => {
      mods.executeMul += 0.6;
    },
  },
  {
    id: 'tempest',
    name: '暴风'
    ,
    en: 'Tempest',
    desc: '攻击力 +40%，移速 +5%，最大生命 +15',
    tier: 'epic',
    apply: (mods, player) => {
      mods.atkMul *= 1.4;
      mods.speedMul *= 1.05;
      mods.maxHpBonus += 15;
      player.maxHp += 15;
      player.hp = Math.min(player.maxHp, player.hp + 15);
    },
  },
  {
    id: 'eternal',
    name: '永动',
    en: 'Perpetual',
    desc: '所有技能冷却 -25%',
    tier: 'epic',
    apply: (mods) => {
      mods.cdMul *= 0.75;
    },
  },
];

/** 加权随机抽取 count 个不重复的加成。 */
export function rollUpgrades(rng: Rng, count: number): UpgradeDef[] {
  const pool = UPGRADES.slice();
  const picked: UpgradeDef[] = [];
  for (let n = 0; n < count && pool.length > 0; n++) {
    let total = 0;
    for (let i = 0; i < pool.length; i++) total += TIER_WEIGHT[pool[i].tier];
    let roll = rng.range(0, total);
    let index = 0;
    for (let i = 0; i < pool.length; i++) {
      roll -= TIER_WEIGHT[pool[i].tier];
      if (roll <= 0) {
        index = i;
        break;
      }
    }
    picked.push(pool[index]);
    pool[index] = pool[pool.length - 1];
    pool.pop();
  }
  return picked;
}
