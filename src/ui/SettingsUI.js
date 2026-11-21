import { GameState } from '../core/GameState.js';

export class SettingsUI {
  constructor(scene, x, y) {
    this.scene = scene;
    this.volText = scene.add.text(x, y, '', {
      fontSize: '15px',
      color: '#dcd4e8',
      backgroundColor: '#221d2e',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.refresh();
    this.volText.on('pointerdown', () => {
      const nextVol = GameState.settings.masterVolume > 0 ? 0 : 0.6;
      GameState.updateSettings({ masterVolume: nextVol });
      this.refresh();
    });
  }

  refresh() {
    const pct = Math.round(GameState.settings.masterVolume * 100);
    this.volText.setText(`Audio Volume: ${pct}% (Click to Toggle)`);
  }
}