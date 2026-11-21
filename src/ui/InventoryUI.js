import { GameState } from '../core/GameState.js';
import { ITEMS } from '../data/items.js';
import { WEAPONS } from '../data/weapons.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';

export class InventoryUI {
  constructor(scene) {
    this.scene = scene;
    this.progression = new ProgressionSystem();
    this.container = scene.add.container(480, 270).setVisible(false).setDepth(20);

    const panel = scene.add.rectangle(0, 0, 520, 320, 0x14111a, 0.96).setStrokeStyle(2, 0x6d5d8c);
    const title = scene.add.text(0, -135, 'INVENTORY & ARSENAL', { fontSize: '18px', color: '#f3ede2' }).setOrigin(0.5);
    this.bodyText = scene.add.text(-230, -95, '', { fontSize: '14px', color: '#dcd4e8', lineSpacing: 8 });

    const healBtn = scene.add.text(-230, 105, '[Use Ashen Flask]', {
      fontSize: '14px',
      color: '#4ade80',
      backgroundColor: '#221d2e',
      padding: { x: 8, y: 4 }
    }).setInteractive({ useHandCursor: true });

    const weaponBtn = scene.add.text(-20, 105, '[Toggle Greatsword / Cinder Blade]', {
      fontSize: '14px',
      color: '#fbbf24',
      backgroundColor: '#221d2e',
      padding: { x: 8, y: 4 }
    }).setInteractive({ useHandCursor: true });

    healBtn.on('pointerdown', () => {
      this.progression.useItem('ashen_flask');
      this.refresh();
    });

    weaponBtn.on('pointerdown', () => {
      const curr = GameState.state.player.equippedWeapon;
      const next = curr === 'rusted_greatsword' ? 'cinder_blade' : 'rusted_greatsword';
      this.progression.equipWeapon(next);
      this.refresh();
    });

    this.container.add([panel, title, this.bodyText, healBtn, weaponBtn]);
  }

  toggle() {
    const next = !this.container.visible;
    this.container.setVisible(next);
    GameState.isInventoryOpen = next;
    if (next) this.refresh();
  }

  refresh() {
    const p = GameState.state.player;
    const w = WEAPONS[p.equippedWeapon] || WEAPONS.rusted_greatsword;
    const invLines = p.inventory.map((entry) => {
      const def = ITEMS[entry.itemId];
      return `• ${def ? def.name : entry.itemId} x${entry.quantity}`;
    });

    this.bodyText.setText([
      `HP: ${p.hp}/${p.maxHp}   Stamina: ${Math.floor(p.stamina)}/${p.maxStamina}`,
      `Equipped Weapon: ${w.name} (DMG +${w.damage})`,
      '',
      'Items:',
      ...invLines
    ].join('\n'));
  }
}