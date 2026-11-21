// src/core/GameState.js
import { EVENTS, EventBus } from './EventBus.js';

export const PLAYER_BASE_STATS = {
  maxHealth: 100,
  maxStamina: 100,
  attackDamage: 18,
  defense: 6,
  moveSpeed: 180
};

export function createInitialState(slotId = 1) {
  return {
    version: 3,
    slotId,
    savedAt: null,
    regionId: 'ashen_vale',
    player: {
      x: 160,
      y: 160,
      health: PLAYER_BASE_STATS.maxHealth,
      maxHealth: PLAYER_BASE_STATS.maxHealth,
      stamina: PLAYER_BASE_STATS.maxStamina,
      maxStamina: PLAYER_BASE_STATS.maxStamina,
      xp: 0,
      level: 1,
      equippedWeaponId: 'sword'
    },
    inventory: [
      { uid: 'init_hp_1', itemId: 'health_potion', quantity: 3, rarity: 'common', upgradeLevel: 0 },
      { uid: 'init_ore_1', itemId: 'ashen_ore', quantity: 2, rarity: 'common', upgradeLevel: 0 }
    ],
    equipment: {},
    gold: 120,
    inventoryCapacity: 24,
    activeBuffs: [],
    world: {
      defeatedEnemies: [],
      openedShrines: [],
      visitedRegions: ['ashen_vale']
    },
    worldProgress: {
      defeatedEnemies: [],
      openedShrines: [],
      visitedRegions: ['ashen_vale']
    },
    settings: {
      masterVolume: 0.75,
      screenShake: true,
      hitStop: true,
      graphicsQuality: 'medium',
      touchMode: 'auto',
      touchScale: 1.0,
      autoSaveOnPause: true,
      audio: { master: 0.75, music: 0.55, sfx: 0.85, ambient: 0.5, muted: false }
    }
  };
}

function hydrateState(raw, slotId = 1) {
  const base = createInitialState(slotId);
  if (!raw || typeof raw !== 'object') return base;

  const defeated =
    raw.world?.defeatedEnemies ||
    raw.worldProgress?.defeatedEnemies ||
    base.world.defeatedEnemies;
  const shrines =
    raw.world?.openedShrines ||
    raw.worldProgress?.openedShrines ||
    base.world.openedShrines;
  const regions =
    raw.world?.visitedRegions ||
    raw.worldProgress?.visitedRegions ||
    base.world.visitedRegions;

  const mergedWorld = {
    defeatedEnemies: Array.isArray(defeated) ? defeated : [],
    openedShrines: Array.isArray(shrines) ? shrines : [],
    visitedRegions: Array.isArray(regions) && regions.length > 0 ? regions : ['ashen_vale']
  };

  return {
    ...base,
    ...raw,
    slotId: raw.slotId ?? slotId,
    regionId: raw.regionId || base.regionId,
    player: {
      ...base.player,
      ...(raw.player && typeof raw.player === 'object' ? raw.player : {})
    },
    world: { ...mergedWorld },
    worldProgress: { ...mergedWorld },
    settings: {
      ...base.settings,
      ...(raw.settings && typeof raw.settings === 'object' ? raw.settings : {}),
      audio: {
        ...base.settings.audio,
        ...(raw.settings?.audio && typeof raw.settings.audio === 'object' ? raw.settings.audio : {})
      }
    }
  };
}

let currentState = createInitialState(1);

function emitStateChanged() {
  if (EventBus && typeof EventBus.emit === 'function') {
    const eventName = EVENTS?.STATE_CHANGED || 'state:changed';
    EventBus.emit(eventName, currentState);
  }
}

export const GameState = {
  isPaused: false,
  isInventoryOpen: false,

  get state() {
    currentState = hydrateState(currentState, currentState?.slotId || 1);
    return currentState;
  },

  set state(next) {
    currentState = hydrateState(next, next?.slotId || 1);
  },

  getState() {
    return this.state;
  },

  setState(nextState) {
    currentState = hydrateState(nextState, nextState?.slotId || 1);
    emitStateChanged();
    return currentState;
  },

  loadState(savedState) {
    return this.setState(savedState);
  },

  updateState(patchOrUpdater) {
    const base = this.state;
    if (typeof patchOrUpdater === 'function') {
      const updated = patchOrUpdater(base);
      if (updated && typeof updated === 'object') {
        currentState = hydrateState(updated, updated.slotId || base.slotId || 1);
      }
    } else if (patchOrUpdater && typeof patchOrUpdater === 'object') {
      currentState = hydrateState(
        {
          ...base,
          ...patchOrUpdater,
          player: patchOrUpdater.player ? { ...base.player, ...patchOrUpdater.player } : base.player,
          world: patchOrUpdater.world ? { ...base.world, ...patchOrUpdater.world } : base.world,
          worldProgress: patchOrUpdater.worldProgress
            ? { ...base.worldProgress, ...patchOrUpdater.worldProgress }
            : base.worldProgress,
          settings: patchOrUpdater.settings
            ? { ...base.settings, ...patchOrUpdater.settings }
            : base.settings
        },
        patchOrUpdater.slotId || base.slotId || 1
      );
    }
    emitStateChanged();
    return currentState;
  },

  reset(slotId = 1) {
    currentState = createInitialState(slotId);
    emitStateChanged();
    return currentState;
  }
};

export default GameState;