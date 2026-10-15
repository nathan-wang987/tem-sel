/**
 * 渲染层 · 体素光栅化器。
 *
 * 一个"盒子"= 6 个面。每个面：
 *   1) 用旋转矩阵变换到世界空间；
 *   2) 法线背面剔除；
 *   3) 方向光照射 → 光照强度量化到 5 个色阶（像素画的硬明暗）；
 *   4) 透视投影 → 整数像素坐标（像素吸附）；
 *   5) 交给 FaceBatch 统一排序填充。
 *
 * 全部使用预分配缓冲与复用的 style 对象，运行期不产生任何垃圾。
 */

import type { Camera3D } from './camera';
import type { FaceBatch } from './faces';
import { ditherTo, mixColor, quantizeShade, shadeColor } from './palette';

export interface BoxStyle {
  rotX: number;
  rotY: number;
  rotZ: number;
  pivotX: number;
  pivotY: number;
  pivotZ: number;
  outline: boolean;
  /** 0..1，向雾色靠拢的程度（远处物体淡入背景）。 */
  fog: number;
  /** 0..1，用抖动模拟透明度（冲刺残影、无敌闪烁）。 */
  alpha: number;
  /** >0 时覆盖光照，用于自发光物体。 */
  flat: number;
}

export interface PartSink {
  readonly style: BoxStyle;
  /** 盒子以 (x, y, z) 为底面中心：y ∈ [y, y+h]，x/z 以中心对称。 */
  box(x: number, y: number, z: number, w: number, h: number, d: number, color: number): void;
}

/** 面定义：[法线索引, 4 个顶点索引]；顶点索引 bit0=x+、bit1=z+、bit2=y+。 */
const FACES: readonly number[][] = [
  [0, 1, 3, 7, 5],
  [1, 0, 2, 6, 4],
  [2, 2, 3, 7, 6],
  [3, 0, 1, 5, 4],
  [4, 4, 5, 7, 6],
  [5, 0, 1, 3, 2],
];

export class VoxelRasterizer implements PartSink {
  readonly style: BoxStyle = {
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    pivotX: 0,
    pivotY: 0,
    pivotZ: 0,
    outline: false,
    fog: 0,
    alpha: 1,
    flat: 0,
  };

  /** 光照方向（世界空间，已归一化）。 */
  private lx = -0.42;
  private ly = 0.82;
  private lz = 0.39;
  private fogColor = 0x40405a;
  private ambient = 0.62;

  private sx = new Float32Array(8);
  private sy = new Float32Array(8);
  private sd = new Float32Array(8);
  private wx = new Float32Array(8);
  private wy = new Float32Array(8);
  private wz = new Float32Array(8);
  private nx = new Float32Array(3);
  private ny = new Float32Array(3);
  private nz = new Float32Array(3);

  constructor(
    private readonly camera: Camera3D,
    private readonly faces: FaceBatch,
  ) {}

  setFogColor(color: number): void {
    this.fogColor = color;
  }

  setLight(x: number, y: number, z: number, ambient: number): void {
    const len = Math.hypot(x, y, z) || 1;
    this.lx = x / len;
    this.ly = y / len;
    this.lz = z / len;
    this.ambient = ambient;
  }

  private resetStyle(): void {
    const s = this.style;
    s.rotX = 0;
    s.rotY = 0;
    s.rotZ = 0;
    s.pivotX = 0;
    s.pivotY = 0;
    s.pivotZ = 0;
    s.outline = false;
    s.fog = 0;
    s.alpha = 1;
    s.flat = 0;
  }

  box(x: number, y: number, z: number, w: number, h: number, d: number, color: number): void {
    const s = this.style;
    const cam = this.camera;

    // 旋转矩阵：R = Rz * Ry * Rx（零旋转走快速路径）
    let m00 = 1;
    let m01 = 0;
    let m02 = 0;
    let m10 = 0;
    let m11 = 1;
    let m12 = 0;
    let m20 = 0;
    let m21 = 0;
    let m22 = 1;
    if (s.rotX !== 0 || s.rotY !== 0 || s.rotZ !== 0) {
      const cx = Math.cos(s.rotX);
      const sxr = Math.sin(s.rotX);
      const cy = Math.cos(s.rotY);
      const syr = Math.sin(s.rotY);
      const cz = Math.cos(s.rotZ);
      const szr = Math.sin(s.rotZ);
      // Rx
      const rx00 = 1;
      const rx01 = 0;
      const rx02 = 0;
      const rx10 = 0;
      const rx11 = cx;
      const rx12 = -sxr;
      const rx20 = 0;
      const rx21 = sxr;
      const rx22 = cx;
      // Ry * Rx
      const ry00 = cy * rx00 + syr * rx20;
      const ry01 = cy * rx01 + syr * rx21;
      const ry02 = cy * rx02 + syr * rx22;
      const ry10 = rx10;
      const ry11 = rx11;
      const ry12 = rx12;
      const ry20 = -syr * rx00 + cy * rx20;
      const ry21 = -syr * rx01 + cy * rx21;
      const ry22 = -syr * rx02 + cy * rx22;
      // Rz * (Ry * Rx)
      m00 = cz * ry00 - szr * ry10;
      m01 = cz * ry01 - szr * ry11;
      m02 = cz * ry02 - szr * ry12;
      m10 = szr * ry00 + cz * ry10;
      m11 = szr * ry01 + cz * ry11;
      m12 = szr * ry02 + cz * ry12;
      m20 = ry20;
      m21 = ry21;
      m22 = ry22;
    }

    const centerX = x;
    const centerY = y + h * 0.5;
    const centerZ = z;
    const pivotX = centerX + s.pivotX;
    const pivotY = centerY + s.pivotY;
    const pivotZ = centerZ + s.pivotZ;
    const hw = w * 0.5;
    const hh = h * 0.5;
    const hd = d * 0.5;

    for (let i = 0; i < 8; i++) {
      const lx = (i & 1) === 0 ? -hw : hw;
      const lz = (i & 2) === 0 ? -hd : hd;
      const ly = (i & 4) === 0 ? -hh : hh;
      const ox = lx - s.pivotX;
      const oy = ly - s.pivotY;
      const oz = lz - s.pivotZ;
      const rx = m00 * ox + m01 * oy + m02 * oz;
      const ry = m10 * ox + m11 * oy + m12 * oz;
      const rz = m20 * ox + m21 * oy + m22 * oz;
      const worldX = pivotX + rx;
      const worldY = pivotY + ry;
      const worldZ = pivotZ + rz;
      this.wx[i] = worldX;
      this.wy[i] = worldY;
      this.wz[i] = worldZ;
      const depth = cam.depthOf(worldX, worldY, worldZ);
      if (depth <= cam.near) {
        this.sd[i] = -1;
        continue;
      }
      const cxv =
        (worldX - cam.x) * cam.right.x + (worldY - cam.y) * cam.right.y + (worldZ - cam.z) * cam.right.z;
      const cyv = (worldX - cam.x) * cam.up.x + (worldY - cam.y) * cam.up.y + (worldZ - cam.z) * cam.up.z;
      const scale = cam.focalLength / depth;
      this.sx[i] = cam.width * 0.5 + cxv * scale + cam.shakeX;
      this.sy[i] = cam.height * 0.5 - cyv * scale + cam.shakeY;
      this.sd[i] = depth;
    }

    // 三个轴的法线经旋转后就是旋转矩阵的三列
    this.nx[0] = m00;
    this.ny[0] = m10;
    this.nz[0] = m20;
    this.nx[1] = m01;
    this.ny[1] = m11;
    this.nz[1] = m21;
    this.nx[2] = m02;
    this.ny[2] = m12;
    this.nz[2] = m22;

    const fog = s.fog <= 0 ? 0 : s.fog >= 1 ? 1 : s.fog;
    const alpha = s.alpha >= 1 ? 1 : s.alpha <= 0 ? 0 : s.alpha;
    if (alpha <= 0) {
      this.resetStyle();
      return;
    }

    for (let f = 0; f < 6; f++) {
      const face = FACES[f];
      const axis = face[0] % 3;
      const sign = face[0] < 3 ? 1 : -1;
      const nx0 = this.nx[axis] * sign;
      const ny0 = this.ny[axis] * sign;
      const nz0 = this.nz[axis] * sign;

      const a = face[1];
      const b = face[2];
      const c = face[3];
      const dd = face[4];
      if (this.sd[a] < 0 || this.sd[b] < 0 || this.sd[c] < 0 || this.sd[dd] < 0) continue;

      // 背面剔除：法线朝向相机之外就跳过
      const fcx = (this.wx[a] + this.wx[b] + this.wx[c] + this.wx[dd]) * 0.25;
      const fcy = (this.wy[a] + this.wy[b] + this.wy[c] + this.wy[dd]) * 0.25;
      const fcz = (this.wz[a] + this.wz[b] + this.wz[c] + this.wz[dd]) * 0.25;
      if (nx0 * (cam.x - fcx) + ny0 * (cam.y - fcy) + nz0 * (cam.z - fcz) <= 0) continue;

      let shadeValue = s.flat > 0 ? s.flat : this.ambient + (1 - this.ambient) * 1.05 * Math.max(0, nx0 * this.lx + ny0 * this.ly + nz0 * this.lz);
      shadeValue = quantizeShade(shadeValue);
      let faceColor = shadeColor(color, shadeValue);
      if (fog > 0) faceColor = mixColor(faceColor, this.fogColor, fog);

      const centerSX = (this.sx[a] + this.sx[b] + this.sx[c] + this.sx[dd]) * 0.25;
      const centerSY = (this.sy[a] + this.sy[b] + this.sy[c] + this.sy[dd]) * 0.25;
      if (alpha < 1) faceColor = ditherTo(faceColor, this.fogColor, 1 - alpha, Math.round(centerSX), Math.round(centerSY));

      const depth = (this.sd[a] + this.sd[b] + this.sd[c] + this.sd[dd]) * 0.25;
      this.faces.push(
        Math.round(this.sx[a]),
        Math.round(this.sy[a]),
        Math.round(this.sx[b]),
        Math.round(this.sy[b]),
        Math.round(this.sx[c]),
        Math.round(this.sy[c]),
        Math.round(this.sx[dd]),
        Math.round(this.sy[dd]),
        faceColor,
        depth,
        s.outline,
      );
    }

    this.resetStyle();
  }
}
