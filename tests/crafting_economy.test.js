// tests/crafting_economy.test.js
import assert from 'node:assert/strict';
import { createInitialState } from '../src/core/GameState.js';
import { CraftingGatheringEconomySystem } from '../src/systems/CraftingGatheringEconomySystem.js';

const mockGameState = {
  _state: { ...createInitialState(1), gold: 200, inventory: [] },
  getState() {
    return this._state;
  }
};

const mockInv = {
  addItem(itemId, quantity = 1, opts = {}) {
    const st = mockGameState.getState();
    const existing = st.inventory.find((i) => i.itemId === itemId && (i.rarity || 'common') === (opts.rarity || 'common'));
    if (existing) existing.quantity += quantity;
    else st.inventory.push({ uid: `${itemId}_${st.inventory.length + 1}`, itemId, quantity, rarity: opts.rarity || 'common' });
    return { ok: true };
  },
  removeItemByUid(uid, qty = 1) {
    const st = mockGameState.getState();
    const idx = st.inventory.findIndex((i) => i.uid === uid);
    if (idx === -1 || st.inventory[idx].quantity < qty) return false;
    st.inventory[idx].quantity -= qty;
    if (st.inventory[idx].quantity <= 0) st.inventory.splice(idx, 1);
    return true;
  }
};

const sys = new CraftingGatheringEconomySystem(mockGameState, { invSystem: mockInv });

// 1. Gather node & prevent immediate re-harvest before respawn
const g1 = sys.gatherNode('ashen_vale', 'gn_vale_mine_1', 1000, () => 0.1);
assert.equal(g1.ok, true);
assert.equal(sys.gatherNode('ashen_vale', 'gn_vale_mine_1', 1500, () => 0.1).ok, false);

// 2. Craft recipe using gathered ore + token
mockInv.addItem('tarnished_coin', 2);
const craftRes = sys.craftRecipe('rcp_cinder_blade', 'blacksmith_forge');
assert.equal(craftRes.ok, true);
assert.equal(craftRes.craftedItemId, 'wpn_greatsword');

// 3. Merchant purchase with limited stock & gold deduction
const buyRes = sys.buyFromMerchant('vale_quartermaster', 'hollow_helm', 1, 1000);
assert.equal(buyRes.ok, true);
assert.equal(sys.buyFromMerchant('vale_quartermaster', 'hollow_helm', 1, 1000).reason, 'out_of_stock');

console.log('Milestone 8 crafting, gathering & economy tests passed.');