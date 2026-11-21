// tests/release_milestone9.test.js
import assert from 'node:assert/strict';
import { createInitialState } from '../src/core/GameState.js';
import { AudioSystem } from '../src/audio/AudioSystem.js';
import { migrateSave, CURRENT_SAVE_VERSION } from '../src/systems/SaveSystem.js';
import { InputManager } from '../src/input/InputManager.js';

// 1. Audio throttling, volume persistence & mute toggle
const mockState = { _st: createInitialState(1), getState() { return this._st; } };
const audio = new AudioSystem(mockState);
assert.equal(audio.playSfx('slash_light', 1000), true);
assert.equal(audio.playSfx('slash_light', 1020), false); // Throttled within 70ms cooldown
assert.equal(audio.playSfx('slash_light', 1100), true);

audio.setVolume('music', 0.35);
assert.equal(mockState.getState().settings.audio.music, 0.35);
assert.equal(audio.toggleMute(), true);
assert.equal(mockState.getState().settings.audio.muted, true);

// 2. Save migration from v1 & corrupted payload recovery
const legacySave = { version: 1, slotId: 2, player: { health: 64, level: 4 } };
const migrated = migrateSave(legacySave, 2);
assert.equal(migrated.version, CURRENT_SAVE_VERSION);
assert.equal(migrated.player.health, 64);
assert.equal(migrated.settings.graphicsQuality, 'medium');
assert.ok(migrated.worldExploration);

const recovered = migrateSave(null, 3);
assert.equal(recovered.slotId, 3);
assert.equal(recovered.version, CURRENT_SAVE_VERSION);

// 3. Touch input axis normalization & action consumption
const fakeScene = {
  input: {
    keyboard: {
      createCursorKeys: () => ({ left: {}, right: {}, up: {}, down: {} }),
      addKeys: () => ({ left: {}, right: {}, up: {}, down: {}, block: {} }),
      on: () => {}
    },
    on: () => {}
  }
};
const inputMgr = new InputManager(fakeScene);
inputMgr.setTouchAxis(0.8, 0.6);
const vec = inputMgr.getMoveVector();
assert.ok(Math.abs(vec.x - 0.8) < 0.001);
inputMgr.triggerTouchAction('heavy');
assert.equal(inputMgr.consumeHeavyAttack(), true);
assert.equal(inputMgr.consumeHeavyAttack(), false);

console.log('Milestone 9 release tests passed.');