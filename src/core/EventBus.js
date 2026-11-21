// src/core/EventBus.js
export const EVENTS = {
  PLAYER_STATS_CHANGED: 'player:stats_changed',
  INVENTORY_CHANGED: 'inventory:changed',
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded'
};

class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      handler(payload);
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const EventBus = new EventEmitter();
export default EventBus;