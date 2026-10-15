/**
 * 内容层 · 玩家实体。
 * 只负责"对象长什么样 / 怎么重置"，行为逻辑在 systems/ 里。
 */

import { ARENA, PLAYER_BASE, xpNeededForLevel } from '../config';
import { createCooldowns, createDefaultMods, type Player } from '../types';

export function createPlayer(): Player {
  return {
    x: 0,
    y: ARENA.floorY,
    vx: 0,
    vy: 0,
    w: PLAYER_BASE.w,
    h: PLAYER_BASE.h,
    facing: 1,
    hp: PLAYER_BASE.maxHp,
    maxHp: PLAYER_BASE.maxHp,
    atk: PLAYER_BASE.atk,
    level: 1,
    xp: 0,
    xpNeed: xpNeededForLevel(1),
    onGround: true,
    jumpsLeft: PLAYER_BASE.maxJumpCount,
    coyote: 0,
    jumpBuffer: 0,
    landingSquash: 0,
    state: 'idle',
    stateTime: 0,
    attackWindup: 0,
    attackActive: 0,
    attackRecover: 0,
    comboIndex: 0,
    comboWindow: 0,
    swingHitIds: new Int32Array(64),
    swingHitCount: 0,
    invuln: 0,
    hurtTimer: 0,
    dashId: 0,
    dashHits: 0,
    cooldowns: createCooldowns(),
    walkAnim: 0,
    spinAngle: 0,
    bodyRoll: 0,
    attackSwing: 0,
    mods: createDefaultMods(),
    alive: true,
    kills: 0,
    damageDealt: 0,
    damageTaken: 0,
  };
}

/** 原地重置玩家（不重新分配对象，避免长期运行产生垃圾）。 */
export function resetPlayer(player: Player, x: number): void {
  player.x = x;
  player.y = ARENA.floorY;
  player.vx = 0;
  player.vy = 0;
  player.facing = 1;
  player.hp = PLAYER_BASE.maxHp;
  player.maxHp = PLAYER_BASE.maxHp;
  player.atk = PLAYER_BASE.atk;
  player.level = 1;
  player.xp = 0;
  player.xpNeed = xpNeededForLevel(1);
  player.onGround = true;
  player.jumpsLeft = PLAYER_BASE.maxJumpCount;
  player.coyote = 0;
  player.jumpBuffer = 0;
  player.landingSquash = 0;
  player.state = 'idle';
  player.stateTime = 0;
  player.attackWindup = 0;
  player.attackActive = 0;
  player.attackRecover = 0;
  player.comboIndex = 0;
  player.comboWindow = 0;
  player.swingHitCount = 0;
  player.invuln = 0;
  player.hurtTimer = 0;
  player.dashId = 0;
  player.dashHits = 0;
  player.cooldowns.attack = 0;
  player.cooldowns.spin = 0;
  player.cooldowns.dash = 0;
  player.cooldowns.heal = 0;
  player.walkAnim = 0;
  player.spinAngle = 0;
  player.bodyRoll = 0;
  player.attackSwing = 0;
  player.mods = createDefaultMods();
  player.alive = true;
  player.kills = 0;
  player.damageDealt = 0;
  player.damageTaken = 0;
}
