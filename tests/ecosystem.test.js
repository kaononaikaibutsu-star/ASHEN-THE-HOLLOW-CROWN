// tests/ecosystem.test.js
import assert from 'node:assert/strict';
import { FACTIONS, areFactionsAllied } from '../src/data/factionsData.js';
import { ENEMY_ECOSYSTEM_DEFS, BOSS_DEFINITIONS } from '../src/data/enemyEcosystemData.js';
import { getXpRequiredForLevel, PROGRESSION_CONFIG } from '../src/data/progressionData.js';
import { generateLoot } from '../src/systems/LootAndEconomySystem.js';

// 1. Faction relationship & resistance checks
assert.equal(areFactionsAllied('undead', 'hollow_creatures'), true);
assert.equal(areFactionsAllied('undead', 'ancient_guardians'), false);
assert.ok(FACTIONS.undead.statusResistances.bleed >= 0.9);

// 2. Ecosystem enemy definitions & boss phases
assert.ok(Object.keys(ENEMY_ECOSYSTEM_DEFS).length >= 4);
assert.equal(BOSS_DEFINITIONS.hollow_warden_boss.phases.length, 3);

// 3. XP curve & level cap checks
assert.equal(getXpRequiredForLevel(1, PROGRESSION_CONFIG), 0);
assert.ok(getXpRequiredForLevel(5, PROGRESSION_CONFIG) > getXpRequiredForLevel(2, PROGRESSION_CONFIG));

// 4. Boss loot generation check
const bossLoot = generateLoot('hollow_boss', () => 0.25);
assert.ok(bossLoot.gold >= 90);
assert.ok(bossLoot.drops.some((d) => d.itemId === 'hollow_crown_fragment'));

console.log('Milestone 5 ecosystem tests passed.');