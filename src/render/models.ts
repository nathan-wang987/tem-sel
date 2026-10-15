/**
 * 渲染层 · 体素模型（玩家 / 三种怪物 / 场景道具）。
 *
 * 全部由盒子拼成，颜色是固定调色板；同一个模型函数会根据实体状态改变姿势：
 * 走路摆腿、跳跃收腿、挥剑、旋风自转、冲刺前倾、受击闪白、出手前摇后仰……
 *
 * 三种怪物一眼可分：
 *  - 游荡者：橄榄绿矮胖，圆头 + 两只黄色大眼。
 *  - 刺影  ：细高红黑，尖头带刺冠，前摇时整身泛红并后仰。
 *  - 石魔  ：宽大灰紫，粗壮双臂，背上有石板，移动时上下颠。
 */

import { MONSTER_DEFS } from '../game/content/monsters';
import type { LevelProp, Monster, Player } from '../game/types';
import { mixColor, pack } from './palette';
import type { PartSink } from './rasterizer';

const P_ARMOR = pack(88, 126, 190);
const P_ARMOR_DARK = pack(52, 80, 132);
const P_TRIM = pack(240, 198, 96);
const P_SKIN = pack(238, 196, 154);
const P_BOOT = pack(72, 54, 44);
const P_BLADE = pack(208, 230, 255);
const P_HILT = pack(148, 108, 64);
const P_CAPE = pack(198, 68, 82);

const WHITE = pack(255, 255, 255);
const GOLD = pack(255, 208, 108);

/** 模型发射状态（渲染是单线程非重入的，用模块级变量避免逐盒分配对象）。 */
let bodyCX = 0;
let bodyCY = 0;
let bodySpin = 0;
let modelAlpha = 1;
let modelOutline = true;
let modelFog = 0;
let modelFlat = 0;
let tintColor = 0;
let tintAmount = 0;

export function beginModel(centerX: number, centerY: number, spin: number, fog: number, alpha: number, outline: boolean): void {
  bodyCX = centerX;
  bodyCY = centerY;
  bodySpin = spin;
  modelFog = fog;
  modelAlpha = alpha;
  modelOutline = outline;
  modelFlat = 0;
  tintAmount = 0;
}

export function setTint(color: number, amount: number): void {
  tintColor = color;
  tintAmount = amount;
}

export function setFlatShade(value: number): void {
  modelFlat = value;
}

/**
 * 发射一个盒子。
 * rotZ 绕自身 pivotY（默认盒心）旋转；处于自转状态时统一绕身体中心旋转。
 */
export function emitBox(
  sink: PartSink,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: number,
  rotZ = 0,
  pivotY = 0,
  pivotX = 0,
): void {
  const s = sink.style;
  s.outline = modelOutline;
  s.alpha = modelAlpha;
  s.fog = modelFog;
  s.flat = modelFlat;
  s.rotZ = rotZ;
  if (bodySpin !== 0) {
    s.rotY = bodySpin;
    s.pivotX = bodyCX - x;
    s.pivotY = bodyCY - (y + h * 0.5);
    s.pivotZ = -z;
  } else {
    s.rotY = 0;
    s.pivotX = pivotX;
    s.pivotY = pivotY;
    s.pivotZ = 0;
  }
  const shaded = tintAmount > 0 ? mixColor(color, tintColor, tintAmount) : color;
  sink.box(x, y, z, w, h, d, shaded);
}

export function drawPlayer(sink: PartSink, p: Player, time: number): void {
  const air = !p.onGround;
  const spin = p.state === 'spin' ? p.spinAngle : 0;
  const blink = p.invuln > 0 && p.state !== 'dash' && Math.floor(time * 16) % 2 === 0;
  const dashGhost = p.state === 'dash';
  beginModel(p.x, p.y + p.h * 0.5, spin, 0, dashGhost ? 0.72 : blink ? 0.42 : 1, true);
  setTint(WHITE, p.hurtTimer > 0 ? 0.35 : 0);

  const walk = Math.sin(p.walkAnim);
  const squash = p.landingSquash;
  const crouch = squash * 0.14;
  const lean = p.state === 'dash' ? 0.5 : p.state === 'attack' ? 0.05 + p.attackSwing * 0.12 : 0;
  const leanZ = -lean * p.facing;
  const bob = air ? 0.08 : Math.abs(walk) * 0.05;
  const baseY = p.y + bob;
  const legTop = 0.92 - crouch;
  const torsoY = baseY + legTop;
  const headY = torsoY + 0.8;
  const f = p.facing;

  // 腿 + 靴子
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const swing = air ? (side === f ? -0.35 : 0.42) : walk * side * 0.5;
    const legX = p.x + side * 0.25;
    const rotZ = spin !== 0 ? 0 : swing;
    const pivotY = legTop * 0.5;
    emitBox(sink, legX, baseY, 0, 0.36, legTop, 0.42, P_ARMOR_DARK, rotZ, pivotY);
    emitBox(sink, legX + (air ? side * 0.12 : 0), baseY, 0.06, 0.42, 0.22, 0.48, P_BOOT, rotZ, pivotY);
  }

  // 躯干 + 腰带 + 披风
  emitBox(sink, p.x, torsoY, 0, 0.98, 0.8 - crouch, 0.6, P_ARMOR, leanZ, -(0.4 - crouch * 0.5));
  emitBox(sink, p.x, torsoY + 0.06, 0, 1.04, 0.16, 0.64, P_TRIM, leanZ, -(0.4 - crouch * 0.5));
  emitBox(sink, p.x - f * 0.34, torsoY - 0.1, -0.34, 0.42, 0.9, 0.12, P_CAPE, spin !== 0 ? 0 : -f * 0.1);

  // 肩甲
  emitBox(sink, p.x - f * 0.58, torsoY + 0.52, 0, 0.3, 0.28, 0.62, P_TRIM, leanZ, 0);
  emitBox(sink, p.x + f * 0.58, torsoY + 0.52, 0, 0.3, 0.28, 0.62, P_TRIM, leanZ, 0);

  // 头 + 面罩 + 盔缨
  emitBox(sink, p.x, headY, 0, 0.64, 0.6, 0.58, P_SKIN, leanZ * 0.5, -0.3);
  emitBox(sink, p.x, headY + 0.24, 0.3, 0.5, 0.14, 0.06, P_ARMOR_DARK, leanZ * 0.5, 0, 0);
  emitBox(sink, p.x, headY + 0.6, -0.04, 0.16, 0.3, 0.16, P_CAPE, leanZ * 0.5, -0.15);

  // 剑臂：前摇抬起 → 挥砍 → 收招
  const attackAngle = attackSwordAngle(p);
  const shoulderX = p.x + f * 0.5;
  const shoulderY = torsoY + 0.52;
  const handDistance = 0.72;
  const handX = shoulderX + f * Math.cos(attackAngle) * handDistance;
  const handY = shoulderY - 0.1 + Math.sin(attackAngle) * handDistance * 0.7;
  emitBox(sink, (shoulderX + handX) * 0.5, (shoulderY + handY) * 0.5 - 0.16, 0, 0.24, 0.34, 0.24, P_ARMOR_DARK, -attackAngle * f * 0.5);

  const bladeX = handX + f * Math.cos(attackAngle) * 0.85;
  const bladeY = handY + Math.sin(attackAngle) * 0.85 * 0.7;
  const bladeRotZ = -attackAngle * f;
  emitBox(sink, bladeX, bladeY - 0.1, 0.06, 0.12, 1.5, 0.2, P_BLADE, bladeRotZ, 0);
  emitBox(sink, handX + f * 0.1, handY - 0.06, 0.06, 0.16, 0.3, 0.22, P_HILT, bladeRotZ, 0);
}

/** 挥砍角度：0 表示水平向前，正角度表示向上抬。 */
function attackSwordAngle(p: Player): number {
  if (p.state !== 'attack') {
    return p.state === 'dash' ? 0.9 : 0.25;
  }
  const t = p.attackSwing;
  const windEnd = 0.35;
  if (t < windEnd) return 1.2 * (t / windEnd);
  const k = (t - windEnd) / 0.65;
  return 1.2 - 2.3 * Math.min(1, k);
}

export function drawMonster(sink: PartSink, m: Monster, time: number): void {
  const def = MONSTER_DEFS[m.kind];
  const body = pack(def.body[0], def.body[1], def.body[2]);
  const accent = pack(def.accent[0], def.accent[1], def.accent[2]);
  const eye = pack(def.eye[0], def.eye[1], def.eye[2]);

  const spawnProgress = m.state === 'spawn' ? 1 - Math.max(0, m.spawnTimer / Math.max(0.01, def.spawnTime)) : 1;
  const rise = m.state === 'spawn' ? (1 - spawnProgress) * (m.h + 0.6) : 0;
  const dead = m.state === 'dead';
  const deadSquash = dead ? 1 - Math.min(1, 1 - m.deadTimer / 0.42) * 0.75 : 1;
  const baseY = m.y - rise + (dead ? -0.2 : 0);
  const facing = m.facing;

  beginModel(m.x, baseY + m.h * 0.5, 0, 0, dead ? Math.max(0.15, deadSquash) : 1, true);
  setTint(WHITE, m.hitFlash * 0.85);
  if (m.elite) setTint(GOLD, 0.18);

  const bob = m.state === 'chase' ? Math.abs(Math.sin(m.animPhase)) * 0.07 : 0;
  const telegraph = m.state === 'windup' ? Math.min(1, m.stateTime / Math.max(0.01, def.windup)) : 0;
  const lunge = m.state === 'attack' ? 1 : 0;
  const leanBack = telegraph * -0.42 * facing;
  const leanForward = lunge * 0.3 * facing;
  const rotZ = -(leanBack + leanForward);
  const w = m.w;
  const h = m.h;

  if (m.kind === 'grunt') {
    const legTop = h * 0.32;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(m.animPhase * 1.6 + (side > 0 ? 0 : Math.PI)) * 0.3;
      emitBox(sink, m.x + side * w * 0.22, baseY + bob, 0, w * 0.3, legTop, 0.36, accent, swing, legTop * 0.5);
    }
    emitBox(sink, m.x, baseY + bob + legTop, 0, w, h * 0.42, 0.72, body, rotZ, -h * 0.21);
    emitBox(sink, m.x, baseY + bob + legTop + h * 0.42, 0, w * 0.8, h * 0.3, 0.7, body, rotZ, -h * 0.15);
    emitBox(sink, m.x, baseY + bob + legTop + h * 0.16, 0.36, w * 0.42, h * 0.1, 0.1, accent, 0, 0);
    emitBox(sink, m.x - facing * w * 0.5, baseY + bob + legTop + h * 0.16, 0, w * 0.24, h * 0.26, 0.3, accent, rotZ, 0);
    emitBox(sink, m.x + facing * w * 0.5, baseY + bob + legTop + h * 0.16, 0, w * 0.24, h * 0.26, 0.3, accent, rotZ, 0);
    const eyeZ = 0.36;
    emitBox(sink, m.x + w * 0.2, baseY + bob + legTop + h * 0.44, eyeZ, 0.14, 0.12, 0.06, eye, 0, 0);
    emitBox(sink, m.x - w * 0.2, baseY + bob + legTop + h * 0.44, eyeZ, 0.14, 0.12, 0.06, eye, 0, 0);
  } else if (m.kind === 'assassin') {
    const legTop = h * 0.44;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(m.animPhase * 2 + (side > 0 ? 0 : Math.PI)) * 0.45;
      emitBox(sink, m.x + side * w * 0.2, baseY, 0, w * 0.22, legTop, 0.28, accent, swing, legTop * 0.5);
    }
    emitBox(sink, m.x, baseY + legTop, 0, w * 0.78, h * 0.34, 0.5, body, rotZ, -h * 0.17);
    emitBox(sink, m.x, baseY + legTop + h * 0.34, 0.02, w * 0.52, h * 0.16, 0.46, accent, rotZ, -h * 0.08);
    // 爪
    emitBox(sink, m.x - facing * w * 0.62, baseY + legTop + h * 0.1, 0.1, w * 0.3, h * 0.16, 0.22, accent, rotZ, 0);
    emitBox(sink, m.x + facing * w * 0.66, baseY + legTop + h * 0.14, 0.1, w * 0.34, h * 0.18, 0.22, accent, rotZ, 0);
    const eyeZ = 0.24;
    emitBox(sink, m.x + w * 0.16, baseY + legTop + h * 0.38, eyeZ, 0.12, 0.1, 0.06, eye, 0, 0);
    emitBox(sink, m.x - w * 0.16, baseY + legTop + h * 0.38, eyeZ, 0.12, 0.1, 0.06, eye, 0, 0);
    for (let i = 0; i < 3; i++) {
      const spike = 0.16 - i * 0.03;
      emitBox(sink, m.x + (i - 1) * 0.16, baseY + legTop + h * 0.5, -0.1, 0.1, spike + 0.2, 0.1, body, 0, 0);
    }
  } else {
    // 石魔
    const legTop = h * 0.24;
    const stomp = Math.abs(Math.sin(m.animPhase * 0.9)) * 0.12;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      emitBox(sink, m.x + side * w * 0.24, baseY + stomp * (side > 0 ? 1 : 0.4), 0, w * 0.32, legTop, 0.5, accent, 0, legTop * 0.5);
    }
    emitBox(sink, m.x, baseY + legTop + stomp, 0, w, h * 0.46, 0.9, body, rotZ, -h * 0.23);
    emitBox(sink, m.x, baseY + legTop + h * 0.46 + stomp, 0, w * 0.86, h * 0.18, 0.86, accent, rotZ, -h * 0.09);
    emitBox(sink, m.x, baseY + legTop + h * 0.64 + stomp, 0, w * 0.46, h * 0.2, 0.66, body, rotZ, -h * 0.1);
    // 石板与巨臂
    emitBox(sink, m.x, baseY + legTop + h * 0.6 + stomp, -0.5, w * 0.7, h * 0.3, 0.2, accent, 0, 0);
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      emitBox(sink, m.x + side * w * 0.62, baseY + legTop + h * 0.2 + stomp, 0.05, w * 0.34, h * 0.36, 0.5, body, rotZ * 0.4, 0);
      emitBox(sink, m.x + side * w * 0.66, baseY + legTop + stomp, 0.05, w * 0.4, h * 0.16, 0.56, accent, 0, 0);
    }
    const eyeZ = 0.36;
    emitBox(sink, m.x, baseY + legTop + h * 0.68 + stomp, eyeZ, w * 0.3, 0.12, 0.06, eye, 0, 0);
  }

  if (m.elite) {
    setFlatShade(1.22);
    emitBox(sink, m.x, baseY + h, 0, 0.3, 0.22, 0.3, GOLD, 0, 0);
    setFlatShade(0);
  }
  setTint(WHITE, 0);
  void time;
}

export function drawProp(sink: PartSink, prop: LevelProp): void {
  const color = pack(prop.color[0], prop.color[1], prop.color[2]);
  const dark = mixColor(color, 0x101018, 0.4);
  beginModel(prop.x, prop.y, 0, 0, 1, true);
  setTint(WHITE, 0);
  const s = prop.scale;
  switch (prop.kind) {
    case 'pillar': {
      emitBox(sink, prop.x, prop.y, prop.z, 1.1 * s, 7 * s, 1.1 * s, color, 0, 0, prop.rotY);
      emitBox(sink, prop.x, prop.y + 7 * s, prop.z, 1.5 * s, 0.6 * s, 1.5 * s, dark);
      emitBox(sink, prop.x, prop.y, prop.z, 1.5 * s, 0.5 * s, 1.5 * s, dark);
      break;
    }
    case 'torch': {
      emitBox(sink, prop.x, prop.y, prop.z, 0.2 * s, 2.6 * s, 0.2 * s, dark);
      setFlatShade(1.25);
      emitBox(sink, prop.x, prop.y + 2.5 * s, prop.z, 0.5 * s, 0.6 * s, 0.5 * s, pack(255, 176, 92));
      emitBox(sink, prop.x, prop.y + 2.9 * s, prop.z, 0.3 * s, 0.4 * s, 0.3 * s, pack(255, 232, 156));
      setFlatShade(0);
      break;
    }
    case 'banner': {
      emitBox(sink, prop.x, prop.y, prop.z, 0.16 * s, 3.4 * s, 0.16 * s, dark);
      emitBox(sink, prop.x, prop.y + 1.6 * s, prop.z, 1.5 * s, 1.8 * s, 0.12 * s, color);
      break;
    }
    case 'crate': {
      emitBox(sink, prop.x, prop.y, prop.z, 1.2 * s, 1.2 * s, 1.2 * s, color);
      emitBox(sink, prop.x, prop.y + 0.55 * s, prop.z, 1.3 * s, 0.14 * s, 1.3 * s, dark);
      break;
    }
    case 'bone': {
      emitBox(sink, prop.x - 0.3 * s, prop.y, prop.z, 0.9 * s, 0.16 * s, 0.16 * s, pack(224, 220, 200));
      emitBox(sink, prop.x + 0.3 * s, prop.y, prop.z + 0.2, 0.7 * s, 0.14 * s, 0.14 * s, pack(200, 196, 180));
      break;
    }
    case 'rubble': {
      emitBox(sink, prop.x, prop.y, prop.z, 1.0 * s, 0.5 * s, 1.0 * s, color);
      emitBox(sink, prop.x + 0.5 * s, prop.y, prop.z + 0.3 * s, 0.6 * s, 0.3 * s, 0.6 * s, dark);
      break;
    }
  }
}
