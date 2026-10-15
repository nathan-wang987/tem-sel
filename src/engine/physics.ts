/**
 * 引擎层 · AABB 物理。
 * 坐标：x 为水平中心，y 为脚底；solid 用左下角 + 宽高描述。
 */

export interface Solid {
  left: number;
  bottom: number;
  w: number;
  h: number;
}

export interface Mover {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
}

export interface MoveResult {
  hitWall: boolean;
  hitCeiling: boolean;
  landed: boolean;
}

const EPSILON = 0.0005;

export function solidOverlapsMover(solid: Solid, mover: Mover, x: number, y: number): boolean {
  return (
    x - mover.w * 0.5 < solid.left + solid.w - EPSILON &&
    x + mover.w * 0.5 > solid.left + EPSILON &&
    y < solid.bottom + solid.h - EPSILON &&
    y + mover.h > solid.bottom + EPSILON
  );
}

/** 某点是否落在实心方块内（刷怪合法性检查用）。 */
export function pointInSolid(solid: Solid, x: number, y: number, padding = 0): boolean {
  return (
    x > solid.left - padding &&
    x < solid.left + solid.w + padding &&
    y > solid.bottom - padding &&
    y < solid.bottom + solid.h + padding
  );
}

/**
 * 轴分离移动 + 碰撞解算。先移动 X 再移动 Y，避免斜向穿墙。
 * 结果写入调用方复用的 out 对象。
 */
export function moveAndCollide(
  mover: Mover,
  dx: number,
  dy: number,
  solids: readonly Solid[],
  out: MoveResult,
): void {
  out.hitWall = false;
  out.hitCeiling = false;
  out.landed = false;

  if (dx !== 0) {
    mover.x += dx;
    for (let i = 0; i < solids.length; i++) {
      const solid = solids[i];
      if (!solidOverlapsMover(solid, mover, mover.x, mover.y)) continue;
      if (dx > 0) {
        mover.x = solid.left - mover.w * 0.5;
      } else {
        mover.x = solid.left + solid.w + mover.w * 0.5;
      }
      mover.vx = 0;
      out.hitWall = true;
    }
  }

  if (dy !== 0) {
    mover.y += dy;
    for (let i = 0; i < solids.length; i++) {
      const solid = solids[i];
      if (!solidOverlapsMover(solid, mover, mover.x, mover.y)) continue;
      if (dy <= 0) {
        mover.y = solid.bottom + solid.h;
        out.landed = true;
      } else {
        mover.y = solid.bottom - mover.h;
        out.hitCeiling = true;
      }
      mover.vy = 0;
    }
  }
}

/** 向下扫描，找脚底下方最近的实心面高度（刷怪 / 落地检查用）。 */
export function groundHeightBelow(
  solids: readonly Solid[],
  x: number,
  y: number,
  w: number,
  maxDrop: number,
): number | null {
  let best: number | null = null;
  const left = x - w * 0.5;
  const right = x + w * 0.5;
  for (let i = 0; i < solids.length; i++) {
    const solid = solids[i];
    if (right <= solid.left || left >= solid.left + solid.w) continue;
    const top = solid.bottom + solid.h;
    if (top > y + EPSILON) continue;
    if (y - top > maxDrop) continue;
    if (best === null || top > best) best = top;
  }
  return best;
}
