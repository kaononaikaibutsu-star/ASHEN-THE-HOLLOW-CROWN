// src/core/GameConfig.js
export const TILE_SIZE = 32;

export const GAME_CONFIG = {
  title: 'ASHEN: THE HOLLOW CROWN',
  version: '0.1.0',
  saveVersion: 3,
  baseWidth: 960,
  baseHeight: 540,
  tileSize: TILE_SIZE,
  autosaveIntervalMs: 30000,
  defaultSettings: {
    masterVolume: 0.6,
    showTouchControls: 'auto', // 'auto' | 'always' | 'off'
    screenShake: true
  }
};