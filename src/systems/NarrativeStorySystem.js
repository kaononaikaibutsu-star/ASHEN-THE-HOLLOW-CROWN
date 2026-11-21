// src/systems/NarrativeStorySystem.js
import {
  NPC_DEFINITIONS,
  DIALOGUE_TREES,
  QUEST_DEFINITIONS,
  CODEX_ENTRIES,
  ENDING_CONDITIONS
} from '../data/narrativeData.js';
import { EventBus } from '../core/EventBus.js';

export const NARRATIVE_EVENTS = {
  DIALOGUE_OPENED: 'narrative:dialogue_opened',
  DIALOGUE_CLOSED: 'narrative:dialogue_closed',
  QUEST_UPDATED: 'narrative:quest_updated',
  QUEST_COMPLETED: 'narrative:quest_completed',
  CODEX_UNLOCKED: 'narrative:codex_unlocked',
  STORY_EVENT_FIRED: 'narrative:story_event_fired'
};

export class NarrativeStorySystem {
  constructor(gameState, { progressionSystem, invSystem } = {}) {
    this.gameState = gameState;
    this.progression = progressionSystem;
    this.invSystem = invSystem;
  }

  ensureShape() {
    const st = this.gameState.getState();
    st.narrative = st.narrative || {
      flags: {},
      reputation: { human_factions: 10, ancient_guardians: 5, undead: -20, hollow_creatures: -20 },
      npcState: {
        warden_marcus: { relationship: 15, alive: true, present: true, lastNodeId: null },
        tinker_cora: { relationship: 10, alive: true, present: true, lastNodeId: null }
      },
      activeDialogue: null,
      dialogueHistory: [],
      quests: {},
      codex: {}
    };

    for (const entry of CODEX_ENTRIES) {
      if (!st.narrative.codex[entry.id]) {
        st.narrative.codex[entry.id] = { unlocked: Boolean(entry.unlockedByDefault), read: false };
      }
    }
    return st.narrative;
  }

  setFlag(key, value = true) {
    const n = this.ensureShape();
    n.flags[key] = value;
  }

  getFlag(key) {
    return Boolean(this.ensureShape().flags[key]);
  }

  setNpcSurvival(npcId, { alive = true, present = true } = {}) {
    const n = this.ensureShape();
    n.npcState[npcId] = n.npcState[npcId] || { relationship: 0, alive: true, present: true };
    n.npcState[npcId].alive = alive;
    n.npcState[npcId].present = present;
  }

  getScheduledNpcPlacement(npcId, hourOfDay = 8) {
    const def = NPC_DEFINITIONS[npcId];
    const st = this.ensureShape().npcState[npcId];
    if (!def || !st || !st.alive || !st.present) return null;

    const slot = (def.schedule || []).find((s) => hourOfDay >= s.startHour && hourOfDay < s.endHour);
    return slot || {
      regionId: def.homeRegion,
      x: 160,
      y: 160,
      idleMode: 'idle'
    };
  }

  getNpcGreeting(npcId) {
    const def = NPC_DEFINITIONS[npcId];
    const prog = this.progression?.ensureProgressionShape();
    const corr = prog?.corruption || 0;
    if (!def) return '...';
    if (corr >= 60) return def.corruptionReactions.high;
    if (corr >= 25) return def.corruptionReactions.mid;
    return def.corruptionReactions.low;
  }

  isChoiceAvailable(choice) {
    const n = this.ensureShape();
    const st = this.gameState.getState();
    const cond = choice?.conditions;
    if (!cond) return true;

    if (cond.minCorruption !== undefined && (st.progression?.corruption || 0) < cond.minCorruption) {
      return false;
    }
    if (cond.requiredFlags) {
      for (const [fKey, fVal] of Object.entries(cond.requiredFlags)) {
        if (n.flags[fKey] !== fVal) return false;
      }
    }
    if (cond.minAttributes && this.progression) {
      const attrs = this.progression.getTotalAttributes();
      for (const [attr, minVal] of Object.entries(cond.minAttributes)) {
        if ((attrs[attr] || 0) < minVal) return false;
      }
    }
    if (cond.requiredItems) {
      for (const req of cond.requiredItems) {
        const owned = (st.inventory || [])
          .filter((i) => i.itemId === req.itemId)
          .reduce((sum, i) => sum + (i.quantity || 0), 0);
        if (owned < (req.quantity || 1)) return false;
      }
    }
    return true;
  }

  startDialogue(dialogueId, resumeInterrupted = false) {
    const n = this.ensureShape();
    const tree = DIALOGUE_TREES[dialogueId];
    if (!tree) return null;

    const npcSt = n.npcState[tree.npcId];
    if (npcSt && (!npcSt.alive || !npcSt.present)) return null;

    const nodeId = resumeInterrupted && n.activeDialogue?.nodeId ? n.activeDialogue.nodeId : tree.startNodeId;
    n.activeDialogue = { dialogueId, nodeId, interrupted: false };
    EventBus.emit(NARRATIVE_EVENTS.DIALOGUE_OPENED, { dialogueId, nodeId });
    return this.getCurrentDialogueView();
  }

  interruptDialogue() {
    const n = this.ensureShape();
    if (!n.activeDialogue) return;
    n.activeDialogue.interrupted = true;
    EventBus.emit(NARRATIVE_EVENTS.DIALOGUE_CLOSED, { interrupted: true });
  }

  getCurrentDialogueView() {
    const n = this.ensureShape();
    if (!n.activeDialogue) return null;
    const tree = DIALOGUE_TREES[n.activeDialogue.dialogueId];
    const node = tree?.nodes?.[n.activeDialogue.nodeId];
    if (!tree || !node) return null;

    const availableChoices = (node.choices || []).filter((c) => this.isChoiceAvailable(c));
    return {
      dialogueId: tree.id,
      npcId: tree.npcId,
      nodeId: node.id,
      speaker: node.speaker,
      text: node.text,
      choices: availableChoices
    };
  }

  selectDialogueChoice(choiceId) {
    const n = this.ensureShape();
    const st = this.gameState.getState();
    const view = this.getCurrentDialogueView();
    if (!view) return null;

    const choice = view.choices.find((c) => c.id === choiceId);
    if (!choice || !this.isChoiceAvailable(choice)) return null;

    const cons = choice.consequences || {};
    if (cons.flags) {
      for (const [k, v] of Object.entries(cons.flags)) n.flags[k] = v;
    }
    if (cons.reputation) {
      for (const [fac, delta] of Object.entries(cons.reputation)) {
        n.reputation[fac] = (n.reputation[fac] || 0) + delta;
      }
    }
    if (cons.relationship) {
      for (const [npcId, delta] of Object.entries(cons.relationship)) {
        n.npcState[npcId] = n.npcState[npcId] || { relationship: 0, alive: true, present: true };
        n.npcState[npcId].relationship += delta;
      }
    }
    if (cons.consumeItems && this.invSystem) {
      for (const item of cons.consumeItems) {
        const entry = (st.inventory || []).find((i) => i.itemId === item.itemId);
        if (entry) this.invSystem.removeItemByUid(entry.uid, item.quantity || 1);
      }
    }
    if (cons.gold) {
      st.gold = (st.gold || 0) + cons.gold;
    }
    if (cons.xp && this.progression) {
      this.progression.awardXp(cons.xp, 'quest');
    }
    if (cons.corruption && this.progression) {
      this.progression.addCorruption(cons.corruption, 'dialogue_choice');
    }
    if (cons.unlockLoreId) {
      this.unlockCodexEntry(cons.unlockLoreId);
    }
    if (cons.startQuestId) {
      this.startQuest(cons.startQuestId);
    }

    n.dialogueHistory.push({
      dialogueId: view.dialogueId,
      nodeId: view.nodeId,
      choiceId: choice.id,
      timestamp: Date.now()
    });

    this.recordObjectiveProgress('interact', view.npcId, 1);

    if (!choice.nextNodeId) {
      n.activeDialogue = null;
      EventBus.emit(NARRATIVE_EVENTS.DIALOGUE_CLOSED, { interrupted: false });
      return null;
    }

    n.activeDialogue.nodeId = choice.nextNodeId;
    return this.getCurrentDialogueView();
  }

  startQuest(questId) {
    const n = this.ensureShape();
    const def = QUEST_DEFINITIONS[questId];
    if (!def) return { ok: false, reason: 'unknown_quest' };
    if (n.quests[questId]) return { ok: false, reason: 'already_started' };

    const prereq = def.prerequisites || {};
    if (prereq.completedQuests) {
      for (const reqId of prereq.completedQuests) {
        if (n.quests[reqId]?.status !== 'completed') {
          return { ok: false, reason: 'missing_prerequisite_quest' };
        }
      }
    }
    if (prereq.minCorruption !== undefined && (this.gameState.getState().progression?.corruption || 0) < prereq.minCorruption) {
      return { ok: false, reason: 'insufficient_corruption' };
    }

    const objMap = {};
    for (const stage of def.stages || []) {
      for (const obj of stage.objectives || []) {
        objMap[obj.id] = obj.current || 0;
      }
    }

    n.quests[questId] = {
      questId,
      status: 'active',
      stageIndex: 0,
      objectives: objMap,
      rewardClaimed: false
    };
    EventBus.emit(NARRATIVE_EVENTS.QUEST_UPDATED, n.quests[questId]);
    return { ok: true, quest: n.quests[questId] };
  }

  abandonOrFailQuest(questId, nextStatus = 'abandoned') {
    const n = this.ensureShape();
    const q = n.quests[questId];
    if (!q || q.status !== 'active') return false;
    q.status = nextStatus === 'failed' ? 'failed' : 'abandoned';
    EventBus.emit(NARRATIVE_EVENTS.QUEST_UPDATED, q);
    return true;
  }

  recordObjectiveProgress(type, target, delta = 1) {
    const n = this.ensureShape();
    const st = this.gameState.getState();

    for (const [questId, qState] of Object.entries(n.quests)) {
      if (qState.status !== 'active') continue;
      const def = QUEST_DEFINITIONS[questId];
      const stage = def?.stages?.[qState.stageIndex];
      if (!stage) continue;

      for (const obj of stage.objectives || []) {
        if (obj.type === type && (obj.target === target || obj.target === 'any_enemy')) {
          qState.objectives[obj.id] = Math.min(obj.required, (qState.objectives[obj.id] || 0) + delta);
        }
      }

      for (const obj of stage.objectives || []) {
        if (obj.type === 'collect') {
          const owned = (st.inventory || [])
            .filter((i) => i.itemId === obj.target)
            .reduce((s, i) => s + (i.quantity || 0), 0);
          qState.objectives[obj.id] = Math.min(obj.required, Math.max(qState.objectives[obj.id] || 0, owned));
        }
      }

      const allRequiredDone = (stage.objectives || [])
        .filter((o) => !o.optional)
        .every((o) => (qState.objectives[o.id] || 0) >= o.required);

      if (allRequiredDone) {
        if (qState.stageIndex + 1 < (def.stages || []).length) {
          qState.stageIndex += 1;
        } else {
          this.completeQuest(questId);
        }
      } else {
        EventBus.emit(NARRATIVE_EVENTS.QUEST_UPDATED, qState);
      }
    }
  }

  completeQuest(questId) {
    const n = this.ensureShape();
    const st = this.gameState.getState();
    const qState = n.quests[questId];
    const def = QUEST_DEFINITIONS[questId];
    if (!qState || !def || qState.status === 'completed') return false;

    qState.status = 'completed';

    if (!qState.rewardClaimed && def.rewards) {
      qState.rewardClaimed = true;
      if (def.rewards.xp && this.progression) this.progression.awardXp(def.rewards.xp, 'quest');
      if (def.rewards.gold) st.gold = (st.gold || 0) + def.rewards.gold;
      if (def.rewards.items && this.invSystem) {
        for (const it of def.rewards.items) {
          this.invSystem.addItem(it.itemId, it.quantity || 1);
        }
      }
      if (def.rewards.abilityId && this.progression) {
        this.progression.equipAbility(def.rewards.abilityId, 2);
      }
      if (def.rewards.corruptionDelta && this.progression) {
        this.progression.addCorruption(def.rewards.corruptionDelta, 'quest_reward');
      }
      if (def.rewards.flags) {
        for (const [k, v] of Object.entries(def.rewards.flags)) n.flags[k] = v;
      }
    }

    if (def.branchOutcomeFlag) {
      n.flags[def.branchOutcomeFlag] = true;
    }

    EventBus.emit(NARRATIVE_EVENTS.QUEST_COMPLETED, { questId, rewards: def.rewards });
    if (def.nextQuestId) {
      this.startQuest(def.nextQuestId);
    }
    return true;
  }

  unlockCodexEntry(entryId) {
    const n = this.ensureShape();
    if (!n.codex[entryId]) return false;
    const already = n.codex[entryId].unlocked;
    n.codex[entryId].unlocked = true;
    if (!already) {
      EventBus.emit(NARRATIVE_EVENTS.CODEX_UNLOCKED, { entryId });
    }
    return true;
  }

  markCodexRead(entryId) {
    const n = this.ensureShape();
    if (n.codex[entryId]) n.codex[entryId].read = true;
  }

  queryCodex({ category = 'all', search = '' } = {}) {
    const n = this.ensureShape();
    const q = search.trim().toLowerCase();
    return CODEX_ENTRIES.filter((entry) => {
      const state = n.codex[entry.id];
      if (!state?.unlocked) return false;
      if (category !== 'all' && entry.category !== category) return false;
      if (q && !entry.title.toLowerCase().includes(q) && !entry.body.toLowerCase().includes(q)) return false;
      return true;
    }).map((entry) => ({ ...entry, ...n.codex[entry.id] }));
  }

  triggerNarrativeEvent(eventSpec = {}) {
    const n = this.ensureShape();
    if (eventSpec.onceFlag && n.flags[eventSpec.onceFlag]) return false;
    if (eventSpec.onceFlag) n.flags[eventSpec.onceFlag] = true;

    if (eventSpec.unlockLoreId) this.unlockCodexEntry(eventSpec.unlockLoreId);
    if (eventSpec.startQuestId) this.startQuest(eventSpec.startQuestId);
    if (eventSpec.dialogueId) this.startDialogue(eventSpec.dialogueId);
    if (eventSpec.corruption && this.progression) {
      this.progression.addCorruption(eventSpec.corruption, eventSpec.source || 'narrative_event');
    }

    EventBus.emit(NARRATIVE_EVENTS.STORY_EVENT_FIRED, eventSpec);
    return true;
  }

  evaluateEnding() {
    const n = this.ensureShape();
    const prog = this.progression?.ensureProgressionShape?.() || this.gameState.getState().progression;
    const corr = prog?.corruption || 0;

    const sorted = [...ENDING_CONDITIONS].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    for (const ending of sorted) {
      const req = ending.requires || {};
      if (req.minCorruption !== undefined && corr < req.minCorruption) continue;
      if (req.maxCorruption !== undefined && corr > req.maxCorruption) continue;
      if (req.flags) {
        const flagsMatch = Object.entries(req.flags).every(([k, v]) => Boolean(n.flags[k]) === Boolean(v));
        if (!flagsMatch) continue;
      }
      return ending;
    }
    return ENDING_CONDITIONS[ENDING_CONDITIONS.length - 1];
  }
}