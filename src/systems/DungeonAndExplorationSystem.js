// src/systems/DungeonAndExplorationSystem.js
import { generateLoot } from './LootAndEconomySystem.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export class DungeonAndExplorationSystem {
  constructor(gameState, { invSystem, progressionSystem, narrativeSystem } = {}) {
    this.gameState = gameState;
    this.invSystem = invSystem;
    this.progression = progressionSystem;
    this.narrative = narrativeSystem;
  }

  ensureWorldState() {
    const st = this.gameState.getState();
    st.worldExploration = st.worldExploration || {
      discoveredRegions: ['ashen_vale'],
      discoveredLocations: ['vale_hearth_sanctum'],
      openedChests: [],
      brokenProps: [],
      activatedSwitches: [],
      unlockedDoors: [],
      completedDungeons: [],
      checkpoint: { regionId: 'ashen_vale', x: 192, y: 192, label: 'Vale Wayshrine' },
      fogByRegion: {} // regionId -> Array<string> of "cx,cy" chunk keys
    };
    return st.worldExploration;
  }

  restAtCheckpoint(regionId, x, y, label = 'Wayshrine') {
    const we = this.ensureWorldState();
    const st = this.gameState.getState();
    we.checkpoint = { regionId, x, y, label };
    st.player.health = st.player.maxHealth;
    st.player.stamina = st.player.maxStamina;
    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, st.player);
    return we.checkpoint;
  }

  openChest(chestDef) {
    const we = this.ensureWorldState();
    if (!chestDef || we.openedChests.includes(chestDef.id)) {
      return { ok: false, reason: 'already_opened' };
    }
    we.openedChests.push(chestDef.id);
    const loot = generateLoot(chestDef.lootTableKey || 'treasure_chest');
    const st = this.gameState.getState();
    st.gold = (st.gold || 0) + loot.gold;
    for (const d of loot.drops) {
      this.invSystem?.addItem(d.itemId, d.quantity, { rarity: d.rarity });
    }
    if (chestDef.secret) {
      this.discoverLocation(chestDef.id, 'lore_catacomb_seal');
    }
    this.narrative?.recordObjectiveProgress('collect', 'ashen_ore', 0);
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, loot };
  }

  breakProp(propDef) {
    const we = this.ensureWorldState();
    if (!propDef || we.brokenProps.includes(propDef.id)) return false;
    we.brokenProps.push(propDef.id);
    if (propDef.dropItemId) {
      this.invSystem?.addItem(propDef.dropItemId, propDef.dropQty || 1);
    }
    return true;
  }

  activateSwitch(switchDef) {
    const we = this.ensureWorldState();
    if (!switchDef || we.activatedSwitches.includes(switchDef.id)) return false;
    we.activatedSwitches.push(switchDef.id);
    if (switchDef.unlocksDoorId && !we.unlockedDoors.includes(switchDef.unlocksDoorId)) {
      we.unlockedDoors.push(switchDef.unlocksDoorId);
    }
    return true;
  }

  discoverLocation(locationId, loreId = null) {
    const we = this.ensureWorldState();
    if (we.discoveredLocations.includes(locationId)) return false;
    we.discoveredLocations.push(locationId);
    this.progression?.awardXp(60, 'discovery');
    if (loreId) this.narrative?.unlockCodexEntry(loreId);
    this.narrative?.recordObjectiveProgress('discover', locationId, 1);
    return true;
  }

  completeDungeon(dungeonId, rewardGold = 75) {
    const we = this.ensureWorldState();
    if (we.completedDungeons.includes(dungeonId)) return false;
    we.completedDungeons.push(dungeonId);
    const st = this.gameState.getState();
    st.gold = (st.gold || 0) + rewardGold;
    this.progression?.awardXp(140, 'discovery');
    this.narrative?.setFlag(`dungeon_${dungeonId}_cleared`, true);
    return true;
  }

  getRegionCompletionPercent(region) {
    const we = this.ensureWorldState();
    const totalTargets =
      (region.subareas?.length || 0) + (region.chests?.length || 0) + (region.landmarks?.length || 0);
    if (totalTargets === 0) return 100;

    let done = 0;
    for (const s of region.subareas || []) {
      if (we.discoveredLocations.includes(s.id)) done++;
    }
    for (const c of region.chests || []) {
      if (we.openedChests.includes(c.id)) done++;
    }
    for (const l of region.landmarks || []) {
      if (we.discoveredLocations.includes(l.id)) done++;
    }
    return Math.min(100, Math.round((done / totalTargets) * 100));
  }
}