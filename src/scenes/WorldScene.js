// src/scenes/WorldScene.js
import Phaser from 'phaser';
import { GAME_CONFIG, TILE_SIZE } from '../core/GameConfig.js';
import { GameState } from '../core/GameState.js';
import { EventBus } from '../core/EventBus.js';
import { RegionManager } from '../world/regions/RegionManager.js';
import { buildRegionMap } from '../world/maps/TestMapBuilder.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { Player } from '../entities/player/Player.js';
import { Enemy } from '../entities/enemies/Enemy.js';
import { WayfarerShrine } from '../entities/npcs/WayfarerShrine.js';
import { InputManager } from '../input/InputManager.js';
import { ENEMIES } from '../data/enemies.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.regionManager = new RegionManager();
    this.saveSystem = new SaveSystem();
    this.progression = new ProgressionSystem();
    this.enemies = [];
    this.portalTriggered = false;
  }

  create() {
    const state = GameState.state;
    this.combatSystem = new CombatSystem(this);
    this.inputManager = new InputManager(this);

    const startRegionId = state.regionId || 'ashen_vale';
    const spawnX = state.player?.x ?? 160;
    const spawnY = state.player?.y ?? 160;

    this.loadRegion(startRegionId, spawnX, spawnY);

    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { inputManager: this.inputManager });
    }

    const onRespawn = () => {
      const currentRegionId = GameState.state.regionId || 'ashen_vale';
      const spawn = this.regionManager.getSpawnWorldPosition(currentRegionId);
      if (this.player?.sprite && spawn) {
        this.player.sprite.setPosition(spawn.x, spawn.y);
      }
      EventBus.emit('ui:toast', 'You have fallen — returned to the Verge.');
    };

    if (typeof EventBus.on === 'function') {
      EventBus.on('player:respawn', onRespawn);
    }

    const autosaveDelay = GAME_CONFIG?.autosaveIntervalMs || 30000;
    this.autosaveTimer = this.time.addEvent({
      delay: autosaveDelay,
      loop: true,
      callback: () => this.saveSystem.saveSlot(GameState.state.slotId || 1)
    });

    this.events.once('shutdown', () => {
      if (typeof EventBus.off === 'function') {
        EventBus.off('player:respawn', onRespawn);
      }
      if (this.autosaveTimer) {
        this.autosaveTimer.remove();
        this.autosaveTimer = null;
      }
    });
  }

  loadRegion(regionId, spawnX, spawnY) {
    this.children.removeAll(true);
    this.enemies = [];
    this.portalTriggered = false;

    const region = this.regionManager.getRegion(regionId);
    const mapData = buildRegionMap(this, region);

    this.physics.world.setBounds(0, 0, mapData.widthPx, mapData.heightPx);
    this.cameras.main.setBounds(0, 0, mapData.widthPx, mapData.heightPx);

    this.player = new Player(this, spawnX, spawnY, this.combatSystem);
    this.combatSystem?.setPlayer?.(this.player);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.physics.add.collider(this.player.sprite, mapData.wallGroup);

    // Shrine
    const shrineX = 6 * TILE_SIZE;
    const shrineY = 12 * TILE_SIZE;
    this.shrine = new WayfarerShrine(this, `${region.id}_shrine_01`, shrineX, shrineY, this.saveSystem);
    this.physics.add.collider(this.player.sprite, this.shrine.sprite);

    // Spawn enemies unless already defeated
    const spawns = [
      { id: `${region.id}_e1`, type: 'hollow_thrall', tx: 14, ty: 10 },
      { id: `${region.id}_e2`, type: 'hollow_thrall', tx: 20, ty: 16 },
      { id: `${region.id}_e3`, type: 'dread_knight', tx: 26, ty: 14 }
    ];

    const defeatedList = GameState.state.world?.defeatedEnemies || [];

    for (const sp of spawns) {
      if (defeatedList.includes(sp.id)) continue;
      const cfg = ENEMIES[sp.type] || ENEMIES.hollow_thrall;
      const enemy = new Enemy(this, sp.id, cfg, sp.tx * TILE_SIZE, sp.ty * TILE_SIZE, this.combatSystem);
      this.physics.add.collider(enemy.sprite, mapData.wallGroup);
      this.physics.add.collider(enemy.sprite, this.player.sprite);
      this.enemies.push(enemy);
    }

    this.combatSystem?.setEnemies?.(this.enemies);

    if (mapData.portalZone) {
      this.physics.add.overlap(this.player.sprite, mapData.portalZone, () => {
        if (this.portalTriggered) return;
        this.portalTriggered = true;
        const next = this.regionManager.transitionToNextRegion(region.id);
        this.loadRegion(next.id, GameState.state.player.x, GameState.state.player.y);
        EventBus.emit('ui:toast', `Entered ${next.name}`);
      });
    }
  }

  update(time, delta) {
    if (this.inputManager?.justPressedPause?.()) {
      EventBus.emit('ui:togglePause');
      return;
    }
    if (this.inputManager?.justPressedInventory?.()) {
      EventBus.emit('ui:toggleInventory');
      return;
    }
    if (GameState.isPaused || GameState.isInventoryOpen) {
      this.player?.sprite?.setVelocity?.(0, 0);
      return;
    }

    const dtSec = delta / 1000;
    this.player?.update?.(dtSec, this.inputManager);
    this.combatSystem?.update?.(time, delta);

    if (this.inputManager?.consumeDodge?.()) {
      this.player?.tryDodge?.();
    }
    if (this.inputManager?.consumeAttack?.()) {
      this.player?.tryAttack?.(this.enemies);
    }
    if (this.inputManager?.justPressedInteract?.()) {
      this.shrine?.interact?.(this.player);
    }
    if (this.inputManager?.justPressedHeal?.()) {
      this.progression?.useItem?.('ashen_flask');
    }

    for (const enemy of this.enemies) {
      enemy?.update?.(this.player);
    }
  }
}

export default WorldScene;