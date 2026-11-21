// src/systems/SaveSystem.js
import { GameState, createInitialState } from '../core/GameState.js';
import { EventBus, EVENTS } from '../core/EventBus.js';

const STORAGE_PREFIX = 'ashen_hollow_crown_save_slot_';
const DB_NAME = 'AshenHollowCrownDB';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export class SaveSystem {
  constructor() {
    this.dbPromise = null;
  }

  getSlotKey(slotId = 1) {
    return `${STORAGE_PREFIX}${slotId}`;
  }

  openDB() {
    if (typeof indexedDB === 'undefined') {
      return Promise.resolve(null);
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  async writeIndexedDB(slotId, payload) {
    const db = await this.openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ slotId, payload });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async readIndexedDB(slotId) {
    const db = await this.openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(slotId);
        req.onsuccess = () => resolve(req.result?.payload ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async deleteIndexedDB(slotId) {
    const db = await this.openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(slotId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async saveSlot(slotId = 1, stateOverride = null) {
    const baseState = stateOverride || GameState.getState?.() || createInitialState(slotId);
    const snapshot = {
      ...baseState,
      slotId,
      savedAt: new Date().toISOString()
    };

    if (!stateOverride && typeof GameState.setState === 'function') {
      GameState.setState(snapshot);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.getSlotKey(slotId), JSON.stringify(snapshot));
      }
    } catch {
      // Ignore storage quota or restricted mode errors
    }

    await this.writeIndexedDB(slotId, snapshot);

    if (EventBus && typeof EventBus.emit === 'function') {
      EventBus.emit(EVENTS?.SAVE_COMPLETED || 'save:completed', { slotId, snapshot });
    }

    return snapshot;
  }

  async loadSlot(slotId = 1) {
    let parsed = await this.readIndexedDB(slotId);

    if (!parsed && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getSlotKey(slotId));
        if (raw) {
          parsed = JSON.parse(raw);
        }
      } catch {
        parsed = null;
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const hydrated = {
      ...createInitialState(slotId),
      ...parsed,
      slotId,
      player: {
        ...createInitialState(slotId).player,
        ...(parsed.player || {})
      },
      worldProgress: {
        ...createInitialState(slotId).worldProgress,
        ...(parsed.worldProgress || {})
      },
      settings: {
        ...createInitialState(slotId).settings,
        ...(parsed.settings || {})
      }
    };

    if (typeof GameState.setState === 'function') {
      GameState.setState(hydrated);
    }

    if (EventBus && typeof EventBus.emit === 'function') {
      EventBus.emit(EVENTS?.SAVE_LOADED || 'save:loaded', { slotId, state: hydrated });
    }

    return hydrated;
  }

  async deleteSlot(slotId = 1) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.getSlotKey(slotId));
      }
    } catch {
      // Ignore storage errors
    }
    await this.deleteIndexedDB(slotId);
    return true;
  }

  async hasSave(slotId = 1) {
    const data = await this.loadSlot(slotId);
    return Boolean(data);
  }
}

export const saveSystem = new SaveSystem();
export default saveSystem;