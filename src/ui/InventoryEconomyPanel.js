// src/ui/InventoryEconomyPanel.js
// Presentation layer separated from inventory/economy logic: renders grid, category tabs,
// 10-slot equipment panel, live stats, item tooltip/comparison, merchant buy/sell, and blacksmith upgrade.
import { ITEM_CATEGORIES } from '../data/rarityData.js';
import { getItemDef } from '../data/itemDatabase.js';
import { MERCHANT_STOCK } from '../systems/LootAndEconomySystem.js';

export class InventoryEconomyPanel {
  constructor(scene, invSystem, economyService) {
    this.scene = scene;
    this.invSystem = invSystem;
    this.economyService = economyService;
    this.activeCategory = 'all';
    this.mode = 'inventory'; // 'inventory' | 'merchant' | 'blacksmith'
    this.selectedUid = null;
    this.container = scene.add.container(40, 44).setDepth(60).setVisible(false);
  }

  toggle(mode = 'inventory') {
    if (this.container.visible && this.mode === mode) {
      this.container.setVisible(false);
      return;
    }
    this.mode = mode;
    this.container.setVisible(true);
    this.render();
  }

  render() {
    this.container.removeAll(true);
    const st = this.invSystem.ensureShape();
    const stats = this.invSystem.syncPlayerStats();

    const bg = this.scene.add
      .rectangle(0, 0, 720, 392, 0x130f18, 0.97)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xf2b84b);
    this.container.add(bg);

    this.container.add(
      this.scene.add.text(14, 10, `ASHEN PACK [${this.mode.toUpperCase()}]  Gold: ${st.gold}  Slots: ${st.inventory.length}/${st.inventoryCapacity}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#f2b84b'
      })
    );

    // Mode tabs
    ['inventory', 'merchant', 'blacksmith'].forEach((m, i) => {
      const tab = this.scene.add
        .text(460 + i * 82, 10, `[${m.slice(0, 4).toUpperCase()}]`, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: this.mode === m ? '#7ce8ff' : '#c8cfd8'
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.mode = m;
          this.render();
        });
      this.container.add(tab);
    });

    // Category filter bar
    ITEM_CATEGORIES.slice(0, 7).forEach((cat, idx) => {
      const btn = this.scene.add
        .text(14 + idx * 96, 32, cat, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: this.activeCategory === cat ? '#f2b84b' : '#9aa38e'
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.activeCategory = cat;
          this.render();
        });
      this.container.add(btn);
    });

    // Left: Filtered items or Merchant stock
    const items = this.invSystem.getFilteredAndSortedItems({ category: this.activeCategory });
    items.slice(0, 10).forEach((entry, i) => {
      const def = getItemDef(entry.itemId);
      if (!def) return;
      const y = 56 + i * 24;
      const row = this.scene.add
        .text(14, y, `${def.name} x${entry.quantity} (+${entry.upgradeLevel || 0}) [${entry.rarity}]`, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: this.selectedUid === entry.uid ? '#7ce8ff' : '#e6d5b8'
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedUid = entry.uid;
          if (def.category === 'consumable' && this.mode === 'inventory') {
            this.invSystem.useConsumable(entry.uid);
          } else if (def.slot && this.mode === 'inventory') {
            this.invSystem.equipFromInventory(entry.uid);
          } else if (this.mode === 'merchant') {
            this.economyService.sellItemByUid(entry.uid, 1);
          } else if (this.mode === 'blacksmith') {
            this.economyService.upgradeEquipment(entry.uid);
          }
          this.render();
        });
      this.container.add(row);
    });

    if (this.mode === 'merchant') {
      MERCHANT_STOCK.slice(0, 8).forEach((id, i) => {
        const def = getItemDef(id);
        const price = this.economyService.getBuyPrice(id);
        const buyBtn = this.scene.add
          .text(360, 56 + i * 22, `Buy ${def.name} (${price}g)`, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#8be09c'
          })
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.economyService.buyItem(id, 1);
            this.render();
          });
        this.container.add(buyBtn);
      });
    }

    // Right: Character stats & comparison summary
    const selected = st.inventory.find((i) => i.uid === this.selectedUid);
    const cmp = selected ? this.invSystem.compareItemToEquipped(selected) : null;
    const cmpLine = cmp
      ? `Cmp ATK ${cmp.deltas.attackDamage >= 0 ? '+' : ''}${cmp.deltas.attackDamage} DEF ${cmp.deltas.defense >= 0 ? '+' : ''}${cmp.deltas.defense}`
      : 'Select item to compare';

    this.container.add(
      this.scene.add.text(360, 260, [
        `ATK: ${stats.attackDamage}  DEF: ${stats.defense}  MAG: ${stats.magicPower}`,
        `HP: ${stats.maxHealth}  STAM: ${stats.maxStamina}  SPD: ${stats.moveSpeed}`,
        `CRIT: ${Math.round(stats.critChance * 100)}% (x${stats.critDamage})  RES: ${Math.round(stats.elementalResistance * 100)}%`,
        cmpLine
      ].join('\n'), {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#e6d5b8'
      })
    );
  }
}