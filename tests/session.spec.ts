/**
 * 会话层测试：主循环、切窗口自动暂停 + 恢复倒计时（需求 8）、存档节流写入（需求 7）。
 * 通过注入假宿主 + 假动画帧，把真实的 GameSession 跑在 Node 里。
 */

import type { AudioBus } from '../src/platform/audio';
import type { StorageLike } from '../src/game/persistence';
import { SAVE_KEY } from '../src/game/persistence';
import { damagePlayer } from '../src/game/systems/combat';
import { GameSession } from '../src/game/session';
import { assert, assertEqual, test } from './harness';
import { createFakeHost } from './fakeHost';
import { createMockCanvas, type MockCanvas } from './mockCanvas';

function memoryStorage(): StorageLike & { readonly size: () => number } {
  const data = new Map<string, string>();
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    size: () => data.size,
  };
}

const silentAudio: AudioBus = {
  available: false,
  play: () => {},
  setMuted: () => {},
  unlock: () => {},
  dispose: () => {},
};

interface Harness {
  session: GameSession;
  host: ReturnType<typeof createFakeHost>;
  canvas: MockCanvas;
  tick(ms: number): void;
}

function createHarness(storage: StorageLike = memoryStorage()): Harness {
  const host = createFakeHost();
  const canvas = createMockCanvas(8, 8);
  const session = new GameSession(canvas as unknown as HTMLCanvasElement, {
    host: host.window,
    storage,
    audio: silentAudio,
    resumeCountdownSeconds: 3,
    requestFrame: (callback) => host.window.requestAnimationFrame(callback),
    cancelFrame: (handle) => host.window.cancelAnimationFrame(handle),
  });
  session.start();
  return {
    session,
    host,
    canvas,
    tick(ms: number) {
      host.advance(ms);
    },
  };
}

test('会话：主循环会推进世界并渲染画面', () => {
  const h = createHarness();
  h.session.newGame(4242);
  assertEqual(h.session.getSnapshot().status, 'running', '开局后进入运行状态');
  for (let i = 0; i < 60; i++) h.tick(1000 / 60);
  const snapshot = h.session.getSnapshot();
  assert(snapshot.phase === 'playing' || snapshot.phase === 'waveClear', '应当处于战斗中');
  assert(h.session.world.playTimeMs > 500, `模拟时间应当推进（${h.session.world.playTimeMs.toFixed(0)}ms）`);
  assert(h.canvas.drawnPixels > 0, '每帧都应当往画布上画东西');
  h.session.destroy();
});

test('需求8：切到别的程序自动暂停，切回来先给几秒准备时间', () => {
  const h = createHarness();
  h.session.newGame(5252);
  for (let i = 0; i < 120; i++) h.tick(1000 / 60);
  const timeBeforeSwitch = h.session.world.playTimeMs;
  assert(timeBeforeSwitch > 0, '切走之前游戏在正常推进');

  // 切到别的程序
  h.host.setDocumentHidden(true);
  h.host.dispatchDocument('visibilitychange');
  assertEqual(h.session.getSnapshot().phase, 'paused', '切走后应当自动暂停');
  assertEqual(h.session.getSnapshot().pauseReason, 'auto', '记录为自动暂停');

  for (let i = 0; i < 180; i++) h.tick(1000 / 60);
  assertEqual(h.session.world.playTimeMs, timeBeforeSwitch, '自动暂停期间时间不前进（需求8）');

  // 切回来
  h.host.setDocumentHidden(false);
  h.host.dispatchDocument('visibilitychange');
  const resumeIn = h.session.getSnapshot().resumeIn;
  assert(resumeIn !== null && resumeIn > 0, '切回来应当先进入准备倒计时');
  assertEqual(h.session.getSnapshot().pauseReason, 'resuming', '处于恢复倒计时中');

  for (let i = 0; i < 4; i++) h.tick(200);
  assertEqual(h.session.world.playTimeMs, timeBeforeSwitch, '倒计时期间时间依然冻结');
  assertEqual(h.session.getSnapshot().phase, 'paused', '倒计时期间保持暂停');

  for (let i = 0; i < 20; i++) h.tick(200);
  const after = h.session.getSnapshot();
  assert(after.resumeIn === null, '倒计时结束后开始游戏');
  assert(after.phase === 'playing' || after.phase === 'waveClear', '恢复后回到战斗');
  assert(h.session.world.playTimeMs > timeBeforeSwitch, '恢复后时间继续前进');
  h.session.destroy();
});

test('需求6/8：手动暂停不会在切回窗口时自动恢复', () => {
  const h = createHarness();
  h.session.newGame(6262);
  for (let i = 0; i < 60; i++) h.tick(1000 / 60);

  h.session.pause(true);
  assertEqual(h.session.getSnapshot().pauseReason, 'manual', '手动暂停');

  h.host.setDocumentHidden(true);
  h.host.dispatchDocument('visibilitychange');
  h.host.setDocumentHidden(false);
  h.host.dispatchDocument('visibilitychange');
  assertEqual(h.session.getSnapshot().phase, 'paused', '手动暂停后切回来仍然保持暂停');
  assertEqual(h.session.getSnapshot().pauseReason, 'manual', '不会被自动恢复逻辑接管');
  assert(h.session.world.playTimeMs > 0, '暂停前的时间已经推进');
  h.session.destroy();
});

test('需求7：会话会节流写档，关掉重开能接着玩', () => {
  const storage = memoryStorage();
  const first = createHarness(storage);
  first.session.newGame(7373);
  for (let i = 0; i < 420; i++) first.tick(1000 / 60); // 7 秒：至少触发一次自动存档
  assert(storage.size() > 0, '自动存档应当写入存储');
  const raw = storage.getItem(SAVE_KEY);
  assert(raw, '存储里应当有存档内容');
  const parsed = JSON.parse(raw!) as { run: { wave: number; seed: number } | null };
  assert(parsed.run, '存档里应当包含进行中的这一局');
  const savedWave = parsed.run!.wave;
  const savedSeed = parsed.run!.seed;

  // 模拟"关掉页面再打开"
  first.session.destroy();
  const second = createHarness(storage);
  const snapshot = second.session.getSnapshot();
  assert(snapshot.hasSave, '新会话应当读到存档');
  assert(snapshot.savedRun !== null, '菜单上能显示上次进度');

  second.session.continueGame();
  assertEqual(second.session.world.seed, savedSeed, '恢复同一局（随机种子一致）');
  assertEqual(second.session.world.wave, savedWave, '恢复到相同波次');
  assertEqual(second.session.getSnapshot().status, 'running', '继续后进入战斗');
  second.session.destroy();
});

test('需求6：死亡后清掉进行中的存档，只保留最佳纪录', () => {
  const storage = memoryStorage();
  const h = createHarness(storage);
  h.session.newGame(8484);
  for (let i = 0; i < 60; i++) h.tick(1000 / 60);

  // 走真实路径把玩家打死
  const world = h.session.world;
  world.kills = 25;
  world.wave = 4;
  world.player.invuln = 0;
  world.player.state = 'idle';
  damagePlayer(world, 9999, world.player.x + 1, null);
  assert(!world.player.alive, '玩家应当阵亡');
  for (let i = 0; i < 5; i++) h.tick(1000 / 60);

  const snapshot = h.session.getSnapshot();
  assertEqual(snapshot.lastDeath?.wave, 4, '记录阵亡信息');
  assertEqual(snapshot.best.wave, 4, '最佳波次被更新');
  assert(!snapshot.hasSave, '阵亡后进行中的存档被清空');
  h.session.destroy();
});
