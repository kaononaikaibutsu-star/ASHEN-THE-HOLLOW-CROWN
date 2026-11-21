// src/scenes/MainMenuScene.js
import Phaser from 'phaser';
import { MainMenuUI } from '../ui/MainMenuUI.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0c10');
    new MainMenuUI(this);
  }
}