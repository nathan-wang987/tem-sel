/**
 * 渲染层 · 3D 相机（透视投影）。
 *
 * 玩法仍然是一条线（x 左右、y 上下），但相机放在玩家后上方并向下俯视，
 * 于是地板、平台、角色都有真实的进深与体积——这就是"像素版 3D"的来源。
 */

import { DEG } from '../engine/math';

export interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
}

export class Camera3D {
  x = 0;
  y = 0;
  z = 0;

  width = 400;
  height = 225;
  fov = 38 * DEG;
  near = 1.2;
  focalLength = 300;

  shakeX = 0;
  shakeY = 0;

  /** 相机基向量（世界空间，公开只读，光栅化器直接读取以避免临时对象）。 */
  readonly right = { x: 1, y: 0, z: 0 };
  readonly up = { x: 0, y: 1, z: 0 };
  readonly forward = { x: 0, y: 0, z: -1 };

  setViewport(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.focalLength = (height * 0.5) / Math.tan(this.fov * 0.5);
  }

  lookAt(fromX: number, fromY: number, fromZ: number, toX: number, toY: number, toZ: number): void {
    this.x = fromX;
    this.y = fromY;
    this.z = fromZ;
    let fx = toX - fromX;
    let fy = toY - fromY;
    let fz = toZ - fromZ;
    const flen = Math.hypot(fx, fy, fz) || 1;
    fx /= flen;
    fy /= flen;
    fz /= flen;
    // right = forward × worldUp
    let rx = fy * 0 - fz * 1;
    let ry = fz * 0 - fx * 0;
    let rz = fx * 1 - fy * 0;
    const rlen = Math.hypot(rx, ry, rz) || 1;
    rx /= rlen;
    ry /= rlen;
    rz /= rlen;
    // up = right × forward
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;
    this.right.x = rx;
    this.right.y = ry;
    this.right.z = rz;
    this.up.x = ux;
    this.up.y = uy;
    this.up.z = uz;
    this.forward.x = fx;
    this.forward.y = fy;
    this.forward.z = fz;
  }

  /** 投影一个世界坐标点，返回是否在相机前方。 */
  project(wx: number, wy: number, wz: number, out: ProjectedPoint): boolean {
    const dx = wx - this.x;
    const dy = wy - this.y;
    const dz = wz - this.z;
    const depth = dx * this.forward.x + dy * this.forward.y + dz * this.forward.z;
    if (depth <= this.near) return false;
    const cx = dx * this.right.x + dy * this.right.y + dz * this.right.z;
    const cy = dx * this.up.x + dy * this.up.y + dz * this.up.z;
    const scale = this.focalLength / depth;
    out.x = this.width * 0.5 + cx * scale + this.shakeX;
    out.y = this.height * 0.5 - cy * scale + this.shakeY;
    out.depth = depth;
    return true;
  }

  /** 只求深度（用于排序与剔除）。 */
  depthOf(wx: number, wy: number, wz: number): number {
    return (wx - this.x) * this.forward.x + (wy - this.y) * this.forward.y + (wz - this.z) * this.forward.z;
  }
}
