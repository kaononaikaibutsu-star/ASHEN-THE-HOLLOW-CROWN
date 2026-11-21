// tests/narrative.test.js
import assert from 'node:assert/strict';
import { createInitialState } from '../src/core/GameState.js';
import { NarrativeStorySystem } from '../src/systems/NarrativeStorySystem.js';

const mockGameState = {
  _state: createInitialState(1),
  getState() {
    return this._state;
  }
};

const mockProgression = {
  _xp: 0,
  _corr: 0,
  ensureProgressionShape() {
    mockGameState._state.progression = mockGameState._state.progression || {
      corruption: this._corr,
      attributes: { arcane: 12 }
    };
    mockGameState._state.progression.corruption = this._corr;
    return mockGameState._state.progression;
  },
  getTotalAttributes() {
    return { arcane: 12 };
  },
  awardXp(amt) {
    this._xp += amt;
  },
  addCorruption(amt) {
    this._corr += amt;
  },
  equipAbility() {}
};

const story = new NarrativeStorySystem(mockGameState, { progressionSystem: mockProgression });

// 1. Branching dialogue & conditions
const view = story.startDialogue('marcus_intro');
assert.equal(view.nodeId, 'root');
assert.ok(view.choices.some((c) => c.id === 'ask_hidden_clue')); // Arcane 10+ unlocked

const nextView = story.selectDialogueChoice('accept_main');
assert.equal(nextView.nodeId, 'duty_accepted');
assert.equal(story.getFlag('chose_courtyard_oath'), true);
assert.equal(mockGameState._state.narrative.quests.q_main_hollow_crown.status, 'active');

// 2. Quest objective completion & duplicate reward prevention
story.recordObjectiveProgress('defeat', 'skeleton_skirmisher', 2);
story.recordObjectiveProgress('discover', 'hollow_catacombs', 1);
assert.equal(mockGameState._state.narrative.quests.q_main_hollow_crown.status, 'completed');
const xpAfterFirst = mockProgression._xp;
story.completeQuest('q_main_hollow_crown');
assert.equal(mockProgression._xp, xpAfterFirst); // No duplicate reward

// 3. Corruption-gated quest & ending evaluation
mockProgression._corr = 80;
story.setFlag('hidden_crest_recovered', true);
const ending = story.evaluateEnding();
assert.equal(ending.id, 'ending_hollow_ascendant');

console.log('Milestone 6 narrative tests passed.');