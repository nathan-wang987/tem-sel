/**
 * 内容层 · 关卡（竞技场）生成。
 *
 * 关卡由**碰撞体**（地面 / 两端墙 / 浮空平台）和**装饰物**组成。
 * 刷怪系统会用同一份碰撞体做合法性校验，保证怪不会生成在墙里。
 */

import type { Rng } from '../engine/rng';
import type { Solid } from '../engine/physics';
import { ARENA } from './config';
import type { Level, LevelProp, PropKind, Rgb } from './types';

interface Theme {
  skyTop: Rgb;
  skyBottom: Rgb;
  fog: Rgb;
  groundA: Rgb;
  groundB: Rgb;
  groundEdge: Rgb;
}

const THEMES: readonly Theme[] = [
  {
    skyTop: [26, 28, 62],
    skyBottom: [86, 62, 104],
    fog: [70, 60, 96],
    groundA: [104, 94, 120],
    groundB: [88, 78, 104],
    groundEdge: [58, 50, 74],
  },
  {
    skyTop: [16, 38, 54],
    skyBottom: [58, 92, 96],
    fog: [52, 82, 92],
    groundA: [84, 118, 118],
    groundB: [70, 100, 100],
    groundEdge: [44, 66, 70],
  },
  {
    skyTop: [46, 20, 34],
    skyBottom: [126, 62, 52],
    fog: [110, 66, 66],
    groundA: [128, 96, 92],
    groundB: [108, 80, 78],
    groundEdge: [70, 48, 52],
  },
];

/** 三种确定性的平台布局：保证每局地形略有区别，但永远可跳、不会堵路。 */
const PLATFORM_LAYOUTS: readonly { x: number; y: number; w: number }[][] = [
  [
    { x: -16, y: 3.7, w: 8 },
    { x: 14, y: 3.7, w: 8 },
    { x: -1, y: 6.6, w: 7 },
  ],
  [
    { x: -22, y: 3.8, w: 7 },
    { x: 0, y: 3.8, w: 9 },
    { x: 22, y: 3.8, w: 7 },
  ],
  [
    { x: -10, y: 3.7, w: 6 },
    { x: 8, y: 3.7, w: 6 },
    { x: -1, y: 6.6, w: 9 },
    { x: 26, y: 6.6, w: 5 },
  ],
];

export function createLevel(seed: number, stage: number, rng: Rng): Level {
  const theme = THEMES[(stage - 1) % THEMES.length];
  const layout = PLATFORM_LAYOUTS[Math.abs(seed) % PLATFORM_LAYOUTS.length];

  const solids: Solid[] = [
    // 地面
    {
      left: ARENA.minX - 10,
      bottom: ARENA.floorY - 1.2,
      w: ARENA.maxX - ARENA.minX + 20,
      h: 1.2,
    },
    // 两端看不到底的高墙（同时作为刷怪的禁区）
    { left: ARENA.minX - 2, bottom: ARENA.floorY, w: 2, h: 16 },
    { left: ARENA.maxX, bottom: ARENA.floorY, w: 2, h: 16 },
  ];

  for (let i = 0; i < layout.length; i++) {
    const p = layout[i];
    solids.push({ left: p.x - p.w * 0.5, bottom: p.y, w: p.w, h: 0.7 });
  }

  const props: LevelProp[] = [];
  const palette: Rgb[] = [
    [70, 62, 88],
    [96, 84, 112],
    [56, 52, 74],
  ];

  // 背景石柱
  for (let i = 0; i < 9; i++) {
    const x = -38 + i * 9.6 + rng.range(-1.4, 1.4);
    props.push({
      kind: 'pillar',
      x,
      y: 0,
      z: rng.range(-7.5, -3.5),
      scale: rng.range(0.85, 1.6),
      rotY: rng.range(-0.25, 0.25),
      color: palette[i % palette.length],
    });
  }

  // 火把 / 旗帜 / 碎石 / 骨头
  const decoKinds: PropKind[] = ['torch', 'banner', 'rubble', 'bone'];
  for (let i = 0; i < 16; i++) {
    const kind = decoKinds[i % decoKinds.length];
    const near = kind === 'torch' || kind === 'banner';
    props.push({
      kind,
      x: rng.range(ARENA.minX + 2, ARENA.maxX - 2),
      y: ARENA.floorY,
      z: near ? rng.range(-6, -1) : rng.range(-8, 6),
      scale: rng.range(0.8, 1.35),
      rotY: rng.range(-0.5, 0.5),
      color: kind === 'torch' ? [255, 176, 92] : palette[(i + 1) % palette.length],
    });
  }

  return {
    stage,
    solids,
    props,
    skyTop: theme.skyTop,
    skyBottom: theme.skyBottom,
    fog: theme.fog,
    groundA: theme.groundA,
    groundB: theme.groundB,
    groundEdge: theme.groundEdge,
  };
}
