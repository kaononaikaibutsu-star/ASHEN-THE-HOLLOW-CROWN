// src/systems/CraftingGatheringEconomySystem.js
import {
  CRAFTING_DISCIPLINES,
  CRAFTING_STATIONS,
  GATHERING_NODE_DEFS,
  REGION_GATHERING_NODES,
  CRAFTING_RECIPES,
  MERCHANT_PROFILES
} from '../data/craftingEconomyData.js';
import { getItemDef } from '../data/itemDatabase.js';
import { RARITIES } from '../data/rarityData.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export class CraftingGatheringEconomySystem {
  constructor(gameState, { invSystem, progressionSystem, narrativeSystem, explorationSystem } = {}) {
    this.gameState = gameState;
    this.invSystem = invSystem;
    this.progression = progressionSystem;
    this.narrative = narrativeSystem;
    this.exploration = explorationSystem;
  }

  ensureShape() {
    const st = this.gameState.getState();
    st.craftingEconomy = st.craftingEconomy || {
      depletedNodes: {}, // nodeId -> respawnAtMs
      unlockedRecipes: Object.values(CRAFTING_RECIPES)
        .filter((r) => r.unlockedByDefault)
        .map((r) => r.id),
      disciplineRanks: {
        blacksmithing: 1,
        alchemy: 1,
        herbalism: 1,
        enchanting: 1,
        ancient_relic_crafting: 1
      },
      disciplineXp: {
        blacksmithing: 0,
        alchemy: 0,
        herbalism: 0,
        enchanting: 0,
        ancient_relic_crafting: 0
      },
      merchantState: {}, // merchantId -> { lastRestockAt, demandCountByItem: {}, remainingByItem: {} }
      repairedMechanisms: [],
      activatedDevices: []
    };
    return st.craftingEconomy;
  }

  isNodeAvailable(nodeId, now = Date.now()) {
    const ce = this.ensureShape();
    const respawnAt = ce.depletedNodes[nodeId] || 0;
    if (respawnAt > 0 && now >= respawnAt) {
      delete ce.depletedNodes[nodeId];
      return true;
    }
    return respawnAt <= now;
  }

  gatherNode(regionId, nodeId, now = Date.now(), rng = Math.random) {
    const ce = this.ensureShape();
    if (!this.isNodeAvailable(nodeId, now)) {
      return { ok: false, reason: 'node_depleted' };
    }

    const regionNodes = REGION_GATHERING_NODES[regionId] || [];
    const placement = regionNodes.find((n) => n.id === nodeId);
    const def = placement ? GATHERING_NODE_DEFS[placement.defId] : null;
    if (!def) return { ok: false, reason: 'unknown_node' };

    const st = this.gameState.getState();
    const hasRecTool = def.recommendedToolItemId
      ? (st.inventory || []).some((i) => i.itemId === def.recommendedToolItemId)
      : false;
    const toolBonus = hasRecTool ? 1 : 0;

    const granted = [];
    for (const y of def.baseYields || []) {
      const qty = y.minQty + Math.floor(rng() * ((y.maxQty || y.minQty) - y.minQty + 1)) + toolBonus;
      if (qty > 0 && this.invSystem) {
        const res = this.invSystem.addItem(y.itemId, qty);
        if (res.ok) granted.push({ itemId: y.itemId, quantity: qty });
      }
    }

    for (const r of def.rareYields || []) {
      if (rng() <= (r.chance || 0)) {
        const qty = r.minQty || 1;
        if (this.invSystem) {
          const res = this.invSystem.addItem(r.itemId, qty);
          if (res.ok) granted.push({ itemId: r.itemId, quantity: qty, rare: true });
        }
      }
    }

    ce.depletedNodes[nodeId] = now + (def.respawnMs || 25000);
    this.narrative?.recordObjectiveProgress('collect', 'ashen_ore', 0);
    this.progression?.awardXp(12, 'discovery');
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory || []);
    return { ok: true, granted, respawnAt: ce.depletedNodes[nodeId] };
  }

  unlockRecipe(recipeId) {
    const ce = this.ensureShape();
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) return false;
    if (!ce.unlockedRecipes.includes(recipeId)) {
      ce.unlockedRecipes.push(recipeId);
    }
    return true;
  }

  canCraftRecipe(recipeId, stationId = null) {
    const ce = this.ensureShape();
    const st = this.gameState.getState();
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) return { ok: false, reason: 'unknown_recipe' };
    if (!ce.unlockedRecipes.includes(recipeId)) return { ok: false, reason: 'recipe_locked' };

    const station = stationId ? CRAFTING_STATIONS[stationId] : CRAFTING_STATIONS[recipe.stationId];
    if (!station || station.id !== recipe.stationId) {
      return { ok: false, reason: 'wrong_station' };
    }

    if (station.minCorruption !== undefined && (st.progression?.corruption || 0) < station.minCorruption) {
      return { ok: false, reason: 'insufficient_corruption' };
    }

    const attrs = this.progression ? this.progression.getTotalAttributes() : (st.progression?.attributes || {});
    for (const [attr, minVal] of Object.entries(recipe.attrReq || {})) {
      if ((attrs[attr] || 0) < minVal) return { ok: false, reason: `requires_${attr}` };
    }

    for (const ing of recipe.ingredients || []) {
      const owned = (st.inventory || [])
        .filter((i) => i.itemId === ing.itemId)
        .reduce((sum, i) => sum + (i.quantity || 0), 0);
      if (owned < ing.quantity) return { ok: false, reason: `missing_${ing.itemId}` };
    }

    return { ok: true, recipe, station };
  }

  craftRecipe(recipeId, stationId = null) {
    const check = this.canCraftRecipe(recipeId, stationId);
    if (!check.ok) return check;

    const { recipe } = check;
    const ce = this.ensureShape();
    const st = this.gameState.getState();

    // Validate & snapshot before mutating so failure never duplicates or loses items unfairly
    for (const ing of recipe.ingredients || []) {
      const entry = (st.inventory || []).find((i) => i.itemId === ing.itemId && i.quantity >= ing.quantity);
      if (!entry) return { ok: false, reason: 'ingredient_check_failed' };
    }

    for (const ing of recipe.ingredients || []) {
      const entry = (st.inventory || []).find((i) => i.itemId === ing.itemId && i.quantity >= ing.quantity);
      this.invSystem.removeItemByUid(entry.uid, ing.quantity);
    }

    const disc = recipe.discipline;
    const rank = ce.disciplineRanks[disc] || 1;
    const discCfg = CRAFTING_DISCIPLINES[disc];
    const bonusChance = Math.max(0, (rank - 1) * (discCfg?.yieldBonusPerRank || 0.05));
    const bonusQty = Math.random() < bonusChance ? 1 : 0;
    const outQty = (recipe.output.quantity || 1) + bonusQty;

    const addRes = this.invSystem.addItem(recipe.output.itemId, outQty, {
      rarity: recipe.output.rarity || getItemDef(recipe.output.itemId)?.rarity || 'common'
    });
    if (!addRes.ok) return addRes;

    // Award specialization XP
    const xpGain = discCfg?.xpPerCraft || 20;
    ce.disciplineXp[disc] = (ce.disciplineXp[disc] || 0) + xpGain;
    while (ce.disciplineXp[disc] >= ce.disciplineRanks[disc] * 60) {
      ce.disciplineXp[disc] -= ce.disciplineRanks[disc] * 60;
      ce.disciplineRanks[disc] += 1;
    }

    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, craftedItemId: recipe.output.itemId, quantity: outQty };
  }

  ensureMerchantStock(merchantId, now = Date.now()) {
    const ce = this.ensureShape();
    const profile = MERCHANT_PROFILES[merchantId];
    if (!profile) return null;

    let mState = ce.merchantState[merchantId];
    if (!mState) {
      mState = {
        lastRestockAt: now,
        demandCountByItem: {},
        remainingByItem: {}
      };
      for (const s of profile.stock) {
        mState.remainingByItem[s.itemId] = s.baseQty;
      }
      ce.merchantState[merchantId] = mState;
    } else if (now - (mState.lastRestockAt || 0) >= (profile.restockIntervalMs || 60000)) {
      mState.lastRestockAt = now;
      for (const s of profile.stock) {
        mState.remainingByItem[s.itemId] = s.baseQty;
        mState.demandCountByItem[s.itemId] = Math.max(0, (mState.demandCountByItem[s.itemId] || 0) - 1);
      }
    }
    return mState;
  }

  getMerchantItemPrice(merchantId, itemId) {
    const profile = MERCHANT_PROFILES[merchantId];
    const def = getItemDef(itemId);
    if (!profile || !def) return 0;

    const ce = this.ensureShape();
    const mState = this.ensureMerchantStock(merchantId);
    const demand = mState?.demandCountByItem?.[itemId] || 0;
    const demandMult = 1 + Math.min(0.5, demand * 0.08);

    const n = this.narrative?.ensureShape();
    const rep = n?.reputation?.[profile.faction] || 0;
    const repDiscount = Math.max(0.75, Math.min(1.15, 1 - rep * 0.005));

    const rarityMult = RARITIES[def.rarity]?.valueMult || 1.0;
    return Math.max(5, Math.round(def.baseValue * rarityMult * profile.basePriceMult * demandMult * repDiscount));
  }

  buyFromMerchant(merchantId, itemId, qty = 1, now = Date.now()) {
    const profile = MERCHANT_PROFILES[merchantId];
    if (!profile) return { ok: false, reason: 'unknown_merchant' };
    if (profile.unlockFlag && !this.narrative?.getFlag(profile.unlockFlag)) {
      return { ok: false, reason: 'merchant_locked' };
    }

    const st = this.gameState.getState();
    const mState = this.ensureMerchantStock(merchantId, now);
    const count = Math.max(1, Math.floor(Number(qty)));
    const available = mState.remainingByItem[itemId] ?? 0;
    if (available < count) return { ok: false, reason: 'out_of_stock' };

    const unitPrice = this.getMerchantItemPrice(merchantId, itemId);
    const total = unitPrice * count;
    if ((st.gold || 0) < total) return { ok: false, reason: 'insufficient_gold' };

    const addRes = this.invSystem.addItem(itemId, count);
    if (!addRes.ok) return addRes;

    st.gold -= total;
    mState.remainingByItem[itemId] = available - count;
    mState.demandCountByItem[itemId] = (mState.demandCountByItem[itemId] || 0) + count;
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st.inventory);
    return { ok: true, goldSpent: total };
  }

  performWorldInteraction(actionType, targetId, { requiredItemId = null, unlockDoorId = null, corruptionGain = 0 } = {}) {
    const ce = this.ensureShape();
    const st = this.gameState.getState();

    if (requiredItemId) {
      const entry = (st.inventory || []).find((i) => i.itemId === requiredItemId && i.quantity >= 1);
      if (!entry) return { ok: false, reason: 'missing_required_item' };
      this.invSystem.removeItemByUid(entry.uid, 1);
    }

    if (actionType === 'repair_mechanism' && !ce.repairedMechanisms.includes(targetId)) {
      ce.repairedMechanisms.push(targetId);
      this.narrative?.setFlag(`repaired_${targetId}`, true);
    } else if (actionType === 'activate_device' && !ce.activatedDevices.includes(targetId)) {
      ce.activatedDevices.push(targetId);
      this.narrative?.setFlag(`activated_${targetId}`, true);
    }

    if (unlockDoorId && this.exploration) {
      const we = this.exploration.ensureWorldState();
      if (!we.unlockedDoors.includes(unlockDoorId)) {
        we.unlockedDoors.push(unlockDoorId);
      }
    }

    if (corruptionGain > 0 && this.progression) {
      this.progression.addCorruption(corruptionGain, actionType);
    }

    this.progression?.awardXp(35, 'discovery');
    return { ok: true, actionType, targetId };
  }
}