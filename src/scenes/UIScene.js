import { HudOverlay } from '../ui/HudOverlay.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { PauseMenuUI } from '../ui/PauseMenuUI.js';
import { TouchControlsUI } from '../ui/TouchControlsUI.js';
import { EventBus } from '../core/EventBus.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create(data) {
    this.hud = new HudOverlay(this);
    this.inventory = new InventoryUI(this);
    this.pauseMenu = new PauseMenuUI(this);
    if (data && data.inputManager) {
      new TouchControlsUI(this, data.inputManager);
    }

    this.unsubInv = EventBus.on('ui:toggleInventory', () => this.inventory.toggle());
    this.unsubPause = EventBus.on('ui:togglePause', () => this.pauseMenu.toggle());

    this.events.once('shutdown', () => {
      this.unsubInv();
      this.unsubPause();
      this.hud.destroy();
    });
  }
}