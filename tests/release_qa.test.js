// tests/release_qa.test.js
import assert from 'node:assert/strict';
import { validateAssetRegistry } from '../src/data/releaseAssetRegistry.js';
import { CAMPAIGN_CHAPTERS, FOUR_CAMPAIGN_ENDINGS } from '../src/data/campaignReleaseData.js';
import { CampaignEndingsNgPlusSystem } from '../src/systems/CampaignEndingsNgPlusSystem.js';
import { migrateToReleaseSave, exportSaveJson, importSaveJson, RELEASE_SAVE_VERSION } from '../src/systems/SaveBackupAndCleanup.js';
import { createInitialState } from '../src/core/GameState.js';

// 1. Asset registry validation & fallback readiness
const assetCheck = validateAssetRegistry();
assert.equal(assetCheck.valid, true, assetCheck.issues.join('; '));

// 2. All 5 chapters & 4 endings present
assert.equal(CAMPAIGN_CHAPTERS.length, 5);
assert.equal(FOUR_CAMPAIGN_ENDINGS.length, 4);

// 3. Ending evaluation & New Game+ carryover
const stateHolder = {
  _st: {
    ...createInitialState(1),
    progression: { level: 12, xp: 40, corruption: 80, skillRanks: { berserker_rage: 2 } },
    narrative: {
      flags: { ch5_ascended_hollow_king: true },
      codex: { lore_hollow_crown: { unlocked: true, read: true } }
    },
    craftingEconomy: { unlockedRecipes: ['rcp_cinder_blade'] },
    equipment: { main_hand: { itemId: 'wpn_sword', upgradeLevel: 2 } }
  },
  getState() { return this._st; }
};
const mockInv = {
  _added: [],
  addItem(id, qty) { this._added.push({ id, qty }); return { ok: true }; },
  syncPlayerStats() {}
};
const ngSys = new CampaignEndingsNgPlusSystem(stateHolder, { invSystem: mockInv });
const endResult = ngSys.evaluateFourEndings();
assert.equal(endResult.ending.id, 'ending_eclipse_sovereign');

const ngRes = ngSys.startNewGamePlus();
assert.equal(ngRes.ok, true);
assert.equal(stateHolder.getState().campaign.ngPlusCycle, 1);
assert.equal(stateHolder.getState().progression.level, 12);
assert.equal(stateHolder.getState().narrative.codex.lore_hollow_crown.unlocked, true);

// 4. Save migration & JSON export/import round-trip
const v1Sample = { version: 1, slotId: 1, player: { health: 75 } };
const migrated = migrateToReleaseSave(v1Sample, 1);
assert.equal(migrated.version, RELEASE_SAVE_VERSION);
const exported = exportSaveJson(1);
const badImport = importSaveJson('{not valid json', 1);
assert.equal(badImport.ok, false);
const goodImport = importSaveJson(exported, 1);
assert.equal(goodImport.ok, true);

console.log('Release QA test suite passed.');