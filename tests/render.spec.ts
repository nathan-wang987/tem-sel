/**
 * 渲染测试：用软件光栅化 Canvas 跑真实的像素 3D 渲染管线，
 * 校验输出不为空白、色阶丰富，并把画面导出成 PNG 便于人工检查。
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ManualInput } from '../src/engine/input';
import { FIXED_STEP } from '../src/game/config';
import { waveScaling } from '../src/game/content/waves';
import { damageMonster } from '../src/game/systems/combat';
import { spawnMonsterAt } from '../src/game/systems/monsters';
import { World } from '../src/game/world';
import { PixelRenderer } from '../src/render/renderer';
import { assert, assertEqual, test } from './harness';
import { countNonBlack, createMockCanvas, distinctColors, edgeDensity, writePng, type MockCanvas } from './mockCanvas';

const cacheDir = path.dirname(fileURLToPath(import.meta.url));

function makeRenderer(): { renderer: PixelRenderer; canvas: MockCanvas } {
  const canvas = createMockCanvas(8, 8);
  const renderer = new PixelRenderer(canvas as unknown as HTMLCanvasElement);
  return { renderer, canvas };
}

function buildBattleWorld(seed: number): { world: World; input: ManualInput } {
  const world = new World(seed);
  world.newRun(seed);
  world.plan = null;
  world.monsters.clear();
  const input = new ManualInput();
  for (let i = 0; i < 10; i++) world.update(FIXED_STEP, input);

  const player = world.player;
  const kinds = ['grunt', 'assassin', 'brute'] as const;
  for (let i = 0; i < kinds.length; i++) {
    const monster = spawnMonsterAt(world, kinds[i], i === 2, player.x + 4 + i * 3.4, waveScaling(3));
    if (monster) {
      monster.state = 'chase';
      monster.spawnTimer = 0;
    }
  }
  const first = world.monsters.items[0];
  if (first) damageMonster(world, first, 12, { knockX: 1, knockPower: 3, source: 'attack' });
  for (let i = 0; i < 40; i++) world.update(FIXED_STEP, input);
  return { world, input };
}

test('渲染：像素 3D 场景能画出内容（不是空白/纯色）', () => {
  const { world } = buildBattleWorld(909);
  const { renderer, canvas } = makeRenderer();

  renderer.render(world, 1 / 60);
  const resolution = renderer.resolution;
  assertEqual(canvas.width, resolution.width, '画布宽度等于内部像素分辨率');
  assertEqual(canvas.height, resolution.height, '画布高度等于内部像素分辨率');
  assert(resolution.width <= 400 && resolution.height <= 225, '内部分辨率保持低分辨率（像素感）');

  const colored = countNonBlack(canvas);
  const colors = distinctColors(canvas);
  const edges = edgeDensity(canvas);
  assert(colored > canvas.width * canvas.height * 0.9, `画面应当被填满（${colored} 个像素有颜色）`);
  assert(colors > 40, `像素 3D 应当使用多级色阶（实际 ${colors} 种颜色）`);
  assert(edges > 1500, `画面应当有丰富细节（边缘密度 ${edges}）`);

  writePng(canvas, path.join(cacheDir, 'preview-battle.png'));
});

test('渲染：三种怪物的主色都能在画面里找到', () => {
  const { world } = buildBattleWorld(910);
  const { renderer, canvas } = makeRenderer();
  world.fx.cameraX = world.player.x;
  world.fx.cameraY = 0;
  renderer.render(world, 1 / 60);

  const pixels = canvas.pixels;
  let gruntPixels = 0;
  let assassinPixels = 0;
  let brutePixels = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (g > r + 20 && g > b + 30 && g > 60) gruntPixels++;
    if (r > g + 50 && r > b + 30) assassinPixels++;
    if (r > 70 && r < 200 && b > r && Math.abs(r - g) < 30 && b > g + 20) brutePixels++;
  }
  assert(gruntPixels > 30, `画面里应当能看到橄榄绿的游荡者（${gruntPixels} 像素）`);
  assert(assassinPixels > 30, `画面里应当能看到猩红的刺影（${assassinPixels} 像素）`);
  assert(brutePixels > 30, `画面里应当能看到灰紫的石魔（${brutePixels} 像素）`);

  writePng(canvas, path.join(cacheDir, 'preview-monsters.png'));
});

test('渲染：连续渲染 30 帧稳定，无异常', () => {
  const { world, input } = buildBattleWorld(911);
  const { renderer, canvas } = makeRenderer();
  for (let i = 0; i < 30; i++) {
    world.update(FIXED_STEP, input);
    renderer.render(world, 1 / 60);
  }
  const edges = edgeDensity(canvas);
  assert(edges > 1000, `连续渲染后画面依然有内容（边缘密度 ${edges}）`);
  assert(renderer.averageFrameMs >= 0, '帧时间统计可用');

  writePng(canvas, path.join(cacheDir, 'preview-action.png'));
});

test('渲染：换到后面的关卡主题（第 6 波）依然正常出图', () => {
  const world = new World(912);
  world.newRun(912);
  const input = new ManualInput();
  world.plan = null;
  world.monsters.clear();
  world.wave = 6;
  world.rebuildLevel(2); // 第 6 波属于第 2 个场景主题
  for (let i = 0; i < 30; i++) world.update(FIXED_STEP, input);

  const renderer2Canvas = makeRenderer();
  const kinds = ['grunt', 'brute'] as const;
  for (let i = 0; i < kinds.length; i++) {
    const monster = spawnMonsterAt(world, kinds[i], true, world.player.x + 3.5 + i * 4, waveScaling(6));
    if (monster) {
      monster.state = 'chase';
      monster.spawnTimer = 0;
    }
  }
  const target = world.monsters.items[0];
  if (target) damageMonster(world, target, 30, { knockX: 1, knockPower: 4, heavy: true, source: 'attack' });
  for (let i = 0; i < 20; i++) world.update(FIXED_STEP, input);

  renderer2Canvas.renderer.render(world, 1 / 60);
  const colors = distinctColors(renderer2Canvas.canvas);
  const edges = edgeDensity(renderer2Canvas.canvas);
  assert(colors > 40, `主题切换后色阶依然丰富（${colors} 种）`);
  assert(edges > 1200, `主题切换后画面依然有细节（边缘密度 ${edges}）`);
  writePng(renderer2Canvas.canvas, path.join(cacheDir, 'preview-stage2.png'));
});
