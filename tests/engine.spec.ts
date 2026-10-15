/**
 * 引擎测试：逐条验证用户提出的需求。
 * 全部跑在 Node 里——因为模拟层（World）完全不依赖 DOM。
 */

import { GameClock } from '../src/engine/clock';
import type { Action } from '../src/engine/input';
import { ManualInput } from '../src/engine/input';
import { FIXED_STEP, FX, PLAYER_BASE, WAVE } from '../src/game/config';
import { MONSTER_DEFS } from '../src/game/content/monsters';
import { SKILLS } from '../src/game/content/skills';
import { waveScaling } from '../src/game/content/waves';
import { normalizeSave } from '../src/game/persistence';
import type { Monster, MonsterState } from '../src/game/types';
import { damagePlayer, killMonster } from '../src/game/systems/combat';
import { spawnMonsterAt } from '../src/game/systems/monsters';
import { addXp } from '../src/game/systems/progression';
import { trySpawnMonster } from '../src/game/systems/waves';
import { World } from '../src/game/world';
import { assert, assertClose, assertEqual, test } from './harness';

function steps(world: World, input: ManualInput, count: number): void {
  for (let i = 0; i < count; i++) world.update(FIXED_STEP, input);
}

function tap(world: World, input: ManualInput, action: Action): void {
  input.press(action);
  world.update(FIXED_STEP, input);
  input.release(action);
}

/** 关掉波次导演，方便做单点验证。 */
function isolate(world: World): void {
  world.plan = null;
  world.monsters.clear();
}

function killAll(world: World): void {
  for (let i = 0; i < world.monsters.count; i++) killMonster(world, world.monsters.items[i]);
}

function fingerprint(world: World): string {
  const player = world.player;
  const parts: string[] = [
    player.x.toFixed(4),
    player.y.toFixed(4),
    player.hp.toFixed(3),
    player.cooldowns.attack.toFixed(4),
    player.cooldowns.spin.toFixed(4),
    `count:${world.monsters.count}`,
  ];
  for (let i = 0; i < world.monsters.count; i++) {
    const m = world.monsters.items[i];
    parts.push(`${m.kind}:${m.x.toFixed(3)}:${m.y.toFixed(3)}:${m.hp.toFixed(2)}:${m.state}`);
  }
  return parts.join('|');
}

function reachable(world: World): ManualInput {
  const input = new ManualInput();
  steps(world, input, 10);
  return input;
}

// ───────────────────────── 需求 1：移动与二段跳 ─────────────────────────

test('需求1：左右方向键走动 + 跳跃 + 空中再跳一次（不能跳第三次）', () => {
  const world = new World(101);
  world.newRun(101);
  const input = reachable(world);
  const player = world.player;
  assert(player.onGround, '开局应当站在地面上');
  assertEqual(PLAYER_BASE.maxJumpCount, 2, '设定上只允许两段跳');

  input.press('right');
  steps(world, input, 30);
  input.release('right');
  const xAfterRight = player.x;
  assert(xAfterRight > 1.5, `按住右键应当向右走（x=${xAfterRight.toFixed(2)}）`);
  assertEqual(player.facing, 1, '朝向应当朝右');

  input.press('left');
  steps(world, input, 60);
  input.release('left');
  assert(player.x < xAfterRight - 2, `按住左键应当向左走（x=${player.x.toFixed(2)}）`);
  assertEqual(player.facing, -1, '朝向应当朝左');

  // 换到没有平台遮挡的空地，避免头顶撞到平台影响跳跃高度测量
  player.x = 20;
  player.vx = 0;

  // 单跳最高点：v^2/2g 约 3.1
  tap(world, input, 'jump');
  let singleApex = 0;
  for (let i = 0; i < 70; i++) {
    world.update(FIXED_STEP, input);
    singleApex = Math.max(singleApex, player.y);
  }
  assert(player.onGround, '单跳之后应当落回地面');
  assert(singleApex > 2.7 && singleApex < 3.6, `单跳高度应当约 3.1（实测 ${singleApex.toFixed(2)}）`);

  // 二段跳：空中再给一次向上的速度
  tap(world, input, 'jump');
  steps(world, input, 8);
  const heightBeforeAirJump = player.y;
  assert(heightBeforeAirJump > 1, '第一段跳应当已经离地');
  assertEqual(player.jumpsLeft, 1, '地面起跳后还剩一次空中跳');
  tap(world, input, 'jump');
  assert(player.vy > 12, '空中跳应当立刻给出向上的速度');
  assertEqual(player.jumpsLeft, 0, '空中跳已用完');
  let doubleApex = 0;
  for (let i = 0; i < 60; i++) {
    world.update(FIXED_STEP, input);
    doubleApex = Math.max(doubleApex, player.y);
  }
  assert(doubleApex > singleApex + 0.9, `二段跳应当明显更高（${doubleApex.toFixed(2)} vs ${singleApex.toFixed(2)}）`);

  // 落地后连点三次跳：最高点仍然只有两段跳的高度
  while (!player.onGround) world.update(FIXED_STEP, input);
  let apex = 0;
  for (let i = 0; i < 110; i++) {
    if (i === 0 || i === 9 || i === 18) input.press('jump');
    world.update(FIXED_STEP, input);
    input.release('jump');
    apex = Math.max(apex, player.y);
  }
  assert(apex < doubleApex + 0.7, `第三段跳必须无效（实测最高 ${apex.toFixed(2)}）`);
  assert(player.jumpsLeft >= 0, '剩余跳跃次数不能变成负数');
});

// ───────────────────────── 需求 2 / 3：技能与冷却 ─────────────────────────

test('需求2/3：普攻能砍怪，技能有冷却且冷却期间无法再用', () => {
  const world = new World(202);
  world.newRun(202);
  isolate(world);
  const input = reachable(world);
  const player = world.player;

  const target = spawnMonsterAt(world, 'grunt', false, player.x + 1.6, waveScaling(1));
  assert(target, '应当能刷出一只游荡者');
  target!.state = 'chase';
  const hpBefore = target!.hp;
  tap(world, input, 'attack');
  steps(world, input, 12);
  assert(target!.hp < hpBefore, '普攻应当砍到身前的怪');
  assert(player.cooldowns.attack > 0, '普攻也有短冷却');

  player.cooldowns.attack = 0;
  tap(world, input, 'spin');
  const cdAfterUse = player.cooldowns.spin;
  assertEqual(player.state, 'spin', '应当进入旋风斩动作');
  assert(cdAfterUse > SKILLS.spin.cooldown * 0.9, `旋风斩用完应当进入冷却（${cdAfterUse.toFixed(2)}s）`);

  input.press('spin');
  world.update(FIXED_STEP, input);
  input.release('spin');
  assert(player.cooldowns.spin <= cdAfterUse, '冷却期间再按不会重置冷却，也不能再放');

  steps(world, input, Math.ceil(cdAfterUse / FIXED_STEP) + 5);
  assertEqual(player.cooldowns.spin, 0, '冷却结束后技能重新可用');
  input.press('spin');
  world.update(FIXED_STEP, input);
  input.release('spin');
  assert(player.cooldowns.spin > SKILLS.spin.cooldown * 0.9, '冷却结束后可以再次释放');
});

test('需求2：旋风斩砍周围一圈的所有怪', () => {
  const world = new World(203);
  world.newRun(203);
  isolate(world);
  const input = reachable(world);
  const player = world.player;

  const positions = [player.x - 2.4, player.x + 2, player.x + 3.2];
  const monsters = positions.map((x) => {
    const m = spawnMonsterAt(world, 'grunt', false, x, waveScaling(1));
    assert(m, '应当能刷出怪');
    m!.state = 'chase';
    return m!;
  });
  const hpBefore = monsters.map((m) => m.hp);

  tap(world, input, 'spin');
  steps(world, input, 34);
  for (let i = 0; i < monsters.length; i++) {
    assert(monsters[i].hp < hpBefore[i], `身后的第 ${i + 1} 只怪也应该被旋风斩砍到`);
  }
});

test('需求2/3：冲刺位移、期间无敌、能撞伤怪；回血技能受冷却限制', () => {
  const world = new World(204);
  world.newRun(204);
  isolate(world);
  const input = reachable(world);
  const player = world.player;

  const target = spawnMonsterAt(world, 'grunt', false, player.x + 4, waveScaling(1));
  assert(target, '应当能刷出怪');
  target!.state = 'chase';
  const startX = player.x;

  tap(world, input, 'dash');
  assertEqual(player.state, 'dash', '应当进入冲刺');
  assert(player.invuln > 0, '冲刺期间处于无敌状态');
  const hpBeforeDash = player.hp;
  damagePlayer(world, 999, player.x - 1, null);
  assertEqual(player.hp, hpBeforeDash, '冲刺期间不会被打到（需求2）');

  steps(world, input, 24);
  assert(player.x > startX + 5, `冲刺应当向前位移一段（${(player.x - startX).toFixed(2)}）`);
  assert(target!.hp < target!.maxHp, '冲刺穿过怪物应当造成伤害');
  assert(player.cooldowns.dash > SKILLS.dash.cooldown * 0.9, '冲刺进入冷却');

  player.hp = Math.round(player.maxHp * 0.3);
  const hpLow = player.hp;
  tap(world, input, 'heal');
  assert(player.hp > hpLow, `回血技能应当立刻回血（${hpLow} -> ${player.hp}）`);
  assert(player.cooldowns.heal > SKILLS.heal.cooldown * 0.9, '回血技能进入长冷却');

  player.cooldowns.heal = 0;
  player.hp = player.maxHp;
  tap(world, input, 'heal');
  assertEqual(player.cooldowns.heal, 0, '满血时不会浪费回血技能的冷却');
});

// ───────────────────────── 需求 4：三种怪物 ─────────────────────────

test('需求4：三种怪数值与行为可区分（肉盾/脆皮/普通）', () => {
  const grunt = MONSTER_DEFS.grunt;
  const assassin = MONSTER_DEFS.assassin;
  const brute = MONSTER_DEFS.brute;

  assert(assassin.hp < grunt.hp && grunt.hp < brute.hp, '血量：刺影 < 游荡者 < 石魔');
  assert(assassin.damage > grunt.damage && grunt.damage > brute.damage, '伤害：刺影 > 游荡者 > 石魔');
  assert(assassin.speed > grunt.speed && grunt.speed > brute.speed, '速度：刺影 > 游荡者 > 石魔');
  assert(assassin.windup > grunt.windup * 1.8, `刺影出手前摇明显更长（${assassin.windup}s vs ${grunt.windup}s）`);
  assert(brute.superArmor, '石魔带超级护甲，很难被打断');
  assert(brute.w * brute.h > grunt.w * grunt.h && grunt.w * grunt.h > assassin.w * assassin.h, '体型大小一眼可分');
  assert(brute.hp / brute.damage > grunt.hp / grunt.damage, '石魔打不疼但砍不死');
});

test('需求4：刺影先蓄力再出手，玩家有反应时间', () => {
  const world = new World(205);
  world.newRun(205);
  isolate(world);
  const input = new ManualInput();
  const player = world.player;
  const assassin = spawnMonsterAt(world, 'assassin', false, player.x + 2.4, waveScaling(1));
  assert(assassin, '应当能刷出刺影');
  const foe = assassin as Monster;
  foe.state = 'chase';
  foe.attackCooldown = 0;

  let guard = 0;
  let reachedWindup = false;
  while (guard++ < 300) {
    world.update(FIXED_STEP, input);
    if ((foe.state as MonsterState) === 'windup') {
      reachedWindup = true;
      break;
    }
  }
  assert(reachedWindup, '刺影应当先进入蓄力状态');

  const hpBefore = player.hp;
  const windupSteps = Math.floor(MONSTER_DEFS.assassin.windup / FIXED_STEP);
  steps(world, input, windupSteps - 3);
  assertEqual(player.hp, hpBefore, '蓄力期间不会造成任何伤害（玩家有时间反应）');

  steps(world, input, 30);
  assert(player.hp < hpBefore, '站桩不动会被刺影打到');
});

// ───────────────────────── 需求 5 / 6：升级、波次与冻结 ─────────────────────────

test('需求5/6：升级弹三选一、回满血、没选完不能继续打', () => {
  const world = new World(206);
  world.newRun(206);
  isolate(world);
  const input = reachable(world);
  const player = world.player;
  player.hp = 20;
  const maxHpBefore = player.maxHp;
  const atkBefore = player.atk;

  addXp(world, player.xpNeed);
  world.update(FIXED_STEP, input);
  assertEqual(world.phase, 'levelUp', '经验满了应当进入升级选卡阶段');
  assertEqual(world.upgradeChoices.length, 3, '应当弹出三个随机加成');
  const ids = world.upgradeChoices.map((choice) => choice.id);
  assertEqual(new Set(ids).size, 3, '三个加成必须互不相同');
  assertEqual(player.level, 2, '等级 +1');
  assertEqual(player.hp, player.maxHp, '升级后血量回满');
  assert(player.maxHp > maxHpBefore && player.atk > atkBefore, '升级后血更多、攻击更高');

  const xBefore = player.x;
  const hpBefore = player.hp;
  input.press('attack');
  input.press('right');
  steps(world, input, 90);
  input.release('attack');
  input.release('right');
  assertEqual(player.x, xBefore, '没选完加成，角色不能移动（时间也不推进）');
  assertEqual(player.hp, hpBefore, '选卡期间不会掉血');
  assert(player.state !== 'attack', '选卡期间不能攻击');

  assert(world.chooseUpgrade(ids[0]), '选择加成应当生效');
  assertEqual(world.phase, 'playing', '选完后回到战斗');
  assert(world.upgradeIds.indexOf(ids[0]) >= 0, '加成被记录（用于存档）');
  assert(world.upgradeStacks.get(ids[0]) === 1, '叠加层数被统计');
});

test('需求5：攻击力加成会真实提高伤害（不只是显示好看）', () => {
  const world = new World(216);
  world.newRun(216);
  const input = reachable(world);

  const measure = (): number => {
    world.plan = null;
    world.monsters.clear();
    world.player.cooldowns.attack = 0;
    world.player.comboIndex = 0;
    world.player.comboWindow = 0;
    world.combatRng.seed = 987654321;
    const target = spawnMonsterAt(world, 'brute', false, world.player.x + 1.8, waveScaling(1));
    assert(target, '应当能刷出石魔');
    target!.state = 'chase';
    const before = target!.hp;
    tap(world, input, 'attack');
    steps(world, input, 12);
    return before - target!.hp;
  };

  const base = measure();
  world.player.mods.atkMul = 2;
  const doubled = measure();
  assert(base > 0, '普攻应当造成伤害');
  assert(doubled > base * 1.8, `攻击力加成应当让伤害接近翻倍（${base} -> ${doubled}）`);

  // 冷却缩减加成也要真的生效
  world.player.mods.cdMul = 0.5;
  world.player.cooldowns.attack = 0;
  world.player.state = 'idle';
  tap(world, input, 'attack');
  assertEqual(
    Math.round(world.player.cooldowns.attack * 1000) / 1000,
    Math.round(SKILLS.attack.cooldown * 0.5 * 1000) / 1000,
    '冷却缩减应当作用在技能冷却上',
  );
});

test('需求6：暂停时怪物不动、时间不前进；恢复后继续', () => {
  const world = new World(207);
  world.newRun(207);
  isolate(world);
  const input = reachable(world);
  spawnMonsterAt(world, 'grunt', false, 6, waveScaling(1));
  spawnMonsterAt(world, 'brute', false, 10, waveScaling(1));
  steps(world, input, 30);

  assert(world.pause(), '应当能进入暂停');
  const before = fingerprint(world);
  input.press('right');
  input.press('attack');
  steps(world, input, 180);
  input.release('right');
  input.release('attack');
  assertEqual(fingerprint(world), before, '暂停期间所有实体、冷却、位置都不变');
  assertEqual(world.phase, 'paused', '保持暂停状态');

  assert(world.resume(), '应当能继续');
  steps(world, input, 30);
  assert(fingerprint(world) !== before, '恢复后世界继续推进');
});

test('需求5/6：一波接一波、越来越强，结算期间不能攻击', () => {
  const world = new World(208);
  world.newRun(208);
  const input = new ManualInput();

  steps(world, input, 400);
  assert(world.monsters.count > 0, '第一波应当已经派出怪物');
  const wave1Total = world.plan!.total;
  assertEqual(world.wave, 1, '当前是第 1 波');

  killAll(world);
  steps(world, input, 60);
  assertEqual(world.phase, 'waveClear', '全部清空后进入结算');
  assert(world.intermission.kills > 0, '结算会统计本波击杀');

  const attackCdBefore = world.player.cooldowns.attack;
  input.press('attack');
  steps(world, input, 3);
  input.release('attack');
  assert(world.player.state !== 'attack', '结算期间不能再攻击（需求6）');
  assertEqual(world.player.cooldowns.attack, attackCdBefore, '结算期间不会消耗攻击冷却');

  steps(world, input, Math.ceil(WAVE.intermissionSeconds / FIXED_STEP) + 30);
  assertEqual(world.wave, 2, '结算结束后进入第 2 波');
  assert(world.plan!.total > wave1Total, `第 2 波的怪更多（${world.plan!.total} > ${wave1Total}）`);
  assert(waveScaling(2).hp > waveScaling(1).hp, '第 2 波的怪更强');
  assert(waveScaling(9).hp > waveScaling(2).hp, '越往后越强');
  assert(waveScaling(5).elite, '每 5 波出现精英波次');
});

// ───────────────────────── 需求 10：刷怪合法性 ─────────────────────────

test('需求10：怪不会刷在墙里，也不会一堆叠在同一个位置', () => {
  const world = new World(209);
  world.newRun(209);
  steps(world, new ManualInput(), 5);
  let spawned = 0;

  for (let wave = 1; wave <= 30; wave++) {
    world.wave = wave;
    world.monsters.clear();
    for (let i = 0; i < 14; i++) {
      const kind = (['grunt', 'assassin', 'brute'] as const)[i % 3];
      if (!trySpawnMonster(world, kind, false)) break;
      const monster = world.monsters.items[world.monsters.count - 1];
      spawned++;

      for (const solid of world.level.solids) {
        const overlaps =
          monster.x - monster.w * 0.5 < solid.left + solid.w &&
          monster.x + monster.w * 0.5 > solid.left &&
          monster.y + 0.06 < solid.bottom + solid.h &&
          monster.y + monster.h > solid.bottom;
        assert(!overlaps, `第 ${wave} 波：${monster.kind} 不能刷进墙体或平台里`);
      }

      for (let k = 0; k < world.monsters.count; k++) {
        const other = world.monsters.items[k];
        if (other === monster) continue;
        const minDistance = (monster.w + other.w) * 0.5;
        assert(
          Math.abs(monster.x - other.x) >= minDistance - 0.001,
          `第 ${wave} 波：怪物不能叠在同一个位置（最小间距 ${minDistance.toFixed(2)}）`,
        );
      }

      assert(Math.abs(monster.x - world.player.x) >= WAVE.minSpawnDistance * 0.6, '不能在玩家脸上刷怪');
    }
  }
  assert(spawned > 150, `应当完成大量合法刷怪（实际 ${spawned}）`);
});

// ───────────────────────── 需求 9：长跑稳定性 ─────────────────────────

test('需求9：长时间游玩，对象池与实体数量恒定，不会越来越占内存', () => {
  const world = new World(210);
  world.newRun(210);
  const input = new ManualInput();
  const particleCapacity = world.particles.items.length;
  const textCapacity = world.texts.items.length;
  const monsterCapacity = world.monsters.items.length;
  assertEqual(particleCapacity, FX.maxParticles, '粒子池容量固定');

  let maxParticles = 0;
  let maxTexts = 0;
  let maxMonsters = 0;
  let maxCells = 0;
  let upgradesChosen = 0;

  for (let i = 0; i < 5000; i++) {
    if (i % 17 === 0) input.press('attack');
    if (i % 90 === 0) input.press('jump');
    if (i % 240 === 0) input.press('dash');
    if (i % 400 === 0) input.press('spin');
    if (i % 640 === 0) input.press('heal');
    if (i % 2 === 0) input.press('right');
    else input.press('left');
    world.update(FIXED_STEP, input);
    input.clear();

    if (world.player.hp < world.player.maxHp * 0.5) world.player.hp = world.player.maxHp;
    if (world.phase === 'levelUp' && world.upgradeChoices.length > 0) {
      world.chooseUpgrade(world.upgradeChoices[0].id);
      upgradesChosen++;
    }
    if (i % 150 === 0) killAll(world);

    maxParticles = Math.max(maxParticles, world.particles.count);
    maxTexts = Math.max(maxTexts, world.texts.count);
    maxMonsters = Math.max(maxMonsters, world.monsters.count);
    maxCells = Math.max(maxCells, world.grid.cellCount);
  }

  assert(upgradesChosen > 3, `长跑期间应当多次进入升级选卡（实际 ${upgradesChosen} 次）`);
  assert(maxParticles <= FX.maxParticles, `粒子数不能超过池容量（峰值 ${maxParticles}）`);
  assert(maxTexts <= FX.maxTexts, `飘字不能超过池容量（峰值 ${maxTexts}）`);
  assert(maxMonsters <= FX.maxMonsters, `同屏怪物不能超过上限（峰值 ${maxMonsters}）`);
  assertEqual(world.particles.items.length, particleCapacity, '粒子池没有扩容');
  assertEqual(world.texts.items.length, textCapacity, '飘字池没有扩容');
  assertEqual(world.monsters.items.length, monsterCapacity, '怪物池没有扩容');
  assert(maxCells <= 2000, `空间网格单元数有界（峰值 ${maxCells}）`);

  world.monsters.clear();
  steps(world, input, 240);
  assert(world.particles.count < FX.maxParticles * 0.5, '安静下来后粒子会被回收');
});

// ───────────────────────── 需求 7：存档 ─────────────────────────

test('需求7：进度可以存档并原样恢复（等级/经验/属性/加成/波次）', () => {
  const world = new World(211);
  world.newRun(211);
  const input = reachable(world);
  world.player.hp = world.player.maxHp * 0.6;
  addXp(world, world.player.xpNeed + 20);
  world.update(FIXED_STEP, input);
  if (world.phase === 'levelUp') world.chooseUpgrade(world.upgradeChoices[1].id);
  steps(world, input, 120);

  const run = world.serializeRun();
  assert(run, '进行中的一局应当可以序列化');
  const restored = new World(1);
  restored.loadRun(run!);

  assertEqual(restored.player.level, world.player.level, '等级恢复');
  assertEqual(restored.player.maxHp, world.player.maxHp, '最大生命恢复（含加成）');
  assertEqual(restored.player.atk, world.player.atk, '攻击力恢复');
  assertClose(restored.player.hp, world.player.hp, 1.01, '当前血量恢复');
  assertEqual(restored.upgradeIds.length, world.upgradeIds.length, '加成列表恢复');
  assertEqual(restored.wave, world.wave, '波次恢复');
  assertEqual(restored.seed, world.seed, '随机种子恢复（地形一致）');
  assert(restored.plan !== null, '恢复后直接开始该波次的战斗');
});

test('需求7：坏档 / 老档不会把游戏搞崩', () => {
  const empty = normalizeSave(null);
  assertEqual(empty.run, null, '空存档应当没有进行中的进度');
  assertEqual(empty.best.wave, 1, '默认最佳波次');

  const garbage = normalizeSave({ run: { seed: 'oops', wave: -5, level: 'x', upgrades: [1, 'sharp', null] } });
  assert(garbage.run !== null, '有 seed 字段就视为有效进度');
  assertEqual(garbage.run!.wave, 1, '非法波次被钳制到 1');
  assertEqual(garbage.run!.level, 1, '非法等级被钳制到 1');
  assertEqual(garbage.run!.upgrades.length, 1, '非法加成被过滤');

  const world = new World(1);
  world.loadRun({
    seed: 12345,
    level: 6,
    xp: 999999,
    hp: 1,
    wave: 7,
    kills: 12,
    playTimeMs: 5000,
    upgrades: ['sharp', 'tough', 'not-an-upgrade'],
  });
  assertEqual(world.player.level, 6, '等级按存档恢复');
  assert(world.player.xp <= world.player.xpNeed, '经验被钳制在合理范围');
  assertEqual(world.upgradeIds.length, 2, '未知加成被安全忽略');
  assert(world.player.maxHp > PLAYER_BASE.maxHp, '已选加成正确重放');
  assertEqual(world.wave, 7, '波次恢复');
});

// ───────────────────────── 时间与暂停语义 ─────────────────────────

test('时钟：切走再回来不会一次性补跑一大段时间', () => {
  const clock = new GameClock({ fixedStep: FIXED_STEP, maxStepsPerFrame: 5, maxFrameDelta: 0.2 });
  let ticks = 0;
  const executed = clock.advance(30, () => {
    ticks++;
  });
  assert(executed <= 12, `单帧最多补算少量逻辑步（实际 ${executed}）`);
  assertEqual(ticks, executed, '逻辑步数与返回值一致');
  assert(clock.droppedTime > 20, '超出的时间被直接丢弃，而不是攒着');
  assertClose(clock.elapsed, executed * FIXED_STEP, 0.001, '模拟时间只前进被真正执行的部分');
});
