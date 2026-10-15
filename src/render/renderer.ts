/**
 * 渲染层 · 帧渲染器。
 *
 * 画布本身就是"像素画布"：内部分辨率固定为 400x225 这类小尺寸，
 * 再用 CSS 的 image-rendering: pixelated 放大到屏幕——这才是像素 3D 的颗粒感来源。
 * 一旦检测到帧时间偏高会自动降一档内部分辨率（长时间游玩也不会越来越卡）。
 */

import { CAMERA, RENDER } from '../game/config';
import type { World } from '../game/world';
import { Camera3D } from './camera';
import { FaceBatch } from './faces';
import { VoxelRasterizer } from './rasterizer';
import { renderScene } from './scene';

/** 自适应分辨率档位（16:9）。 */
const QUALITY_WIDTHS = [RENDER.baseWidth, 352, 320, RENDER.minWidth];

export class PixelRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera = new Camera3D();
  private readonly faces = new FaceBatch(RENDER.maxFaces);
  private readonly raster: VoxelRasterizer;
  private readonly frameTimes = new Float32Array(120);
  private frameIndex = 0;
  private frameCount = 0;
  private qualityIndex = 0;
  private qualityCooldown = 2;
  private time = 0;
  private width: number = RENDER.baseWidth;
  private height: number = RENDER.baseHeight;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('无法获取 2D 画布上下文');
    this.ctx = ctx;
    this.raster = new VoxelRasterizer(this.camera, this.faces);
    this.raster.setLight(RENDER.lightDir[0], RENDER.lightDir[1], RENDER.lightDir[2], RENDER.lightAmbient);
    this.applyQuality(0);
  }

  get resolution(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /** 平均帧耗时（毫秒），用于调试面板。 */
  get averageFrameMs(): number {
    if (this.frameCount === 0) return 0;
    let total = 0;
    for (let i = 0; i < this.frameCount; i++) total += this.frameTimes[i];
    return total / this.frameCount;
  }

  render(world: World, realDt: number): void {
    this.time += realDt;
    this.trackPerformance(realDt);

    const width = this.width;
    const height = this.height;
    this.camera.setViewport(width, height);
    const shake = world.fx.shake;
    this.camera.shakeX = shake > 0 ? Math.round(Math.sin(this.time * 61) * shake * 3.4) : 0;
    this.camera.shakeY = shake > 0 ? Math.round(Math.cos(this.time * 47) * shake * 2.6) : 0;

    const fx = world.fx;
    this.camera.lookAt(
      fx.cameraX,
      CAMERA.offsetY + fx.cameraY * 0.5,
      CAMERA.offsetZ,
      fx.cameraX,
      CAMERA.lookAtY + fx.cameraY,
      0,
    );

    this.faces.reset();
    renderScene({
      world,
      camera: this.camera,
      raster: this.raster,
      faces: this.faces,
      ctx: this.ctx,
      width,
      height,
      time: this.time,
    });
  }

  private applyQuality(index: number): void {
    this.qualityIndex = index;
    this.width = QUALITY_WIDTHS[index];
    this.height = Math.round((this.width * 9) / 16);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /** 采样最近 2 秒的帧时间：慢就降档，快就回升。 */
  private trackPerformance(realDt: number): void {
    this.frameTimes[this.frameIndex] = realDt * 1000;
    this.frameIndex = (this.frameIndex + 1) % this.frameTimes.length;
    if (this.frameCount < this.frameTimes.length) this.frameCount++;
    this.qualityCooldown -= realDt;
    if (this.qualityCooldown > 0 || this.frameCount < 60) return;

    const average = this.averageFrameMs;
    if (average > 21 && this.qualityIndex < QUALITY_WIDTHS.length - 1) {
      this.applyQuality(this.qualityIndex + 1);
      this.qualityCooldown = 4;
    } else if (average < 12.5 && this.qualityIndex > 0) {
      this.applyQuality(this.qualityIndex - 1);
      this.qualityCooldown = 6;
    } else {
      this.qualityCooldown = 2;
    }
  }
}
