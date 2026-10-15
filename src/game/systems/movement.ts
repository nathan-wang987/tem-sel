/**
 * 引擎层 · 玩家移动。
 *
 * 需求 1：左右方向键走动 + 可以跳，跳起来之后还能再往上跳一次（二段跳）。
 * 手感细节：土狼时间、跳跃缓冲、落地压扁、空中控制略弱、奔跑扬尘。
 */

import { approach, clamp } from '../../engine/math';
import { moveAndCollide } from '../../engine/physics';
import { wasActionPressed, type InputSource } from '../../engine/input';
import { ARENA, GRAVITY, PLAYER_BASE } from '../config';
import type { World } from '../world';
import { spawnAirJumpRing, spawnDust } from './effects';

const DUST_COLOR = [150, 142, 160] as const;

export function updatePlayerMovement(world: World, dt: number, input: InputSource): void {
  const p = world.player;
  if (!p.alive) return;
  const result = world.moveResult;
  const speed = PLAYER_BASE.speed * p.mods.speedMul;

  if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
  if (p.landingSquash > 0) p.landingSquash = Math.max(0, p.landingSquash - dt * 4);

  const locked =
    p.state === 'attack' || p.state === 'spin' || p.state === 'heal' || p.hurtTimer > 0;

  let moveDir = 0;
  if (!locked && p.state !== 'dash') {
    if (input.isDown('left') && !input.isDown('right')) moveDir = -1;
    else if (input.isDown('right') && !input.isDown('left')) moveDir = 1;
  }

  if (p.state === 'dash') {
    // 冲刺速度由技能系统完全接管。
  } else if (p.hurtTimer > 0) {
    p.hurtTimer = Math.max(0, p.hurtTimer - dt);
    p.vx = approach(p.vx, 0, 24 * dt);
    if (p.hurtTimer <= 0 && p.state === 'hurt') {
      p.state = p.onGround ? 'idle' : 'air';
      p.stateTime = 0;
    }
  } else if (locked) {
    // 出招期间不能自由移动，但保留一点惯性。
    p.vx = approach(p.vx, 0, (p.onGround ? 34 : 12) * dt);
  } else if (moveDir !== 0) {
    const accel = p.onGround ? PLAYER_BASE.accel : PLAYER_BASE.airAccel;
    p.vx = approach(p.vx, moveDir * speed, accel * dt);
    p.facing = moveDir > 0 ? 1 : -1;
    if (p.onGround) p.walkAnim += dt * (Math.abs(p.vx) / Math.max(1, speed)) * 9;
  } else {
    const friction = p.onGround ? PLAYER_BASE.friction : PLAYER_BASE.friction * 0.3;
    p.vx = approach(p.vx, 0, friction * dt);
  }

  // 跳跃缓冲：落地前一点点按跳也能跳起来。
  if (wasActionPressed(world.pressedActions, world.pressedCount, 'jump') ||
      wasActionPressed(world.pressedActions, world.pressedCount, 'up')) {
    p.jumpBuffer = PLAYER_BASE.jumpBufferTime;
  } else if (p.jumpBuffer > 0) {
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  }

  const canGroundJump = p.onGround || p.coyote > 0;
  const wantJump = p.jumpBuffer > 0 && !locked && p.state !== 'dash';
  if (wantJump && (canGroundJump || p.jumpsLeft > 0)) {
    const airJump = !canGroundJump;
    const power = PLAYER_BASE.jumpVelocity * p.mods.jumpMul * (airJump ? PLAYER_BASE.airJumpMul : 1);
    p.vy = power;
    p.onGround = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.state = 'air';
    p.stateTime = 0;
    if (airJump) {
      p.jumpsLeft = Math.max(0, p.jumpsLeft - 1);
      spawnAirJumpRing(world, p.x, p.y + 0.25, 0, [168, 232, 255]);
      spawnDust(world, p.x, p.y + 0.15, 0, DUST_COLOR, 5);
    } else {
      p.jumpsLeft = Math.max(0, PLAYER_BASE.maxJumpCount - 1);
      spawnDust(world, p.x, p.y, 0, DUST_COLOR, 6);
    }
    world.events.emit('jump', { air: airJump });
  }

  p.vy += GRAVITY * dt;
  if (p.vy < -PLAYER_BASE.maxFallSpeed) p.vy = -PLAYER_BASE.maxFallSpeed;

  const wasOnGround = p.onGround;
  moveAndCollide(p, p.vx * dt, p.vy * dt, world.level.solids, result);
  p.onGround = result.landed;
  if (result.hitCeiling && p.vy > 0) p.vy = 0;
  if (result.hitWall) p.vx = 0;

  if (result.landed) {
    p.vy = 0;
    p.jumpsLeft = Math.max(0, PLAYER_BASE.maxJumpCount - 1);
    if (!wasOnGround) {
      p.landingSquash = 1;
      spawnDust(world, p.x, p.y, 0, DUST_COLOR, 6);
      if (p.state === 'air') {
        p.state = 'idle';
        p.stateTime = 0;
      }
    }
  }

  if (p.onGround) p.coyote = PLAYER_BASE.coyoteTime;
  else p.coyote = Math.max(0, p.coyote - dt);

  // 场地边界
  const halfW = p.w * 0.5;
  if (p.x < ARENA.minX + halfW) {
    p.x = ARENA.minX + halfW;
    p.vx = 0;
  } else if (p.x > ARENA.maxX - halfW) {
    p.x = ARENA.maxX - halfW;
    p.vx = 0;
  }
  if (p.y < ARENA.floorY - 14) {
    p.y = ARENA.floorY;
    p.vy = 0;
  }

  if (!locked && p.state !== 'dash' && p.state !== 'dead') {
    if (!p.onGround) p.state = 'air';
    else p.state = Math.abs(p.vx) > 0.4 ? 'run' : 'idle';
  }

  // 奔跑扬尘
  if (p.onGround && Math.abs(p.vx) > speed * 0.75) {
    world.footstepTimer -= dt;
    if (world.footstepTimer <= 0) {
      world.footstepTimer = 0.16;
      spawnDust(world, p.x - Math.sign(p.vx) * 0.4, p.y, 0, DUST_COLOR, 2);
    }
  }

  p.bodyRoll = clamp((-p.vx / Math.max(1, speed)) * 0.12, -0.16, 0.16);
}
