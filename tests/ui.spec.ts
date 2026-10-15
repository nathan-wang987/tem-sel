/**
 * 界面层测试：用 react-dom/server 把各个 UI 组件渲染成 HTML，
 * 确保 HUD / 技能栏 / 各种弹窗在真实数据下都不会崩、也不会漏掉关键信息。
 */

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import type { GameSession } from '../src/game/session';
import type { UiSnapshot } from '../src/game/snapshot';
import { SKILLS, SKILL_ORDER } from '../src/game/content/skills';
import { App } from '../src/ui/App';
import { GameOverOverlay } from '../src/ui/components/GameOverOverlay';
import { Hud } from '../src/ui/components/Hud';
import { PauseOverlay } from '../src/ui/components/PauseOverlay';
import { ResumeCountdown } from '../src/ui/components/ResumeCountdown';
import { SkillBar } from '../src/ui/components/SkillBar';
import { StartScreen } from '../src/ui/components/StartScreen';
import { Toast } from '../src/ui/components/Toast';
import { UpgradeModal } from '../src/ui/components/UpgradeModal';
import { WaveClearPanel } from '../src/ui/components/WaveClearPanel';
import { assert, assertEqual, test } from './harness';

function makeSnapshot(overrides: Partial<UiSnapshot> = {}): UiSnapshot {
  return {
    status: 'running',
    phase: 'playing',
    pauseReason: 'none',
    hp: 78,
    maxHp: 140,
    level: 4,
    xp: 30,
    xpNeed: 96,
    atk: 18.5,
    wave: 3,
    kills: 27,
    runSeconds: 125,
    monstersAlive: 4,
    monstersRemaining: 7,
    skills: SKILL_ORDER.map((id) => {
      const def = SKILLS[id];
      return {
        id,
        name: def.name,
        en: def.en,
        keyLabel: def.keyLabel,
        keys: def.keys.slice(),
        desc: def.desc,
        icon: def.icon.slice() as string[],
        color: `rgb(${def.color[0]},${def.color[1]},${def.color[2]})`,
        cooldown: id === 'spin' ? 3.4 : 0,
        cooldownTotal: def.cooldown,
        ready: id !== 'spin',
        usable: true,
      };
    }),
    upgradeChoices: [],
    pendingLevelUps: 0,
    waveSummary: null,
    resumeIn: null,
    best: { level: 9, wave: 12, kills: 210 },
    hasSave: true,
    savedRun: { wave: 6, level: 5 },
    soundOn: true,
    storageOk: true,
    storageNote: '',
    fps: 60,
    resolution: '400x225',
    toast: null,
    lastDeath: null,
    ...overrides,
  };
}

const sessionStub = {
  newGame: () => {},
  continueGame: () => {},
  restart: () => {},
  pause: () => {},
  resume: () => {},
  togglePause: () => {},
  chooseUpgrade: () => {},
  setSound: () => {},
  eraseSave: () => {},
  backToMenu: () => {},
} as unknown as GameSession;

/** 去掉 React 服务端渲染插入的注释分隔符，方便断言文本。 */
function text(html: string): string {
  return html.replace(/<!-- -->/g, '');
}

test('界面：根组件能在没有会话时渲染出画布', () => {
  const html = renderToString(createElement(App));
  assert(html.includes('game-canvas'), '应当渲染出游戏画布');
  assert(html.includes('像素 3D 渲染'), '应当渲染出页脚说明');
});

test('界面：HUD 显示等级/血量/经验/波次/技能冷却', () => {
  const html = text(renderToString(
    createElement(
      'div',
      null,
      createElement(Hud, { snapshot: makeSnapshot() }),
      createElement(SkillBar, { snapshot: makeSnapshot() }),
    ),
  ));
  assert(html.includes('Lv.4'), '显示等级');
  assert(html.includes('78 / 140'), '显示血量');
  assert(html.includes('经验 30 / 96'), '显示经验');
  assert(html.includes('第 3 波'), '显示波次');
  assert(html.includes('斩击') && html.includes('旋风斩') && html.includes('影袭') && html.includes('生命回复'), '显示四个技能');
  assert(html.includes('3.4'), '冷却中的技能要显示剩余秒数（需求3）');
  assert(html.includes('400x225'), '显示渲染分辨率');
});

test('界面：各个弹窗都能正常渲染', () => {
  const paused = text(renderToString(
    createElement(PauseOverlay, { snapshot: makeSnapshot({ phase: 'paused', pauseReason: 'manual' }), session: sessionStub }),
  ));
  assert(paused.includes('已暂停'), '暂停面板');

  const resuming = text(renderToString(
    createElement(ResumeCountdown, { snapshot: makeSnapshot({ phase: 'paused', pauseReason: 'resuming', resumeIn: 2.4 }) }),
  ));
  assert(resuming.includes('准备'), '恢复倒计时面板');

  const waveClear = text(renderToString(
    createElement(WaveClearPanel, {
      snapshot: makeSnapshot({
        phase: 'waveClear',
        waveSummary: { wave: 3, kills: 9, xp: 210, seconds: 42.5, damageTaken: 12, remaining: 2.4 },
      }),
    }),
  ));
  assert(waveClear.includes('第 3 波 清空'), '波次结算面板');
  assert(waveClear.includes('结算中无法攻击'), '结算提示');

  const upgrade = text(renderToString(
    createElement(UpgradeModal, {
      snapshot: makeSnapshot({
        phase: 'levelUp',
        upgradeChoices: [
          { id: 'sharp', name: '锋锐', en: 'Keen Edge', desc: '攻击力 +15%', tier: 'common', color: '#9fb6d4', stacks: 0 },
          { id: 'tempest', name: '暴风', en: 'Tempest', desc: '攻击力 +40%', tier: 'epic', color: '#ffcf5c', stacks: 2 },
          { id: 'meditate', name: '冥想', en: 'Meditation', desc: '冷却 -10%', tier: 'rare', color: '#7cc9ff', stacks: 1 },
        ],
      }),
      session: sessionStub,
    }),
  ));
  assert(upgrade.includes('锋锐') && upgrade.includes('暴风') && upgrade.includes('冥想'), '三个随机加成卡');
  assert(upgrade.includes('已叠加 ×2'), '显示叠加层数');

  const over = text(renderToString(
    createElement(GameOverOverlay, {
      snapshot: makeSnapshot({ phase: 'gameOver', lastDeath: { wave: 8, level: 7, kills: 96 } }),
      session: sessionStub,
    }),
  ));
  assert(over.includes('你倒下了') && over.includes('第 8 波'), '阵亡结算面板');

  const menu = text(renderToString(createElement(StartScreen, { snapshot: makeSnapshot({ status: 'menu' }), session: sessionStub })));
  assert(menu.includes('继续进度'), '有存档时显示继续按钮');
  assert(menu.includes('开始新游戏'), '显示新游戏按钮');
  assert(menu.includes('旋风斩') && menu.includes('影袭'), '主菜单展示操作说明');

  const toast = text(renderToString(createElement(Toast, { toast: { id: 1, text: '第 2 波 来了！', tone: 'info' } })));
  assertEqual(toast.includes('第 2 波'), true, '提示条渲染');
});
