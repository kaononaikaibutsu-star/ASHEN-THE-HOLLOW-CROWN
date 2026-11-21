// src/systems/ProgressionSystem.js
import { PROGRESSION_CONFIG, getXpRequiredForLevel } from '../data/progressionData.js';
import { findSkillById } from '../data/skillTreesData.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export const PROGRESSION_EVENTS = {
  XP_GAINED: 'progression:xp_gained',
  LEVEL_UP: 'progression:level_up',
  ATTRIBUTES_CHANGED: 'progression:attributes_changed',
  SKILL_UNLOCKED: 'progression:skill_unlocked',
  CORRUPTION_CHANGED: 'progression:corruption_changed',
  CROWN_THRESHOLD_REACHED: 'progression:crown_threshold_reached'
};

export class ProgressionSystem {
  constructor(gameState, invSystem) {
    this.gameState = gameState;
    this.invSystem = invSystem;
  }

  ensureProgressionShape() {
    const st = this.gameState.getState();
    st.progression = st.progression || {
      level: 1,
      xp: 0,
      attributePoints: 0,
      skillPoints: 0,
      attributes: { ...PROGRESSION_CONFIG.baseAttributes },
      skillRanks: {},
      equippedAbilities: [null, null, null, null],
      corruption: 0,
      unlockedCrownThresholds: [],
      flags: {
        npcReactionTier: 0,
        endingPathBias: 'neutral',
        forbiddenActsCount: 0
      }
    };
    return st.progression;
  }

  getTotalAttributes() {
    const prog = this.ensureProgressionShape();
    const st = this.gameState.getState();
    const out = { ...prog.attributes };

    // Add equipment flat attribute bonuses if present
    for (const eq of Object.values(st.equipment || {})) {
      if (!eq?.attributeBonuses) continue;
      for (const [k, v] of Object.entries(eq.attributeBonuses)) {
        if (k in out) out[k] += v;
      }
    }
    return out;
  }

  awardXp(amount, sourceType = 'enemy') {
    const prog = this.ensureProgressionShape();
    const base = Number.isFinite(Number(amount)) ? Number(amount) : (PROGRESSION_CONFIG.xpSources[sourceType] || 0);
    if (base <= 0 || prog.level >= PROGRESSION_CONFIG.maxLevel) {
      return { gained: 0, levelsGained: 0, level: prog.level };
    }

    prog.xp += Math.round(base);
    let levelsGained = 0;

    while (prog.level < PROGRESSION_CONFIG.maxLevel) {
      const needed = getXpRequiredForLevel(prog.level + 1, PROGRESSION_CONFIG);
      if (prog.xp < needed) break;
      prog.xp -= needed;
      prog.level += 1;
      levelsGained += 1;
      prog.attributePoints += PROGRESSION_CONFIG.attributePointsPerLevel;
      prog.skillPoints += PROGRESSION_CONFIG.skillPointsPerLevel;
      EventBus.emit(PROGRESSION_EVENTS.LEVEL_UP, {
        level: prog.level,
        attributePoints: prog.attributePoints,
        skillPoints: prog.skillPoints
      });
    }

    if (prog.level >= PROGRESSION_CONFIG.maxLevel) {
      prog.xp = 0;
    }

    EventBus.emit(PROGRESSION_EVENTS.XP_GAINED, {
      gained: Math.round(base),
      sourceType,
      level: prog.level,
      xp: prog.xp,
      nextLevelXp: getXpRequiredForLevel(prog.level + 1, PROGRESSION_CONFIG)
    });
    this.invSystem?.syncPlayerStats();
    return { gained: Math.round(base), levelsGained, level: prog.level };
  }

  allocateAttribute(attrKey, points = 1) {
    const prog = this.ensureProgressionShape();
    const pts = Math.floor(Number(points));
    if (!(attrKey in PROGRESSION_CONFIG.baseAttributes)) return { ok: false, reason: 'invalid_attribute' };
    if (pts <= 0 || prog.attributePoints < pts) return { ok: false, reason: 'insufficient_points' };

    prog.attributes[attrKey] += pts;
    prog.attributePoints -= pts;
    this.invSystem?.syncPlayerStats();
    EventBus.emit(PROGRESSION_EVENTS.ATTRIBUTES_CHANGED, { attributes: prog.attributes, pointsLeft: prog.attributePoints });
    return { ok: true, value: prog.attributes[attrKey] };
  }

  respecAttributes() {
    const prog = this.ensureProgressionShape();
    const st = this.gameState.getState();
    const cost = PROGRESSION_CONFIG.respecCostGold;
    if ((st.gold || 0) < cost) return { ok: false, reason: 'insufficient_gold' };

    let refunded = 0;
    for (const [k, baseVal] of Object.entries(PROGRESSION_CONFIG.baseAttributes)) {
      const cur = prog.attributes[k] ?? baseVal;
      if (cur > baseVal) {
        refunded += cur - baseVal;
        prog.attributes[k] = baseVal;
      }
    }

    st.gold -= cost;
    prog.attributePoints += refunded;
    this.invSystem?.syncPlayerStats();
    EventBus.emit(PROGRESSION_EVENTS.ATTRIBUTES_CHANGED, { attributes: prog.attributes, pointsLeft: prog.attributePoints });
    return { ok: true, refunded };
  }

  canUnlockSkill(skillId) {
    const prog = this.ensureProgressionShape();
    const found = findSkillById(skillId);
    if (!found) return { ok: false, reason: 'unknown_skill' };

    const { skill } = found;
    const currentRank = prog.skillRanks[skillId] || 0;
    if (currentRank >= skill.maxRank) return { ok: false, reason: 'max_rank' };
    if (prog.skillPoints < skill.pointCost) return { ok: false, reason: 'insufficient_skill_points' };

    if (skill.requiresSkillId) {
      const reqRank = prog.skillRanks[skill.requiresSkillId] || 0;
      const neededRank = skill.minRankOfReq || 1;
      if (reqRank < neededRank) return { ok: false, reason: 'missing_prerequisite' };
    }

    const totalAttrs = this.getTotalAttributes();
    if (skill.attrReq) {
      for (const [attr, minVal] of Object.entries(skill.attrReq)) {
        if ((totalAttrs[attr] || 0) < minVal) return { ok: false, reason: `requires_${attr}` };
      }
    }

    return { ok: true, skill, nextRank: currentRank + 1 };
  }

  unlockSkill(skillId) {
    const check = this.canUnlockSkill(skillId);
    if (!check.ok) return check;

    const prog = this.ensureProgressionShape();
    const { skill, nextRank } = check;
    prog.skillPoints -= skill.pointCost;
    prog.skillRanks[skillId] = nextRank;

    // Auto-slot active skill if an empty ability slot exists
    if (skill.category === 'active' && !prog.equippedAbilities.includes(skillId)) {
      const emptyIdx = prog.equippedAbilities.findIndex((x) => !x);
      if (emptyIdx !== -1) prog.equippedAbilities[emptyIdx] = skillId;
    }

    if (skill.effect?.corruptionGain) {
      this.addCorruption(skill.effect.corruptionGain, 'forbidden_skill');
    }

    this.invSystem?.syncPlayerStats();
    EventBus.emit(PROGRESSION_EVENTS.SKILL_UNLOCKED, { skillId, rank: nextRank, skillPoints: prog.skillPoints });
    return { ok: true, rank: nextRank };
  }

  equipAbility(abilityId, slotIndex = 0) {
    const prog = this.ensureProgressionShape();
    if (slotIndex < 0 || slotIndex > 3) return false;
    prog.equippedAbilities[slotIndex] = abilityId;
    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, this.gameState.getState().player);
    return true;
  }

  addCorruption(amount, reason = 'forbidden_ability') {
    const prog = this.ensureProgressionShape();
    const val = Number(amount) || 0;
    if (val === 0) return prog.corruption;

    const prev = prog.corruption;
    prog.corruption = Math.max(0, Math.min(PROGRESSION_CONFIG.hollowCrown.maxCorruption, prog.corruption + val));
    if (val > 0) prog.flags.forbiddenActsCount += 1;

    for (const th of PROGRESSION_CONFIG.hollowCrown.thresholds) {
      if (prog.corruption >= th.corruption && !prog.unlockedCrownThresholds.includes(th.id)) {
        prog.unlockedCrownThresholds.push(th.id);
        prog.flags.npcReactionTier = Math.max(prog.flags.npcReactionTier, th.hookFlags.npcReactionTier);
        prog.flags.endingPathBias = th.hookFlags.endingPathBias;
        EventBus.emit(PROGRESSION_EVENTS.CROWN_THRESHOLD_REACHED, th);
      }
    }

    if (prog.corruption !== prev) {
      this.invSystem?.syncPlayerStats();
      EventBus.emit(PROGRESSION_EVENTS.CORRUPTION_CHANGED, {
        corruption: prog.corruption,
        maxCorruption: PROGRESSION_CONFIG.hollowCrown.maxCorruption,
        reason
      });
    }
    return prog.corruption;
  }

  getActiveCrownBonus() {
    const prog = this.ensureProgressionShape();
    let damageMult = 1;
    let healthMult = 1;
    let incomingDamageMult = 1;
    const unlockedAbilities = [];

    for (const th of PROGRESSION_CONFIG.hollowCrown.thresholds) {
      if (prog.corruption >= th.corruption) {
        damageMult = Math.max(damageMult, th.bonusDamageMult || 1);
        if (th.drawback?.maxHealthMult) {
          healthMult = Math.min(healthMult, th.drawback.maxHealthMult);
        }
        if (th.drawback?.incomingDamageMult) {
          incomingDamageMult = Math.max(incomingDamageMult, th.drawback.incomingDamageMult);
        }
        if (th.abilityId) {
          unlockedAbilities.push({ id: th.abilityId, name: th.abilityName, cooldownMs: th.cooldownMs, staminaCost: th.staminaCost });
        }
      }
    }

    return { damageMult, healthMult, incomingDamageMult, unlockedAbilities };
  }
}