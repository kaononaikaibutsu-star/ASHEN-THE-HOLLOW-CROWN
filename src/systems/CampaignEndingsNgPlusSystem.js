// src/systems/CampaignEndingsNgPlusSystem.js
import { DIFFICULTY_MODES, CAMPAIGN_CHAPTERS, FOUR_CAMPAIGN_ENDINGS, NG_PLUS_RELICS } from '../data/campaignReleaseData.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

const PLAYER_STATS_EVENT = EVENTS?.PLAYER_STATS_CHANGED || 'player:stats_changed';

export class CampaignEndingsNgPlusSystem {
  constructor(gameState, { progressionSystem, invSystem, narrativeSystem } = {}) {
    this.gameState = gameState;
    this.progression = progressionSystem;
    this.invSystem = invSystem;
    this.narrative = narrativeSystem;
  }

  ensureShape() {
    const st = this.gameState.getState();
    st.campaign = st.campaign || {
      currentChapter: 1,
      completedChapters: [],
      difficultyId: 'ashen',
      ngPlusCycle: 0,
      endingReached: null
    };
    return st.campaign;
  }

  setDifficulty(difficultyId) {
    const camp = this.ensureShape();
    if (!DIFFICULTY_MODES[difficultyId]) return false;
    camp.difficultyId = difficultyId;
    this.gameState.getState().settings = {
      ...(this.gameState.getState().settings || {}),
      difficultyId
    };
    EventBus.emit(PLAYER_STATS_EVENT, this.gameState.getState().player);
    return true;
  }

  getActiveDifficultyModifiers() {
    const camp = this.ensureShape();
    const base = DIFFICULTY_MODES[camp.difficultyId] || DIFFICULTY_MODES.ashen;
    const ng = camp.ngPlusCycle || 0;
    const ngScale = ng > 0 ? 1 + ng * 0.35 : 1;
    return {
      ...base,
      ngPlusCycle: ng,
      enemyDamageMult: Number((base.enemyDamageMult * ngScale).toFixed(2)),
      enemyHealthMult: Number((base.enemyHealthMult * (1 + ng * 0.45)).toFixed(2)),
      lootBonusMult: Number((base.lootBonusMult * (1 + ng * 0.25)).toFixed(2)),
      xpMult: Number((base.xpMult * (1 + ng * 0.3)).toFixed(2))
    };
  }

  completeChapter(chapterNum) {
    const camp = this.ensureShape();
    const def = CAMPAIGN_CHAPTERS.find((c) => c.chapter === chapterNum);
    if (!def) return null;
    if (!camp.completedChapters.includes(chapterNum)) {
      camp.completedChapters.push(chapterNum);
    }
    const nextCh = CAMPAIGN_CHAPTERS.find((c) => c.chapter === chapterNum + 1);
    if (nextCh) {
      camp.currentChapter = nextCh.chapter;
      if (this.narrative && nextCh.mainQuestId) {
        this.narrative.startQuest(nextCh.mainQuestId);
      }
    }
    return def;
  }

  evaluateFourEndings() {
    const camp = this.ensureShape();
    const st = this.gameState.getState();
    const flags = st.narrative?.flags || {};
    const corr = st.progression?.corruption || 0;

    const sorted = [...FOUR_CAMPAIGN_ENDINGS].sort((a, b) => b.priority - a.priority);
    let chosen = sorted[sorted.length - 1];

    for (const end of sorted) {
      const req = end.requires || {};
      if (req.minCorruption !== undefined && corr < req.minCorruption) continue;
      if (req.maxCorruption !== undefined && corr > req.maxCorruption) continue;
      if (req.flags) {
        const ok = Object.entries(req.flags).every(([k, v]) => Boolean(flags[k]) === Boolean(v));
        if (!ok) continue;
      }
      chosen = end;
      break;
    }

    camp.endingReached = chosen.id;
    return {
      ending: chosen,
      stats: {
        level: st.progression?.level || 1,
        corruption: corr,
        ngPlusCycle: camp.ngPlusCycle || 0,
        completedChaptersCount: camp.completedChapters.length,
        discoveredCodexCount: Object.values(st.narrative?.codex || {}).filter((c) => c?.unlocked).length
      }
    };
  }

  startNewGamePlus() {
    const camp = this.ensureShape();
    const st = this.gameState.getState();
    const nextCycle = (camp.ngPlusCycle || 0) + 1;

    // Carry over level, attributes, skills, unlocked recipes, codex, and equipped/key items
    const carriedProgression = {
      ...(st.progression || {}),
      corruption: Math.max(0, Math.round((st.progression?.corruption || 0) * 0.25))
    };
    const carriedCodex = { ...(st.narrative?.codex || {}) };
    const carriedRecipes = [...(st.craftingEconomy?.unlockedRecipes || [])];
    const carriedEquipment = { ...(st.equipment || {}) };

    camp.ngPlusCycle = nextCycle;
    camp.currentChapter = 1;
    camp.completedChapters = [];
    camp.endingReached = null;

    st.regionId = 'ashen_vale';
    st.player.x = 160;
    st.player.y = 160;
    st.progression = carriedProgression;
    st.equipment = carriedEquipment;
    st.narrative = {
      flags: { ng_plus_cycle: nextCycle },
      reputation: st.narrative?.reputation || {},
      npcState: st.narrative?.npcState || {},
      activeDialogue: null,
      dialogueHistory: [],
      quests: {},
      codex: carriedCodex
    };
    st.craftingEconomy = {
      ...(st.craftingEconomy || {}),
      depletedNodes: {},
      unlockedRecipes: carriedRecipes
    };
    st.worldExploration = {
      discoveredRegions: ['ashen_vale'],
      discoveredLocations: ['vale_hearth_sanctum'],
      openedChests: [],
      brokenProps: [],
      activatedSwitches: [],
      unlockedDoors: [],
      completedDungeons: [],
      checkpoint: { regionId: 'ashen_vale', x: 160, y: 160, label: 'Vale Wayshrine' },
      fogByRegion: {}
    };

    const relic = nextCycle >= 2 ? NG_PLUS_RELICS.ng2 : NG_PLUS_RELICS.ng1;
    this.invSystem?.addItem(relic.id, 1, { rarity: relic.rarity });
    this.invSystem?.syncPlayerStats();
    EventBus.emit(PLAYER_STATS_EVENT, st.player);
    return { ok: true, ngPlusCycle: nextCycle, relicGranted: relic.id };
  }
}