// src/ui/HudOverlay.js
import { GameState } from '../core/GameState.js';
import { EventBus, EVENTS } from '../core/EventBus.js';

export class HudOverlay {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.hpBar = null;
    this.hpText = null;
    this.staminaBar = null;
    this.staminaText = null;
    this.metaText = null;

    this._onStateChanged = () => this.refresh();
    this._onCombatAttack = () => this.refresh();

    this.create();
    this.refresh();
    this.bindEvents();
  }

  create() {
    if (!this.scene?.add) return;

    const padX = 16;
    const padY = 14;
    const barW = 160;
    const barH = 12;

    this.container = this.scene.add.container(0, 0);
    if (typeof this.container.setScrollFactor === 'function') {
      this.container.setScrollFactor(0);
    }

    // Panel backdrop
    const panel = this.scene.add
      .rectangle(padX + 94, padY + 34, 204, 78, 0x14121a, 0.85)
      .setStrokeStyle(1, 0x56496e, 0.9);

    // Health bar
    const hpBg = this.scene.add.rectangle(padX + 12, padY + 14, barW, barH, 0x2a161b).setOrigin(0, 0.5);
    this.hpBar = this.scene.add.rectangle(padX + 12, padY + 14, barW, barH, 0xc93b4b).setOrigin(0, 0.5);
    this.hpText = this.scene.add.text(padX + barW + 18, padY + 14, '100/100', {
      fontSize: '11px',
      color: '#f3ede2'
    }).setOrigin(0, 0.5);

    // Stamina bar
    const stamBg = this.scene.add.rectangle(padX + 12, padY + 34, barW, barH, 0x162622).setOrigin(0, 0.5);
    this.staminaBar = this.scene.add.rectangle(padX + 12, padY + 34, barW, barH, 0x38a169).setOrigin(0, 0.5);
    this.staminaText = this.scene.add.text(padX + barW + 18, padY + 34, '100/100', {
      fontSize: '11px',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    // Region / Gold / Weapon line
    this.metaText = this.scene.add.text(padX + 12, padY + 54, '', {
      fontSize: '11px',
      color: '#b8afc7'
    }).setOrigin(0, 0.5);

    this.container.add([
      panel,
      hpBg,
      this.hpBar,
      this.hpText,
      stamBg,
      this.staminaBar,
      this.staminaText,
      this.metaText
    ]);
  }

  refresh() {
    const state = GameState.getState?.() || {};
    const player = state.player || {};
    const barW = 160;

    const hp = Math.max(0, Number(player.health ?? player.hp ?? 100));
    const maxHp = Math.max(1, Number(player.maxHealth ?? player.maxHp ?? 100));
    const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

    const stamina = Math.max(0, Number(player.stamina ?? 100));
    const maxStamina = Math.max(1, Number(player.maxStamina ?? 100));
    const stamRatio = Math.max(0, Math.min(1, stamina / maxStamina));

    if (this.hpBar) {
      this.hpBar.width = Math.round(barW * hpRatio);
    }
    if (this.hpText) {
      this.hpText.setText(`${Math.round(hp)}/${Math.round(maxHp)}`);
    }
    if (this.staminaBar) {
      this.staminaBar.width = Math.round(barW * stamRatio);
    }
    if (this.staminaText) {
      this.staminaText.setText(`${Math.round(stamina)}/${Math.round(maxStamina)}`);
    }
    if (this.metaText) {
      const gold = Number(state.gold ?? 0);
      const weapon = player.equippedWeaponId || 'sword';
      this.metaText.setText(`GOLD ${gold}  •  ${String(weapon).toUpperCase()}`);
    }
  }

  bindEvents() {
    if (!EventBus || typeof EventBus.on !== 'function') return;
    EventBus.on(EVENTS?.STATE_CHANGED || 'state:changed', this._onStateChanged);
    EventBus.on(EVENTS?.COMBAT_ATTACK || 'combat:attack', this._onCombatAttack);
  }

  update() {
    this.refresh();
  }

  destroy() {
    if (EventBus && typeof EventBus.off === 'function') {
      EventBus.off(EVENTS?.STATE_CHANGED || 'state:changed', this._onStateChanged);
      EventBus.off(EVENTS?.COMBAT_ATTACK || 'combat:attack', this._onCombatAttack);
    }
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
    this.scene = null;
  }
}

export default HudOverlay;