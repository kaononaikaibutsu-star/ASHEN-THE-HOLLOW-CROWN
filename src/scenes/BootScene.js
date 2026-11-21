// src/scenes/BootScene.js
import Phaser from 'phaser';
import { generateProceduralTextures } from '../assets/ProceduralTextures.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    generateProceduralTextures(this);
    this.scene.start('MainMenuScene');
  }
}