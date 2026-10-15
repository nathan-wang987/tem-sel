/**
 * 引擎层 · 固定步长时钟。
 *
 * - 逻辑永远以固定 dt 前进：物理/伤害判定结果与帧率无关。
 * - 暂停时不喂时间，累加器也不会被推进（“暂停时时间不前进”）。
 * - 单帧最大补偿步数受限，避免切回标签页后一次性狂跑几十步。
 */

export interface GameClockOptions {
  /** 逻辑步长（秒），默认 1/60。 */
  fixedStep?: number;
  /** 单帧最多补算多少步。 */
  maxStepsPerFrame?: number;
  /** 单帧最大真实时间（秒），超出部分直接丢弃。 */
  maxFrameDelta?: number;
}

export class GameClock {
  readonly fixedStep: number;
  readonly maxStepsPerFrame: number;
  readonly maxFrameDelta: number;

  /** 已模拟的游戏时间（秒）。暂停期间不增长。 */
  elapsed = 0;
  /** 最近一帧执行了多少逻辑步（调试/性能面板用）。 */
  lastSteps = 0;
  /** 累计丢弃的时间（秒），用于诊断掉帧。 */
  droppedTime = 0;

  private accumulator = 0;

  constructor(options: GameClockOptions = {}) {
    this.fixedStep = options.fixedStep ?? 1 / 60;
    this.maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
    this.maxFrameDelta = options.maxFrameDelta ?? 0.25;
  }

  /** 暂停/恢复时调用：清空累加器，保证恢复后不会“补播”暂停期间的时间。 */
  resetAccumulator(): void {
    this.accumulator = 0;
  }

  /**
   * 推进时钟。deltaSeconds 为真实帧间隔。
   * 返回本帧执行的逻辑步数。
   */
  advance(deltaSeconds: number, tick: (stepSeconds: number) => void): number {
    let delta = deltaSeconds;
    if (!Number.isFinite(delta) || delta <= 0) {
      this.lastSteps = 0;
      return 0;
    }
    if (delta > this.maxFrameDelta) {
      this.droppedTime += delta - this.maxFrameDelta;
      delta = this.maxFrameDelta;
    }
    this.accumulator += delta;
    let steps = 0;
    while (this.accumulator >= this.fixedStep && steps < this.maxStepsPerFrame) {
      this.accumulator -= this.fixedStep;
      this.elapsed += this.fixedStep;
      tick(this.fixedStep);
      steps++;
    }
    if (steps === this.maxStepsPerFrame && this.accumulator > this.fixedStep) {
      // 实在追不上就丢弃积压，宁可慢一点也不要雪崩。
      this.droppedTime += this.accumulator - this.fixedStep;
      this.accumulator = this.fixedStep;
    }
    this.lastSteps = steps;
    return steps;
  }

  reset(): void {
    this.accumulator = 0;
    this.elapsed = 0;
    this.lastSteps = 0;
    this.droppedTime = 0;
  }
}
