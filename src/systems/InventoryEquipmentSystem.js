// src/systems/InventoryEquipmentSystem.js
import { getItemDef } from '../data/itemDatabase.js';
import { EQUIPMENT_SLOTS, RARITIES } from '../data/rarityData.js';
import { computeAggregatedStats } from './StatCalculator.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export class InventoryEquipmentSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.consumableCooldowns = new Map();
  }

  ensureShape() {
    const st = this.gameState.getState();
    st.inventory = Array.isArray(st.inventory) ? st.inventory : [];
    st.inventoryCapacity = st.inventoryCapacity || 24;
    st.gold = Number.isFinite(st.gold) ? st.gold : 120;
    st.activeBuffs = Array.isArray(st.activeBuffs) ? st.activeBuffs : [];
    st.equipment = st.equipment || {};
    for (const slot of EQUIPMENT_SLOTS) {
      if (!(slot in st.equipment)) st.equipment[slot] = null;
    }
    return st;
  }

  ownsUnique(itemId) {
    const st = this.ensureShape();
    const inBag = st.inventory.some((i) => i.itemId === itemId);
    const inEquip = Object.values(st.equipment).some((e) => e && e.itemId === itemId);
    return inBag || inEquip;
  }

  addItem(itemId, quantity = 1, options = {}) {
    const st = this.ensureShape();
    const def = getItemDef(itemId);
    const qty = Math.floor(Number(quantity));
    if (!def || !Number.isFinite(qty) || qty <= 0) return { ok: false, reason: 'invalid_item' };

    if (def.unique && this.ownsUnique(itemId)) {
      return { ok: false, reason: 'unique_owned' };
    }

    const rarity = options.rarity || def.rarity || 'common';
    const upgradeLevel = Math.max(0, Math.floor(Number(options.upgradeLevel || 0)));
    let remaining = qty;

    if (def.stackLimit > 1) {
      for (const stack of st.inventory) {
        if (stack.itemId === itemId && stack.rarity === rarity && stack.quantity < def.stackLimit) {
          const space = def.stackLimit - stack.quantity;
          const add = Math.min(space, remaining);
          stack.quantity += add;
          remaining -= add;
          if (remaining <= 0) break;
        }
      }
    }

    while (remaining > 0) {
      if (st.inventory.length >= st.inventoryCapacity) {
        return { ok: false, reason: 'inventory_full', added: qty - remaining };
      }
      const stackQty = def.stackLimit > 1 ? Math.min(def.stackLimit, remaining) : 1;
      st.inventory.push({
        uid: `${itemId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        itemId,
        quantity: stackQty,
        rarity,
        upgradeLevel
      });
      remaining -= stackQty;
    }

    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, added: qty };
  }

  removeItemByUid(uid, quantity = 1) {
    const st = this.ensureShape();
    const qty = Math.floor(Number(quantity));
    const idx = st.inventory.findIndex((i) => i.uid === uid || i.itemId === uid);
    if (idx === -1 || qty <= 0) return false;

    const stack = st.inventory[idx];
    if (stack.quantity < qty) return false;

    stack.quantity -= qty;
    if (stack.quantity <= 0) {
      st.inventory.splice(idx, 1);
    }
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return true;
  }

  splitStack(uid, splitQty) {
    const st = this.ensureShape();
    const qty = Math.floor(Number(splitQty));
    if (st.inventory.length >= st.inventoryCapacity || qty <= 0) return false;
    const idx = st.inventory.findIndex((i) => i.uid === uid);
    if (idx === -1) return false;

    const stack = st.inventory[idx];
    if (stack.quantity <= qty) return false;

    stack.quantity -= qty;
    st.inventory.push({
      uid: `${stack.itemId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      itemId: stack.itemId,
      quantity: qty,
      rarity: stack.rarity,
      upgradeLevel: stack.upgradeLevel || 0
    });
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return true;
  }

  expandCapacity(extraSlots = 8) {
    const st = this.ensureShape();
    st.inventoryCapacity += Math.max(1, Math.floor(extraSlots));
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return st.inventoryCapacity;
  }

  getFilteredAndSortedItems({ category = 'all', sortBy = 'category' } = {}) {
    const st = this.ensureShape();
    const order = Object.keys(RARITIES);

    return st.inventory
      .filter((entry) => {
        const def = getItemDef(entry.itemId);
        if (!def) return false;
        return category === 'all' || def.category === category;
      })
      .sort((a, b) => {
        const defA = getItemDef(a.itemId);
        const defB = getItemDef(b.itemId);
        if (sortBy === 'rarity') {
          return order.indexOf(b.rarity || defB.rarity) - order.indexOf(a.rarity || defA.rarity);
        }
        if (sortBy === 'name') {
          return defA.name.localeCompare(defB.name);
        }
        return defA.category.localeCompare(defB.category) || defA.name.localeCompare(defB.name);
      });
  }

  canEquipInSlot(def, targetSlot) {
    if (!def || !def.slot) return false;
    if (Array.isArray(def.slot)) return def.slot.includes(targetSlot);
    return def.slot === targetSlot;
  }

  equipFromInventory(uid, preferredSlot = null) {
    const st = this.ensureShape();
    const idx = st.inventory.findIndex((i) => i.uid === uid);
    if (idx === -1) return false;

    const entry = st.inventory[idx];
    const def = getItemDef(entry.itemId);
    if (!def || !def.slot) return false;

    const slot =
      preferredSlot && this.canEquipInSlot(def, preferredSlot)
        ? preferredSlot
        : Array.isArray(def.slot)
          ? def.slot[0]
          : def.slot;

    const previousEquipped = st.equipment[slot];
    st.inventory.splice(idx, 1);

    st.equipment[slot] = {
      uid: entry.uid,
      itemId: entry.itemId,
      rarity: entry.rarity || def.rarity,
      upgradeLevel: entry.upgradeLevel || 0
    };

    if (previousEquipped) {
      st.inventory.push({
        uid: previousEquipped.uid || `${previousEquipped.itemId}_${Date.now()}`,
        itemId: previousEquipped.itemId,
        quantity: 1,
        rarity: previousEquipped.rarity || 'common',
        upgradeLevel: previousEquipped.upgradeLevel || 0
      });
    }

    if (slot === 'main_hand' && def.weaponDefId) {
      st.player.equippedWeaponId = def.weaponDefId;
    }

    this.syncPlayerStats();
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return true;
  }

  unequipSlot(slot) {
    const st = this.ensureShape();
    const eq = st.equipment[slot];
    if (!eq) return false;
    if (st.inventory.length >= st.inventoryCapacity) return false;

    st.equipment[slot] = null;
    st.inventory.push({
      uid: eq.uid || `${eq.itemId}_${Date.now()}`,
      itemId: eq.itemId,
      quantity: 1,
      rarity: eq.rarity || 'common',
      upgradeLevel: eq.upgradeLevel || 0
    });

    if (slot === 'main_hand') {
      st.player.equippedWeaponId = 'sword';
    }

    this.syncPlayerStats();
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return true;
  }

  compareItemToEquipped(itemEntry) {
    const st = this.ensureShape();
    const def = getItemDef(itemEntry.itemId);
    if (!def || !def.slot) return null;
    const slot = Array.isArray(def.slot) ? def.slot[0] : def.slot;
    const currentEq = st.equipment[slot];

    const currentStats = computeAggregatedStats(st);
    const simulated = JSON.parse(JSON.stringify(st));
    simulated.equipment[slot] = {
      itemId: itemEntry.itemId,
      rarity: itemEntry.rarity || def.rarity,
      upgradeLevel: itemEntry.upgradeLevel || 0
    };
    const nextStats = computeAggregatedStats(simulated);

    return {
      slot,
      currentEquipped: currentEq,
      deltas: {
        attackDamage: nextStats.attackDamage - currentStats.attackDamage,
        defense: nextStats.defense - currentStats.defense,
        maxHealth: nextStats.maxHealth - currentStats.maxHealth,
        maxStamina: nextStats.maxStamina - currentStats.maxStamina,
        magicPower: nextStats.magicPower - currentStats.magicPower
      }
    };
  }

  useConsumable(uid, now = Date.now()) {
    const st = this.ensureShape();
    const entry = st.inventory.find((i) => i.uid === uid || i.itemId === uid);
    if (!entry) return false;
    const def = getItemDef(entry.itemId);
    if (!def || def.category !== 'consumable' || !def.consumable) return false;

    const cdUntil = this.consumableCooldowns.get(def.id) || 0;
    if (now < cdUntil) return false;

    const c = def.consumable;
    if (!this.removeItemByUid(entry.uid, 1)) return false;
    this.consumableCooldowns.set(def.id, now + (c.cooldownMs || 1000));

    const stats = computeAggregatedStats(st, now);
    if (c.effect === 'heal') {
      st.player.health = Math.min(stats.maxHealth, st.player.health + (c.amount || 30));
    } else if (c.effect === 'stamina') {
      st.player.stamina = Math.min(stats.maxStamina, st.player.stamina + (c.amount || 40));
    } else if (c.effect === 'antidote') {
      st.player.health = Math.min(stats.maxHealth, st.player.health + (c.healAmount || 15));
      st.player.blighted = false;
    } else if (c.effect === 'damage_buff' || c.effect === 'defense_buff') {
      st.activeBuffs.push({
        effect: c.effect,
        mult: c.mult,
        magicBonus: c.magicBonus,
        defenseBonus: c.defenseBonus,
        resBonus: c.resBonus,
        expiresAt: now + (c.durationMs || 15000)
      });
    }

    this.syncPlayerStats(now);
    return true;
  }

  syncPlayerStats(now = Date.now()) {
    const st = this.ensureShape();
    st.activeBuffs = (st.activeBuffs || []).filter((b) => b.expiresAt > now);
    const derived = computeAggregatedStats(st, now);
    st.player.maxHealth = derived.maxHealth;
    st.player.maxStamina = derived.maxStamina;
    st.player.health = Math.min(st.player.health, derived.maxHealth);
    st.player.stamina = Math.min(st.player.stamina, derived.maxStamina);
    st.derivedStats = derived;
    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, st.player);
    return derived;
  }
}