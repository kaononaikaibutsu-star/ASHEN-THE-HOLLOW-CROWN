// src/main.js
import Phaser from 'phaser';
import { GAME_CONFIG } from './core/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_CONFIG.baseWidth,
  height: GAME_CONFIG.baseHeight,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0d0c10',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MainMenuScene, WorldScene, UIScene]
};

new Phaser.Game(config);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}