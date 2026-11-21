// src/systems/LootAndEconomySystem.js
import { RARITIES } from '../data/rarityData.js';
import { getItemDef } from '../data/itemDatabase.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export const MAX_UPGRADE_LEVEL = 5;

export const LOOT_TABLES = {
  hollow_thrall: {
    goldRange: [8, 20],
    guaranteed: [{ itemId: 'ashen_ore', minQty: 1, maxQty: 2 }],
    pool: [
      { itemId: 'health_potion', weight: 35 },
      { itemId: 'tarnished_coin', weight: 25 },
      { itemId: 'ashen_buckler', weight: 15 },
      { itemId: 'hollow_helm', weight: 10 },
      { itemId: 'none', weight: 15 }
    ]
  },
  cinder_hound: {
    goldRange: [14, 30],
    guaranteed: [{ itemId: 'ashen_ore', minQty: 1, maxQty: 2 }],
    pool: [
      { itemId: 'stamina_potion', weight: 35 },
      { itemId: 'wind_strider_boots', weight: 15 },
      { itemId: 'hollow_core', weight: 12 },
      { itemId: 'none', weight: 38 }
    ]
  },
  hollow_boss: {
    goldRange: [90, 160],
    guaranteed: [
      { itemId: 'hollow_core', minQty: 2, maxQty: 3 },
      { itemId: 'hollow_crown_fragment', minQty: 1, maxQty: 1 }
    ],
    pool: [
      { itemId: 'cursed_crown_blade', weight: 25 },
      { itemId: 'amulet_of_ash', weight: 25 },
      { itemId: 'ring_of_embers', weight: 30 },
      { itemId: 'ashen_cuirass', weight: 20 }
    ]
  },
  treasure_chest: {
    goldRange: [35, 75],
    guaranteed: [{ itemId: 'health_potion', minQty: 1, maxQty: 2 }],
    pool: [
      { itemId: 'ashen_ore', minQty: 2, maxQty: 4, weight: 35 },
      { itemId: 'cinder_gauntlets', weight: 20 },
      { itemId: 'ash_greaves', weight: 20 },
      { itemId: 'damage_tonic', weight: 15 },
      { itemId: 'defense_tonic', weight: 10 }
    ]
  }
};

export const MERCHANT_STOCK = [
  'health_potion',
  'stamina_potion',
  'damage_tonic',
  'defense_tonic',
  'antidote_vial',
  'ashen_ore',
  'ash_buckler',
  'ash_greaves'
];

export function rollRarity(rng = Math.random) {
  const entries = Object.values(RARITIES);
  const total = entries.reduce((sum, r) => sum + r.dropWeight, 0);
  let pick = rng() * total;
  for (const r of entries) {
    pick -= r.dropWeight;
    if (pick <= 0) return r.id;
  }
  return 'common';
}

export function generateLoot(tableKey, rng = Math.random) {
  const table = LOOT_TABLES[tableKey] || LOOT_TABLES.hollow_thrall;
  const [minG, maxG] = table.goldRange || [0, 0];
  const gold = minG + Math.floor(rng() * (maxG - minG + 1));
  const drops = [];

  for (const g of table.guaranteed || []) {
    const qty = (g.minQty || 1) + Math.floor(rng() * ((g.maxQty || 1) - (g.minQty || 1) + 1));
    drops.push({ itemId: g.itemId, quantity: qty, rarity: getItemDef(g.itemId)?.rarity || 'common' });
  }

  const totalW = (table.pool || []).reduce((s, p) => s + p.weight, 0);
  if (totalW > 0) {
    let roll = rng() * totalW;
    for (const p of table.pool) {
      roll -= p.weight;
      if (roll <= 0) {
        if (p.itemId !== 'none') {
          const def = getItemDef(p.itemId);
          const rolledRarity = def?.unique ? def.rarity : rollRarity(rng);
          const qty = p.minQty
            ? p.minQty + Math.floor(rng() * ((p.maxQty || p.minQty) - p.minQty + 1))
            : 1;
          drops.push({ itemId: p.itemId, quantity: qty, rarity: rolledRarity });
        }
        break;
      }
    }
  }

  return { gold, drops };
}

export class EconomyService {
  constructor(gameState, invSystem) {
    this.gameState = gameState;
    this.invSystem = invSystem;
  }

  getBuyPrice(itemId, rarityId = null) {
    const def = getItemDef(itemId);
    if (!def) return 0;
    const r = RARITIES[rarityId || def.rarity] || RARITIES.common;
    return Math.max(5, Math.round(def.baseValue * r.valueMult));
  }

  getSellPrice(entry) {
    const def = getItemDef(entry.itemId);
    if (!def || def.category === 'quest_item') return 0;
    const r = RARITIES[entry.rarity || def.rarity] || RARITIES.common;
    const upgMult = 1 + (entry.upgradeLevel || 0) * 0.25;
    return Math.max(1, Math.round(def.baseValue * 0.5 * r.valueMult * upgMult));
  }

  buyItem(itemId, qty = 1) {
    const st = this.invSystem.ensureShape();
    const count = Math.max(1, Math.floor(Number(qty)));
    const unitPrice = this.getBuyPrice(itemId);
    const totalCost = unitPrice * count;
    if (st.gold < totalCost) return { ok: false, reason: 'insufficient_gold' };

    const addRes = this.invSystem.addItem(itemId, count);
    if (!addRes.ok) return { ok: false, reason: addRes.reason };

    st.gold -= totalCost;
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, goldSpent: totalCost };
  }

  sellItemByUid(uid, qty = 1) {
    const st = this.invSystem.ensureShape();
    const entry = st.inventory.find((i) => i.uid === uid);
    if (!entry) return { ok: false, reason: 'not_found' };
    const def = getItemDef(entry.itemId);
    if (!def || def.category === 'quest_item') return { ok: false, reason: 'unsellable' };

    const sellQty = Math.min(entry.quantity, Math.max(1, Math.floor(Number(qty))));
    const payout = this.getSellPrice(entry) * sellQty;
    if (!this.invSystem.removeItemByUid(uid, sellQty)) return { ok: false, reason: 'remove_failed' };

    st.gold += payout;
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, goldEarned: payout };
  }

  getUpgradeRequirement(entry) {
    const def = getItemDef(entry?.itemId);
    if (!def || !def.slot) return null;
    const lvl = entry.upgradeLevel || 0;
    if (lvl >= MAX_UPGRADE_LEVEL) return { maxed: true };
    return {
      maxed: false,
      nextLevel: lvl + 1,
      goldCost: 50 * (lvl + 1),
      materialId: lvl >= 2 ? 'hollow_core' : 'ashen_ore',
      materialQty: lvl >= 2 ? lvl - 1 : lvl + 1
    };
  }

  upgradeEquipment(uid) {
    const st = this.invSystem.ensureShape();
    const entry = st.inventory.find((i) => i.uid === uid);
    if (!entry) return { ok: false, reason: 'not_found' };

    const req = this.getUpgradeRequirement(entry);
    if (!req || req.maxed) return { ok: false, reason: 'max_level' };
    if (st.gold < req.goldCost) return { ok: false, reason: 'insufficient_gold' };

    const matEntry = st.inventory.find((i) => i.itemId === req.materialId && i.quantity >= req.materialQty);
    if (!matEntry) return { ok: false, reason: 'missing_materials' };

    // Failure-safe transaction: verify both resources before mutating
    const removed = this.invSystem.removeItemByUid(matEntry.uid, req.materialQty);
    if (!removed) return { ok: false, reason: 'transaction_aborted' };

    st.gold -= req.goldCost;
    entry.upgradeLevel = req.nextLevel;
    this.invSystem.syncPlayerStats();
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, newLevel: req.nextLevel };
  }
}