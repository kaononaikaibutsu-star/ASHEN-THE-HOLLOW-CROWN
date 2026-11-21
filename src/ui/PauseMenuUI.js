import { SaveSystem } from '../systems/SaveSystem.js';
import { GameState } from '../core/GameState.js';
import { SettingsUI } from './SettingsUI.js';
import { EventBus } from '../core/EventBus.js';

export class PauseMenuUI {
  constructor(scene) {
    this.scene = scene;
    this.saveSystem = new SaveSystem();
    this.container = scene.add.container(480, 270).setVisible(false).setDepth(25);

    const panel = scene.add.rectangle(0, 0, 380, 260, 0x14111a, 0.96).setStrokeStyle(2, 0x6d5d8c);
    const title = scene.add.text(0, -90, 'PAUSED', { fontSize: '22px', color: '#f3ede2' }).setOrigin(0.5);

    const saveBtn = scene.add.text(0, -35, '[SAVE GAME]', {
      fontSize: '16px',
      color: '#4ade80',
      backgroundColor: '#221d2e',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    saveBtn.on('pointerdown', async () => {
      const ok = await this.saveSystem.saveSlot(GameState.state.slotId);
      EventBus.emit('ui:toast', ok ? 'Progress saved.' : 'Save failed.');
    });

    const settings = new SettingsUI(scene, 0, 25);

    const quitBtn = scene.add.text(0, 80, '[MAIN MENU]', {
      fontSize: '15px',
      color: '#f87171',
      backgroundColor: '#221d2e',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerdown', () => {
      GameState.isPaused = false;
      scene.scene.stop('UIScene');
      scene.scene.start('MainMenuScene');
    });

    this.container.add([panel, title, saveBtn, settings.volText, quitBtn]);
  }

  toggle() {
    const next = !this.container.visible;
    this.container.setVisible(next);
    GameState.isPaused = next;
  }
}