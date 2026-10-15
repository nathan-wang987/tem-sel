/**
 * 平台层 · 键盘 / 鼠标输入绑定。
 *
 * 只把物理按键翻译成引擎动作，模拟层完全不知道键盘的存在。
 * 按键会先在浏览器里判断是否按住，再产出"本步新按下"的边沿事件。
 */

import type { Action, InputSource } from '../engine/input';

const DEFAULT_BINDINGS: Record<string, Action> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyJ: 'attack',
  KeyZ: 'attack',
  KeyK: 'spin',
  Digit1: 'spin',
  KeyL: 'dash',
  Digit2: 'dash',
  KeyH: 'heal',
  Digit3: 'heal',
  KeyP: 'pause',
  Escape: 'pause',
  Enter: 'confirm',
};

/** 这些按键不参与"确认"逻辑，避免和移动/跳跃互相触发。 */
const CONFIRM_KEYS = new Set(['Enter']);

export class KeyboardInput implements InputSource {
  private held = new Set<Action>();
  private pressed: Action[] = [];
  private disposers: Array<() => void> = [];

  attach(target: Window = window): void {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = DEFAULT_BINDINGS[event.code];
      if (!action) return;
      if (event.repeat) {
        event.preventDefault();
        return;
      }
      this.press(action);
      if (action === 'jump' || action === 'pause' || CONFIRM_KEYS.has(event.code)) event.preventDefault();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const action = DEFAULT_BINDINGS[event.code];
      if (!action) return;
      this.release(action);
      if (action === 'jump') event.preventDefault();
    };
    const onBlur = () => this.clear();

    target.addEventListener('keydown', onKeyDown, { passive: false });
    target.addEventListener('keyup', onKeyUp, { passive: false });
    target.addEventListener('blur', onBlur);
    this.disposers.push(
      () => target.removeEventListener('keydown', onKeyDown),
      () => target.removeEventListener('keyup', onKeyUp),
      () => target.removeEventListener('blur', onBlur),
    );
  }

  /** 供鼠标点击 / 屏幕按钮注入动作。 */
  press(action: Action): void {
    if (this.held.has(action)) return;
    this.held.add(action);
    this.pressed.push(action);
  }

  release(action: Action): void {
    this.held.delete(action);
  }

  isDown(action: Action): boolean {
    return this.held.has(action);
  }

  drainPressed(out: Action[]): number {
    let count = 0;
    for (let i = 0; i < this.pressed.length; i++) {
      const action = this.pressed[i];
      if (action !== undefined) out[count++] = action;
    }
    this.pressed.length = 0;
    return count;
  }

  /** 清空所有状态（切窗口、暂停时调用，避免恢复后一次性触发一堆动作）。 */
  clear(): void {
    this.held.clear();
    this.pressed.length = 0;
  }

  /** 只丢弃"待处理的按下事件"，保留按住状态（冻结期间用）。 */
  clearPressed(): void {
    this.pressed.length = 0;
  }

  dispose(): void {
    for (let i = 0; i < this.disposers.length; i++) this.disposers[i]();
    this.disposers.length = 0;
    this.clear();
  }
}
