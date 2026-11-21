// src/data/audioManifestData.js
export const AUDIO_MANIFEST = {
  sfx: {
    slash_light: { kind: 'synth', wave: 'sawtooth', freq: 240, endFreq: 95, dur: 0.09, cooldownMs: 70 },
    slash_heavy: { kind: 'synth', wave: 'sawtooth', freq: 165, endFreq: 55, dur: 0.18, cooldownMs: 120 },
    parry_clang: { kind: 'synth', wave: 'triangle', freq: 980, endFreq: 520, dur: 0.22, cooldownMs: 140 },
    block_thud: { kind: 'synth', wave: 'square', freq: 130, endFreq: 70, dur: 0.11, cooldownMs: 90 },
    dodge_whoosh: { kind: 'synth', wave: 'sine', freq: 310, endFreq: 140, dur: 0.13, cooldownMs: 120 },
    hit_impact: { kind: 'synth', wave: 'triangle', freq: 150, endFreq: 48, dur: 0.1, cooldownMs: 55 },
    crit_impact: { kind: 'synth', wave: 'sawtooth', freq: 440, endFreq: 110, dur: 0.17, cooldownMs: 80 },
    enemy_telegraph: { kind: 'synth', wave: 'sine', freq: 520, endFreq: 680, dur: 0.14, cooldownMs: 180 },
    footstep: { kind: 'synth', wave: 'triangle', freq: 95, endFreq: 60, dur: 0.045, cooldownMs: 240 },
    gather_hit: { kind: 'synth', wave: 'square', freq: 290, endFreq: 190, dur: 0.08, cooldownMs: 110 },
    craft_success: { kind: 'synth', wave: 'triangle', freq: 420, endFreq: 660, dur: 0.22, cooldownMs: 200 },
    ui_click: { kind: 'synth', wave: 'sine', freq: 620, endFreq: 480, dur: 0.05, cooldownMs: 50 },
    crown_pulse: { kind: 'synth', wave: 'sawtooth', freq: 82, endFreq: 44, dur: 0.45, cooldownMs: 600 },
    level_up_stinger: { kind: 'synth', wave: 'triangle', freq: 330, endFreq: 660, dur: 0.42, cooldownMs: 500 }
  },
  ambience: {
    amb_vale_wind: { baseFreq: 72, filterFreq: 210 },
    amb_thornwood_mist: { baseFreq: 96, filterFreq: 260 },
    amb_deep_echo: { baseFreq: 54, filterFreq: 150 },
    amb_veyr_ruins: { baseFreq: 68, filterFreq: 195 },
    amb_crown_void: { baseFreq: 46, filterFreq: 130 }
  },
  music: {
    bgm_ashen_vale: { rootFreq: 110, tempoMs: 900 },
    bgm_thornwood: { rootFreq: 98, tempoMs: 850 },
    bgm_deep_below: { rootFreq: 82.4, tempoMs: 950 },
    bgm_veyr_kingdom: { rootFreq: 123.5, tempoMs: 820 },
    bgm_crown_of_silence: { rootFreq: 73.4, tempoMs: 1050 },
    bgm_boss_tension: { rootFreq: 65.4, tempoMs: 420 }
  }
};