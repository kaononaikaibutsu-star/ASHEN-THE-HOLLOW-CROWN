// src/audio/AudioSystem.js
import { AUDIO_MANIFEST } from '../data/audioManifestData.js';

const MAX_ACTIVE_VOICES = 10;

export class AudioSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.ctx = null;
    this.buses = {};
    this.activeVoices = 0;
    this.lastPlayedAt = new Map();
    this.currentAmbienceKey = null;
    this.currentMusicKey = null;
    this.ambienceNode = null;
    this.musicTimer = null;
  }

  getAudioSettings() {
    const st = this.gameState.getState();
    st.settings = st.settings || {};
    st.settings.audio = {
      master: 0.75,
      music: 0.55,
      sfx: 0.85,
      ambient: 0.5,
      muted: false,
      ...(st.settings.audio || {})
    };
    return st.settings.audio;
  }

  unlock() {
    if (typeof window === 'undefined') return false;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.buses.master = this.ctx.createGain();
      this.buses.music = this.ctx.createGain();
      this.buses.sfx = this.ctx.createGain();
      this.buses.ambient = this.ctx.createGain();

      this.buses.music.connect(this.buses.master);
      this.buses.sfx.connect(this.buses.master);
      this.buses.ambient.connect(this.buses.master);
      this.buses.master.connect(this.ctx.destination);
      this.applySettings();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  applySettings() {
    const cfg = this.getAudioSettings();
    if (!this.ctx || !this.buses.master) return;
    const now = this.ctx.currentTime;
    this.buses.master.gain.setTargetAtTime(cfg.muted ? 0 : cfg.master, now, 0.03);
    this.buses.music.gain.setTargetAtTime(cfg.music, now, 0.04);
    this.buses.sfx.gain.setTargetAtTime(cfg.sfx, now, 0.02);
    this.buses.ambient.gain.setTargetAtTime(cfg.ambient, now, 0.05);
  }

  setVolume(channel, value) {
    const cfg = this.getAudioSettings();
    if (channel in cfg && typeof cfg[channel] === 'number') {
      cfg[channel] = Math.max(0, Math.min(1, Number(value)));
      this.applySettings();
    }
  }

  toggleMute() {
    const cfg = this.getAudioSettings();
    cfg.muted = !cfg.muted;
    this.applySettings();
    return cfg.muted;
  }

  playSfx(sfxKey, nowMs = Date.now()) {
    const spec = AUDIO_MANIFEST.sfx[sfxKey];
    if (!spec) return false;

    const last = this.lastPlayedAt.get(sfxKey) || 0;
    if (nowMs - last < (spec.cooldownMs || 60)) return false;
    if (this.activeVoices >= MAX_ACTIVE_VOICES) return false;

    this.lastPlayedAt.set(sfxKey, nowMs);
    if (!this.unlock() || !this.ctx || this.ctx.state !== 'running') return true; // Tracked logically even in headless tests

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = spec.wave || 'triangle';
    osc.frequency.setValueAtTime(spec.freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, spec.endFreq || spec.freq * 0.6), t0 + spec.dur);

    gain.gain.setValueAtTime(0.18, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + spec.dur);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    this.activeVoices += 1;
    osc.onended = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(t0);
    osc.stop(t0 + spec.dur + 0.01);
    return true;
  }

  setAmbience(ambienceKey) {
    if (this.currentAmbienceKey === ambienceKey) return;
    this.currentAmbienceKey = ambienceKey;
    if (this.ambienceNode) {
      try {
        this.ambienceNode.osc.stop();
        this.ambienceNode.osc.disconnect();
      } catch {}
      this.ambienceNode = null;
    }

    const spec = AUDIO_MANIFEST.ambience[ambienceKey];
    if (!spec || !this.unlock() || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = spec.baseFreq;
    filter.type = 'lowpass';
    filter.frequency.value = spec.filterFreq;
    gain.gain.value = 0.06;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.buses.ambient);
    osc.start();
    this.ambienceNode = { osc, filter, gain };
  }

  crossfadeMusic(musicKey) {
    if (this.currentMusicKey === musicKey) return;
    this.currentMusicKey = musicKey;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    const spec = AUDIO_MANIFEST.music[musicKey];
    if (!spec || typeof window === 'undefined') return;

    const intervals = [1, 1.189, 1.335, 1.498];
    let step = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(spec.rootFreq * intervals[step % intervals.length], t0);
      gain.gain.setValueAtTime(0.05, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
      osc.connect(gain);
      gain.connect(this.buses.music);
      osc.start(t0);
      osc.stop(t0 + 0.48);
      step += 1;
    }, spec.tempoMs);
  }

  destroy() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    if (this.ambienceNode) {
      try {
        this.ambienceNode.osc.stop();
      } catch {}
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}