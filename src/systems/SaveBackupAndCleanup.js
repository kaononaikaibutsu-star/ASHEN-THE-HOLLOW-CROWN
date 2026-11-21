// src/systems/SaveBackupAndCleanup.js
import { GameState, createInitialState } from '../core/GameState.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export const RELEASE_SAVE_VERSION = 3;

export function migrateToReleaseSave(raw, slotId = 1) {
  const base = createInitialState(slotId);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...base, version: RELEASE_SAVE_VERSION };
  }
  return {
    ...base,
    ...raw,
    slotId: raw.slotId || slotId,
    version: RELEASE_SAVE_VERSION,
    player: { ...base.player, ...(raw.player || {}) },
    inventory: Array.isArray(raw.inventory) ? raw.inventory : base.inventory,
    equipment: { ...(raw.equipment || {}) },
    progression: { ...(base.progression || {}), ...(raw.progression || {}) },
    narrative: { ...(base.narrative || {}), ...(raw.narrative || {}) },
    worldExploration: { ...(base.worldExploration || {}), ...(raw.worldExploration || {}) },
    craftingEconomy: { ...(base.craftingEconomy || {}), ...(raw.craftingEconomy || {}) },
    campaign: {
      currentChapter: 1,
      completedChapters: [],
      difficultyId: 'ashen',
      ngPlusCycle: 0,
      endingReached: null,
      ...(raw.campaign || {})
    },
    settings: { ...base.settings, ...(raw.settings || {}) }
  };
}

export function exportSaveJson(slotId = 1) {
  const migrated = migrateToReleaseSave(GameState.getState(), slotId);
  return JSON.stringify(migrated, null, 2);
}

export function importSaveJson(jsonString, targetSlotId = 1) {
  if (typeof jsonString !== 'string' || !jsonString.trim()) {
    return { ok: false, reason: 'empty_payload' };
  }
  let parsed = null;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: 'malformed_save_object' };
  }
  const restored = migrateToReleaseSave(parsed, targetSlotId);
  GameState.setState(restored);
  EventBus.emit(EVENTS.GAME_LOADED, restored);
  return { ok: true, state: restored };
}

export function cleanupSceneEntities({ enemies = [], hazards = [], timers = [], listeners = [] }) {
  for (const t of timers) {
    try { t?.remove?.(false); } catch {}
  }
  for (const h of hazards) {
    try { h?.zone?.destroy?.(); } catch {}
  }
  for (const e of enemies) {
    try {
      e?.clearTelegraph?.();
      e?.destroy?.();
    } catch {}
  }
  for (const { emitter, event, fn } of listeners) {
    try { emitter?.off?.(event, fn); } catch {}
  }
}