import { GameState } from '../core/GameState.js';
import { EventBus } from '../core/EventBus.js';

class SoundManager {
  constructor() {
    this.ctx = null;
    EventBus.on('settings:changed', (s) => {
      if (this.ctx && s.masterVolume <= 0 && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (this.ctx && s.masterVolume > 0 && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq = 220, duration = 0.08, type = 'square') {
    const vol = GameState.settings.masterVolume;
    if (vol <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playSwing() {
    this.playTone(170, 0.09, 'sawtooth');
  }

  playHit() {
    this.playTone(110, 0.11, 'square');
  }

  playDodge() {
    this.playTone(320, 0.07, 'triangle');
  }
}

export const SoundManager = new SoundManager();