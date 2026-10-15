/**
 * 渲染层 · 场景装配。
 *
 * 一帧的绘制顺序：
 *   天空色带 → 远景（群山/月亮）→ 地面砖块（含距离雾）→ 场景道具 →
 *   阴影 → 怪物 → 玩家 → 3D 碎块粒子 → 统一排序填充 →
 *   屏幕空间层（火花、飘字、血条、前摇警示、闪光）
 *
 * 注意：光栅化器的 style 是"用完即重置"的，因此每次 box() 调用前都要重新设置样式。
 */

import { clamp } from '../engine/math';
import { ARENA } from '../game/config';
import { MONSTER_DEFS } from '../game/content/monsters';
import type { Level, Monster } from '../game/types';
import type { World } from '../game/world';
import { Camera3D, type ProjectedPoint } from './camera';
import { FaceBatch, flushFaces } from './faces';
import { drawPixelText, textWidth } from './font';
import { drawMonster, drawPlayer, drawProp } from './models';
import { cssColor, ditherTo, mixColor, pack, packRgb, shadeColor } from './palette';
import type { VoxelRasterizer } from './rasterizer';

export interface SceneContext {
  world: World;
  camera: Camera3D;
  raster: VoxelRasterizer;
  faces: FaceBatch;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
}

const projected: ProjectedPoint = { x: 0, y: 0, depth: 0 };
const triA: ProjectedPoint = { x: 0, y: 0, depth: 0 };
const triB: ProjectedPoint = { x: 0, y: 0, depth: 0 };
const triC: ProjectedPoint = { x: 0, y: 0, depth: 0 };

/** 设置样式后画一个盒子（style 会被光栅化器重置，所以每次都要重新设置）。 */
function box(
  raster: VoxelRasterizer,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: number,
  fog: number,
  alpha: number,
): void {
  const style = raster.style;
  style.fog = fog;
  style.alpha = alpha;
  style.outline = false;
  style.rotX = 0;
  style.rotY = 0;
  style.rotZ = 0;
  raster.box(x, y, z, w, h, d, color);
}

export function renderScene(scene: SceneContext): void {
  const { world, raster, ctx } = scene;
  ctx.imageSmoothingEnabled = false;

  drawSky(scene);
  drawDistantLandscape(scene);

  const level = world.level;
  raster.setFogColor(packRgb(level.fog));
  drawFloor(scene, level);
  drawPlatforms(scene, level);

  const props = level.props;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    // 视野剔除：离镜头太远的道具不参与绘制。
    if (Math.abs(prop.x - world.fx.cameraX) > 26) continue;
    drawProp(raster, prop);
  }

  // 阴影先画，让角色稳稳压在地上
  for (let i = 0; i < world.monsters.count; i++) drawShadow(scene, world.monsters.items[i]);
  drawShadow(scene, world.player);

  for (let i = 0; i < world.monsters.count; i++) {
    const m = world.monsters.items[i];
    if (Math.abs(m.x - world.fx.cameraX) > 24) continue;
    drawMonster(raster, m, scene.time);
  }
  drawPlayer(raster, world.player, scene.time);

  // 3D 碎块粒子
  for (let i = 0; i < world.particles.count; i++) {
    const p = world.particles.items[i];
    if (!p.voxel) continue;
    box(
      raster,
      p.x,
      p.y,
      p.z,
      p.size,
      p.size,
      p.size,
      pack(p.r, p.g, p.b),
      0,
      clamp((p.life / p.maxLife) * 1.6, 0.15, 1),
    );
  }

  flushFaces(ctx, scene.faces);
  scene.faces.reset();

  drawScreenParticles(scene);
  drawFloatingTexts(scene);
  drawMonsterOverlays(scene);
  drawFlash(scene);
}

/** 天空：把渐变量化成色带，并点缀会闪的星星。 */
function drawSky(scene: SceneContext): void {
  const { ctx, width, height, world } = scene;
  const top = packRgb(world.level.skyTop);
  const bottom = packRgb(world.level.skyBottom);
  const bands = 12;
  const bandHeight = Math.ceil(height / bands);
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    ctx.fillStyle = cssColor(mixColor(top, bottom, t * t));
    ctx.fillRect(0, i * bandHeight, width, bandHeight);
  }

  ctx.fillStyle = cssColor(shadeColor(mixColor(top, 0xffffff, 0.55), 0.9));
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash01(i * 7 + 3) * width);
    const y = Math.floor(hash01(i * 13 + 11) * height * 0.45);
    const twinkle = Math.sin(scene.time * 1.8 + i) * 0.5 + 0.5;
    if (twinkle < 0.4) continue;
    ctx.fillRect(x, y, 1, 1);
  }
}

/** 远景：方形月亮 + 两层山脊，靠 3D 深度自然形成视差。 */
function drawDistantLandscape(scene: SceneContext): void {
  const { world, camera, ctx } = scene;
  const fog = packRgb(world.level.fog);

  const moonX = world.fx.cameraX * 0.55 + 26;
  if (camera.project(moonX, 14, -52, projected)) {
    const size = 13;
    const x = Math.round(projected.x - size * 0.5);
    const y = Math.round(projected.y - size * 0.5);
    ctx.fillStyle = cssColor(mixColor(pack(255, 244, 214), fog, 0.25));
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = cssColor(mixColor(pack(255, 255, 240), fog, 0.1));
    ctx.fillRect(x + 3, y + 2, size - 6, size - 6);
    ctx.fillStyle = cssColor(mixColor(pack(214, 206, 190), fog, 0.3));
    ctx.fillRect(x + 4, y + 8, 3, 2);
    ctx.fillRect(x + 8, y + 4, 2, 2);
  }

  const camX = world.fx.cameraX;
  for (let layer = 0; layer < 2; layer++) {
    const z = layer === 0 ? -46 : -30;
    const spacing = layer === 0 ? 22 : 17;
    const maxHeight = layer === 0 ? 13 : 9;
    const baseColor = layer === 0 ? pack(46, 44, 74) : pack(62, 56, 88);
    const start = Math.floor((camX - 60) / spacing) * spacing;
    for (let x = start; x <= camX + 60; x += spacing) {
      const seed = Math.round(x / spacing) + layer * 31;
      const h = maxHeight * (0.45 + hash01(seed) * 0.75);
      const halfWidth = spacing * (0.5 + hash01(seed + 5) * 0.4);
      const apex = x + (hash01(seed + 9) - 0.5) * spacing * 0.5;
      pushWorldTriangle(
        scene,
        x - halfWidth,
        0,
        z,
        x + halfWidth,
        0,
        z,
        apex,
        h,
        z,
        mixColor(baseColor, fog, layer === 0 ? 0.45 : 0.28),
      );
    }
  }
}

/** 三角形用"退化成四边形"的方式压进同一套排序缓冲（保证和实体正确遮挡）。 */
function pushWorldTriangle(
  scene: SceneContext,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  color: number,
): void {
  const { camera, faces } = scene;
  if (!camera.project(x0, y0, z0, triA)) return;
  if (!camera.project(x1, y1, z1, triB)) return;
  if (!camera.project(x2, y2, z2, triC)) return;
  faces.push(
    Math.round(triA.x),
    Math.round(triA.y),
    Math.round(triB.x),
    Math.round(triB.y),
    Math.round(triC.x),
    Math.round(triC.y),
    Math.round(triC.x),
    Math.round(triC.y),
    color,
    (triA.depth + triB.depth + triC.depth) / 3 + 200,
    false,
  );
}

/** 地面：透视棋盘格 + 距离雾（远处用抖动过渡到雾色）。 */
function drawFloor(scene: SceneContext, level: Level): void {
  const { world, camera, raster } = scene;
  const tileW = 4;
  const tileD = 3;
  const camX = world.fx.cameraX;
  const startX = Math.floor((camX - 26) / tileW) * tileW;
  const endX = camX + 26;
  const groundA = packRgb(level.groundA);
  const groundB = packRgb(level.groundB);
  const edge = packRgb(level.groundEdge);

  for (let x = startX; x <= endX; x += tileW) {
    for (let z = -ARENA.depth + 1; z < ARENA.depth; z += tileD) {
      const checker = (Math.round((x + ARENA.depth) / tileW) + Math.round((z + ARENA.depth) / tileD)) % 2 === 0;
      const depth = camera.depthOf(x, 0, z);
      const fog = clamp((depth - 14) / 34, 0, 1);
      const alpha = fog > 0.62 ? clamp(1 - (fog - 0.62) * 2.2, 0.16, 1) : 1;
      box(raster, x, -1.3, z, tileW, 1.3, tileD, checker ? groundA : groundB, Math.min(0.72, fog), alpha);
      box(raster, x - tileW * 0.5, -0.12, z, 0.24, 0.12, tileD, edge, Math.min(0.8, fog + 0.08), alpha);
      box(raster, x, -0.12, z - tileD * 0.5, tileW, 0.12, 0.24, edge, Math.min(0.8, fog + 0.08), alpha);
    }
  }

  // 远处背景墙：封住地平线，避免地面直接切到天空
  box(
    raster,
    camX,
    0,
    -ARENA.depth - 1.4,
    74,
    9,
    1.2,
    shadeColor(packRgb(level.groundEdge), 0.92),
    0.5,
    1,
  );
}

/**
 * 浮空平台与两端高墙：这些实心方块是真正的落脚点，必须画出来，
 * 否则玩家会"站在空气上"。地面那一层由瓷砖表现，这里跳过。
 */
function drawPlatforms(scene: SceneContext, level: Level): void {
  const { raster, world } = scene;
  const solids = level.solids;
  const stone = mixColor(packRgb(level.groundEdge), packRgb(level.groundA), 0.55);
  const stoneTop = mixColor(stone, pack(255, 255, 255), 0.3);
  const camX = world.fx.cameraX;

  for (let i = 0; i < solids.length; i++) {
    const solid = solids[i];
    const top = solid.bottom + solid.h;
    if (top <= ARENA.floorY + 0.02) continue;
    const centerX = solid.left + solid.w * 0.5;
    if (Math.abs(centerX - camX) > 34) continue;

    // 稍微往镜头后面放一点：保证"人是站在平台前面"的遮挡关系稳定
    const depth = 2;
    const z = -1.6;
    box(raster, centerX, solid.bottom, z, solid.w, solid.h, depth, stone, 0.06, 1);
    // 顶面：单独铺一层更亮的薄板，让"可以站上去"一目了然
    box(raster, centerX, top - 0.18, z, solid.w, 0.18, depth + 0.3, stoneTop, 0.04, 1);
  }
}

function drawShadow(scene: SceneContext, entity: { x: number; y: number; w: number; h: number }): void {
  const heightAboveGround = Math.max(0, entity.y - ARENA.floorY);
  const spread = clamp(1 - heightAboveGround * 0.06, 0.45, 1);
  const alpha = clamp(0.5 - heightAboveGround * 0.03, 0.1, 0.5);
  box(
    scene.raster,
    entity.x,
    ARENA.floorY + 0.01,
    0,
    entity.w * 1.2 * spread,
    0.02,
    1.6 * spread,
    0x15151d,
    0,
    alpha,
  );
}

function drawScreenParticles(scene: SceneContext): void {
  const { world, ctx, camera } = scene;
  const fogColor = packRgb(world.level.fog);
  for (let i = 0; i < world.particles.count; i++) {
    const p = world.particles.items[i];
    if (p.voxel) continue;
    if (!camera.project(p.x, p.y, p.z, projected)) continue;
    const life = clamp(p.life / p.maxLife, 0, 1);
    const color = pack(p.r, p.g, p.b);
    if (p.kind === 'ring') {
      drawPixelRing(ctx, projected.x, projected.y, p.size, color, life);
      continue;
    }
    const size = p.kind === 'ember' ? 1 : p.size > 1.2 ? 2 : 1;
    const x = Math.round(projected.x);
    const y = Math.round(projected.y);
    ctx.fillStyle = cssColor(ditherTo(color, fogColor, clamp(1 - life * 1.5, 0, 1), x, y));
    ctx.fillRect(x, y, size, size);
  }
}

function drawPixelRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: number,
  life: number,
): void {
  const steps = 14;
  ctx.fillStyle = cssColor(shadeColor(color, 0.75 + life * 0.7));
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ctx.fillRect(Math.round(cx + Math.cos(angle) * radius), Math.round(cy + Math.sin(angle) * radius * 0.42), 1, 1);
  }
}

function drawFloatingTexts(scene: SceneContext): void {
  const { world, ctx, camera } = scene;
  const fogColor = packRgb(world.level.fog);
  for (let i = 0; i < world.texts.count; i++) {
    const t = world.texts.items[i];
    if (!camera.project(t.x, t.y, t.z, projected)) continue;
    const life = clamp(t.life / t.maxLife, 0, 1);
    const scale = t.big ? 2 : 1;
    const x = Math.round(projected.x - textWidth(t.text, scale) * 0.5);
    const y = Math.round(projected.y);
    drawPixelText(ctx, t.text, x + 1, y + 1, 'rgb(0,0,0)', scale);
    const faded = ditherTo(pack(t.r, t.g, t.b), fogColor, clamp(1 - life * 1.3, 0, 1), x, y);
    drawPixelText(ctx, t.text, x, y, cssColor(faded), scale);
  }
}

/** 怪物头顶：血条 / 前摇警示 / 出生光柱。 */
function drawMonsterOverlays(scene: SceneContext): void {
  const { world, ctx, camera } = scene;
  for (let i = 0; i < world.monsters.count; i++) {
    const m: Monster = world.monsters.items[i];
    if (m.state === 'dead') continue;
    if (Math.abs(m.x - world.fx.cameraX) > 22) continue;
    const def = MONSTER_DEFS[m.kind];

    if (!camera.project(m.x, m.y + m.h + 0.45, 0, projected)) continue;
    const x = Math.round(projected.x);
    const y = Math.round(projected.y);

    if (m.state === 'spawn') {
      if (camera.project(m.x, m.y + m.h * 0.2, 0, triA)) {
        const bottomY = Math.round(triA.y) + 2;
        ctx.fillStyle = 'rgb(14,14,24)';
        ctx.fillRect(x - 2, y, 5, Math.max(2, bottomY - y));
        ctx.fillStyle = cssColor(m.elite ? pack(255, 208, 108) : pack(120, 190, 255));
        for (let s = y; s < bottomY; s += 4) ctx.fillRect(x, s, 1, 2);
      }
      continue;
    }

    const barWidth = m.kind === 'brute' ? 30 : 22;
    const hpRatio = clamp(m.hp / m.maxHp, 0, 1);
    const barX = x - barWidth / 2;
    ctx.fillStyle = 'rgb(11,11,18)';
    ctx.fillRect(barX - 1, y - 1, barWidth + 2, 5);
    ctx.fillStyle =
      m.hitFlash > 0.4
        ? 'rgb(255,255,255)'
        : m.elite
          ? cssColor(pack(255, 208, 108))
          : cssColor(packRgb(def.body));
    ctx.fillRect(barX, y, Math.max(1, Math.round(barWidth * hpRatio)), 3);

    // 前摇警示：刺影闪得最急，一眼就能看出"它要动手了"
    if (m.state === 'windup') {
      const progress = clamp(m.stateTime / Math.max(0.01, def.windup), 0, 1);
      if (Math.sin(scene.time * (10 + progress * 30)) > -0.2) {
        const color =
          m.kind === 'assassin' ? pack(255, 90, 90) : m.kind === 'brute' ? pack(255, 190, 90) : pack(255, 240, 150);
        const size = m.kind === 'assassin' ? 2 : 1;
        drawPixelText(ctx, '!', x - 2 * size + 1, y - 13 * size + 1, 'rgb(0,0,0)', size);
        drawPixelText(ctx, '!', x - 2 * size, y - 13 * size, cssColor(color), size);
      }
    }
  }
}

function drawFlash(scene: SceneContext): void {
  const { ctx, width, height, world } = scene;
  if (world.fx.flash <= 0.01) return;
  ctx.fillStyle = `rgba(255,120,120,${Math.min(0.5, world.fx.flash * 0.6).toFixed(3)})`;
  ctx.fillRect(0, 0, width, height);
}

function hash01(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
