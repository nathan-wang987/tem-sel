/**
 * 平台层 · 极简 WebAudio 音效合成器。
 *
 * 不需要任何音频素材：所有音效都是现场合成的方波/噪声包络，
 * 和像素画风格一致；AudioContext 会在用户第一次交互后才创建。
 */

export type SoundId =
  | 'swing'
  | 'hit'
  | 'crit'
  | 'spin'
  | 'dash'
  | 'heal'
  | 'hurt'
  | 'kill'
  | 'jump'
  | 'telegraph'
  | 'levelUp'
  | 'waveStart'
  | 'waveClear'
  | 'death'
  | 'ui';

interface ToneSpec {
  type: OscillatorType;
  from: number;
  to: number;
  duration: number;
  gain: number;
}

const TONES: Record<SoundId, ToneSpec> = {
  swing: { type: 'square', from: 620, to: 280, duration: 0.09, gain: 0.05 },
  hit: { type: 'square', from: 320, to: 140, duration: 0.09, gain: 0.09 },
  crit: { type: 'square', from: 520, to: 180, duration: 0.16, gain: 0.12 },
  spin: { type: 'sawtooth', from: 240, to: 640, duration: 0.24, gain: 0.07 },
  dash: { type: 'triangle', from: 180, to: 780, duration: 0.2, gain: 0.08 },
  heal: { type: 'sine', from: 420, to: 880, duration: 0.36, gain: 0.1 },
  hurt: { type: 'sawtooth', from: 300, to: 90, duration: 0.22, gain: 0.12 },
  kill: { type: 'square', from: 200, to: 60, duration: 0.2, gain: 0.1 },
  jump: { type: 'square', from: 320, to: 620, duration: 0.09, gain: 0.045 },
  telegraph: { type: 'square', from: 700, to: 700, duration: 0.07, gain: 0.06 },
  levelUp: { type: 'square', from: 520, to: 1180, duration: 0.4, gain: 0.11 },
  waveStart: { type: 'square', from: 200, to: 420, duration: 0.34, gain: 0.1 },
  waveClear: { type: 'square', from: 700, to: 300, duration: 0.32, gain: 0.1 },
  death: { type: 'sawtooth', from: 300, to: 60, duration: 0.9, gain: 0.13 },
  ui: { type: 'square', from: 640, to: 640, duration: 0.05, gain: 0.05 },
};

export interface AudioBus {
  readonly available: boolean;
  play(id: SoundId): void;
  setMuted(muted: boolean): void;
  unlock(): void;
  dispose(): void;
}

class SynthAudio implements AudioBus {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  get available(): boolean {
    return typeof globalThis.AudioContext !== 'undefined' || typeof (globalThis as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';
  }

  unlock(): void {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    try {
      const Ctor = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.6;
      master.connect(ctx.destination);
      this.context = ctx;
      this.master = master;
    } catch {
      this.context = null;
      this.master = null;
    }
  }

  play(id: SoundId): void {
    const ctx = this.context;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const spec = TONES[id];
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.from, now);
      osc.frequency.linearRampToValueAtTime(Math.max(40, spec.to), now + spec.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, spec.gain), now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + spec.duration + 0.05);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      /* 音效失败不影响游戏 */
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) {
      this.master.gain.setValueAtTime(muted ? 0 : 0.6, this.context.currentTime);
    }
  }

  dispose(): void {
    try {
      void this.context?.close();
    } catch {
      /* ignore */
    }
    this.context = null;
    this.master = null;
  }
}

export function createAudioBus(): AudioBus {
  return new SynthAudio();
}
