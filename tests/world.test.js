// tests/world.test.js
import assert from 'node:assert/strict';
import { WORLD_REGIONS, WORLD_REGION_LIST } from '../src/data/worldData.js';
import { buildRegionLayers } from '../src/world/maps/WorldMapBuilder.js';
import { createInitialState } from '../src/core/GameState.js';
import { DungeonAndExplorationSystem } from '../src/systems/DungeonAndExplorationSystem.js';
import { WorldEnvironmentAndMapSystem } from '../src/systems/WorldEnvironmentAndMapSystem.js';

// 1. All 5 required regions exist with exits & subareas
assert.equal(WORLD_REGION_LIST.length, 5);
for (const reg of WORLD_REGION_LIST) {
  assert.ok(reg.subareas.length >= 3, `${reg.id} missing subareas`);
  assert.ok(reg.exits.length >= 1, `${reg.id} missing exits`);
}

// 2. Map generation & locked door state
const deepMap = buildRegionLayers(WORLD_REGIONS.the_deep_below, []);
const door = WORLD_REGIONS.the_deep_below.doors[0];
assert.equal(deepMap.collision[door.tileY][door.tileX], 2);

const unlockedDeepMap = buildRegionLayers(WORLD_REGIONS.the_deep_below, [door.id]);
assert.equal(unlockedDeepMap.collision[door.tileY][door.tileX], 0);

// 3. Exploration, chest loot once-only, checkpoint & fog-of-war
const mockGameState = { _state: createInitialState(1), getState() { return this._state; } };
const mockInv = { _items: [], addItem(id, qty) { this._items.push({ id, qty }); return { ok: true }; } };
const expSys = new DungeonAndExplorationSystem(mockGameState, { invSystem: mockInv });
const envSys = new WorldEnvironmentAndMapSystem(mockGameState, expSys, null);

const chest = WORLD_REGIONS.ashen_vale.chests[0];
assert.equal(expSys.openChest(chest).ok, true);
assert.equal(expSys.openChest(chest).ok, false); // Prevent duplicate chest loot

const revealed = envSys.revealFogAround('ashen_vale', 6, 6, 3);
assert.ok(revealed > 20);
const snap = envSys.getMapSnapshot(WORLD_REGIONS.ashen_vale, 6, 6);
assert.equal(snap.regionId, 'ashen_vale');

console.log('Milestone 7 world & exploration tests passed.');