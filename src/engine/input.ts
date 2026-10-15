/**
 * 引擎层 · 输入抽象。
 *
 * 模拟层只认这几个动作，不关心键盘 / 手柄 / 触摸屏。
 * 具体 DOM 绑定在 src/platform/keyboard.ts，测试里则用 ManualInput 直接注入。
 */

export type Action =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'jump'
  | 'attack'
  | 'spin'
  | 'dash'
  | 'heal'
  | 'pause'
  | 'confirm';

export interface InputSource {
  /** 当前是否按住。 */
  isDown(action: Action): boolean;
  /** 取出“本逻辑步新按下”的动作，写入 out 数组并返回数量。 */
  drainPressed(out: Action[]): number;
}

/** 便捷判断：某一逻辑步内是否新按下了某个动作。 */
export function wasActionPressed(list: readonly Action[], count: number, action: Action): boolean {
  for (let i = 0; i < count; i++) {
    if (list[i] === action) return true;
  }
  return false;
}

/** 测试与重放用的手动输入源。 */
export class ManualInput implements InputSource {
  private held = new Set<Action>();
  private pressed: Action[] = [];

  press(action: Action): void {
    if (!this.held.has(action)) {
      this.held.add(action);
      this.pressed.push(action);
    }
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

  clear(): void {
    this.held.clear();
    this.pressed.length = 0;
  }
}
