// src/ui/MainMenuUI.js
import { createInitialState, GameState } from '../core/GameState.js';
import { saveSystem } from '../systems/SaveSystem.js';

export class MainMenuUI {
  constructor(scene) {
    this.scene = scene;
    this.saveSystem = saveSystem;

    scene.add
      .text(480, 120, 'ASHEN: THE HOLLOW CROWN', {
        fontSize: '34px',
        color: '#f3ede2'
      })
      .setOrigin(0.5);

    scene.add
      .text(480, 160, 'Dark Fantasy Action RPG Foundation', {
        fontSize: '15px',
        color: '#9e95ad'
      })
      .setOrigin(0.5);

    this.makeButton(480, 240, 'NEW GAME (SLOT 1)', async () => {
      const fresh = createInitialState(1);
      GameState.setState(fresh);
      await this.saveSystem.saveSlot(1);
      scene.scene.start('WorldScene');
    });

    this.makeButton(480, 300, 'CONTINUE (SLOT 1)', async () => {
      const loaded = await this.saveSystem.loadSlot(1);
      GameState.setState(loaded || createInitialState(1));
      scene.scene.start('WorldScene');
    });
  }

  makeButton(x, y, label, onClick) {
    const bg = this.scene.add
      .rectangle(x, y, 280, 42, 0x262133)
      .setStrokeStyle(1, 0x6d5d8c)
      .setInteractive({ useHandCursor: true });
    const txt = this.scene.add
      .text(x, y, label, {
        fontSize: '15px',
        color: '#f3ede2'
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x3a324d));
    bg.on('pointerout', () => bg.setFillStyle(0x262133));
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }
}