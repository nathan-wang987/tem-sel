/**
 * 渲染层 · 调色板工具。
 *
 * "像素 3D" 的关键：颜色必须量化。所有光照强度都会被压到少量色阶上，
 * 半透明则用 4x4 Bayer 抖动模拟（真实像素画里没有 alpha 混合）。
 */

import type { Rgb } from '../game/types';

export function pack(r: number, g: number, b: number): number {
  return ((clampByte(r) << 16) | (clampByte(g) << 8) | clampByte(b)) >>> 0;
}

export function packRgb(rgb: Rgb): number {
  return pack(rgb[0], rgb[1], rgb[2]);
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function shadeColor(packed: number, mul: number): number {
  const r = ((packed >> 16) & 255) * mul;
  const g = ((packed >> 8) & 255) * mul;
  const b = (packed & 255) * mul;
  return pack(r, g, b);
}

export function mixColor(a: number, b: number, t: number): number {
  const it = 1 - t;
  const r = ((a >> 16) & 255) * it + ((b >> 16) & 255) * t;
  const g = ((a >> 8) & 255) * it + ((b >> 8) & 255) * t;
  const bl = (a & 255) * it + (b & 255) * t;
  return pack(r, g, bl);
}

/** 把光照强度压到 5 个色阶（像素 3D 的硬边明暗）。 */
const SHADE_LEVELS = [0.58, 0.74, 0.9, 1.06, 1.22] as const;
export const SHADE_LEVEL_COUNT = SHADE_LEVELS.length;

export function quantizeShade(value: number): number {
  const index = Math.round((value - SHADE_LEVELS[0]) / (SHADE_LEVELS[1] - SHADE_LEVELS[0]));
  const clamped = index < 0 ? 0 : index >= SHADE_LEVELS.length ? SHADE_LEVELS.length - 1 : index;
  return SHADE_LEVELS[clamped];
}

/** 4x4 有序抖动矩阵（0..15）。 */
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;

export function bayer(x: number, y: number): number {
  const ix = x & 3;
  const iy = y & 3;
  return BAYER_4[iy * 4 + ix];
}

/**
 * 用抖动模拟 alpha：t 越大，越多像素换成目标色。
 * 全程不透明填充，保证排序绘制的结果稳定。
 */
export function ditherTo(color: number, toward: number, t: number, x: number, y: number): number {
  if (t <= 0) return color;
  if (t >= 1) return toward;
  const threshold = (bayer(x, y) + 0.5) / 16;
  return t > threshold ? toward : color;
}

const cssCache = new Map<number, string>();

export function cssColor(packed: number): string {
  let value = cssCache.get(packed);
  if (value !== undefined) return value;
  if (cssCache.size > 4096) cssCache.clear();
  value = `rgb(${(packed >> 16) & 255},${(packed >> 8) & 255},${packed & 255})`;
  cssCache.set(packed, value);
  return value;
}

/** 描边色：整体压暗并轻微偏蓝，让像素块边界更硬朗。 */
export function outlineOf(packed: number): number {
  return shadeColor(mixColor(packed, 0x101018, 0.45), 0.62);
}
