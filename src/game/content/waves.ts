/**
 * 内容层 · 波次编排与强度成长。
 * 每一波由若干条「刷怪计划」组成（类型 + 出场时间），怪物一批一批来，越往后越强。
 */

import type { Rng } from '../../engine/rng';
import type { MonsterKind } from '../types';

export interface WaveSpawn {
  kind: MonsterKind;
  time: number;
  elite: boolean;
}

export interface WavePlan {
  wave: number;
  spawns: WaveSpawn[];
  total: number;
  /** 结算展示用：本波理论经验总量（未乘加成）。 */
  baseXp: number;
}

export interface WaveScaling {
  hp: number;
  damage: number;
  speed: number;
  xp: number;
  elite: boolean;
}

export function waveScaling(wave: number): WaveScaling {
  const t = wave - 1;
  return {
    hp: 1 + 0.17 * t,
    damage: 1 + 0.075 * t,
    speed: Math.min(1.35, 1 + 0.022 * t),
    xp: 1 + 0.06 * t,
    elite: wave >= 5 && wave % 5 === 0,
  };
}

const TOTAL_CAP = 22;

export function buildWave(wave: number, rng: Rng): WavePlan {
  const counts: Record<MonsterKind, number> = {
    grunt: 3 + Math.floor(wave * 0.85),
    assassin: wave >= 2 ? Math.min(6, Math.floor(1 + (wave - 2) * 0.7)) : 0,
    brute: wave >= 3 ? Math.min(4, Math.floor((wave - 1) / 2)) : 0,
  };

  // 超出总上限时优先削减杂兵，保持精英怪的压迫感。
  let total = counts.grunt + counts.assassin + counts.brute;
  while (total > TOTAL_CAP && counts.grunt > 1) {
    counts.grunt--;
    total--;
  }

  const kinds: MonsterKind[] = [];
  for (const kind of ['grunt', 'assassin', 'brute'] as const) {
    for (let i = 0; i < counts[kind]; i++) kinds.push(kind);
  }
  rng.shuffle(kinds);

  const scaling = waveScaling(wave);
  const spawns: WaveSpawn[] = [];
  let time = 0;
  let baseXp = 0;
  for (let i = 0; i < kinds.length; i++) {
    if (i === 0) {
      time = 0;
    } else if (i < 3) {
      time += rng.range(0.3, 0.7);
    } else {
      time += rng.range(0.75, 1.7);
    }
    const kind = kinds[i];
    const elite = scaling.elite && i < 2;
    spawns.push({ kind, time, elite });
    baseXp += (kind === 'grunt' ? 12 : kind === 'assassin' ? 18 : 40) * (elite ? 2.5 : 1) * scaling.xp;
  }

  return { wave, spawns, total: spawns.length, baseXp: Math.round(baseXp) };
}

/** 场上同时存在的怪物上限：随波次提高，但有硬上限。 */
export function maxAliveForWave(wave: number, base: number, perWave: number, cap: number): number {
  return Math.min(cap, Math.floor(base + wave * perWave));
}
