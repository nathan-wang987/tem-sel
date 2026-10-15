/**
 * 渲染层 · 面片缓冲与画家算法光栅化。
 *
 * 所有 3D 盒子最后都变成屏幕空间里的凸四边形，统一按"离相机距离"从远到近排序后填充，
 * 这就是像素 3D 场景的遮挡关系。缓冲区是预分配的，运行期零分配。
 */

import { cssColor, outlineOf } from './palette';

export const VERTS_PER_FACE = 8;

export class FaceBatch {
  count = 0;
  readonly verts: Int16Array;
  readonly colors: Int32Array;
  readonly depth: Float32Array;
  readonly outline: Uint8Array;
  readonly order: number[];

  constructor(readonly capacity: number) {
    this.verts = new Int16Array(capacity * VERTS_PER_FACE);
    this.colors = new Int32Array(capacity);
    this.depth = new Float32Array(capacity);
    this.outline = new Uint8Array(capacity);
    this.order = new Array<number>(capacity);
  }

  reset(): void {
    this.count = 0;
  }

  push(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number,
    depth: number,
    outline: boolean,
  ): void {
    if (this.count >= this.capacity) return;
    const index = this.count++;
    const base = index * VERTS_PER_FACE;
    const verts = this.verts;
    verts[base] = x0;
    verts[base + 1] = y0;
    verts[base + 2] = x1;
    verts[base + 3] = y1;
    verts[base + 4] = x2;
    verts[base + 5] = y2;
    verts[base + 6] = x3;
    verts[base + 7] = y3;
    this.colors[index] = color;
    this.depth[index] = depth;
    this.outline[index] = outline ? 1 : 0;
  }
}

const byDepthDescending = (a: number, b: number): number => depthRef[b] - depthRef[a];
let depthRef: Float32Array = new Float32Array(0);

export function flushFaces(ctx: CanvasRenderingContext2D, batch: FaceBatch): void {
  const count = batch.count;
  if (count === 0) return;
  depthRef = batch.depth;
  const order = batch.order;
  order.length = count;
  for (let i = 0; i < count; i++) order[i] = i;
  order.sort(byDepthDescending);

  const verts = batch.verts;
  for (let k = 0; k < count; k++) {
    const index = order[k];
    const base = index * VERTS_PER_FACE;
    ctx.beginPath();
    ctx.moveTo(verts[base], verts[base + 1]);
    ctx.lineTo(verts[base + 2], verts[base + 3]);
    ctx.lineTo(verts[base + 4], verts[base + 5]);
    ctx.lineTo(verts[base + 6], verts[base + 7]);
    ctx.closePath();
    const color = batch.colors[index];
    ctx.fillStyle = cssColor(color);
    ctx.fill();
    if (batch.outline[index] === 1) {
      ctx.strokeStyle = cssColor(outlineOf(color));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
