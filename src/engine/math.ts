/**
 * 引擎层 · 基础数学。
 * 纯函数、零依赖，渲染层 / 模拟层 / 测试共用。
 */

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function invLerp(a: number, b: number, v: number): number {
  return a === b ? 0 : (v - a) / (b - a);
}

/** 帧率无关的指数逼近（比 lerp 更稳定）。 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function approach(current: number, target: number, maxDelta: number): number {
  const d = target - current;
  if (Math.abs(d) <= maxDelta) return target;
  return current + (d > 0 ? maxDelta : -maxDelta);
}

export function signOrZero(v: number): -1 | 0 | 1 {
  return v > 0 ? 1 : v < 0 ? -1 : 0;
}

export function smoothstep(edge0: number, edge1: number, v: number): number {
  const t = clamp01(invLerp(edge0, edge1, v));
  return t * t * (3 - 2 * t);
}

/** 坐标系约定：x 为水平中心，y 为“脚底”（底部），w/h 为包围盒宽高。 */
export interface FootBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boxOverlaps(a: FootBox, b: FootBox): boolean {
  return (
    a.x - a.w * 0.5 < b.x + b.w * 0.5 &&
    a.x + a.w * 0.5 > b.x - b.w * 0.5 &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** 两个脚底盒子在水平方向上的间隙（负数表示重叠）。 */
export function horizontalGap(a: FootBox, b: FootBox): number {
  return Math.abs(a.x - b.x) - (a.w + b.w) * 0.5;
}

/** 圆与脚底盒子的距离（用于范围技能与分离力）。 */
export function circleTouchesBox(cx: number, cy: number, radius: number, b: FootBox): boolean {
  const nearestX = clamp(cx, b.x - b.w * 0.5, b.x + b.w * 0.5);
  const nearestY = clamp(cy, b.y, b.y + b.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

export function easeOutCubic(t: number): number {
  const p = 1 - clamp01(t);
  return 1 - p * p * p;
}

export function easeInQuad(t: number): number {
  const p = clamp01(t);
  return p * p;
}
