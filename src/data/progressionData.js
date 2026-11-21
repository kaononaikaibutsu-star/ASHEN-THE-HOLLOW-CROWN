// src/data/progressionData.js
export const PROGRESSION_CONFIG = {
  maxLevel: 50,
  baseXpForLevel2: 100,
  xpExponent: 1.38,
  attributePointsPerLevel: 2,
  skillPointsPerLevel: 1,
  respecCostGold: 75,
  xpSources: {
    enemy: 25,
    boss: 180,
    quest: 120,
    discovery: 60
  },
  baseAttributes: {
    vigor: 10,
    endurance: 10,
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    faith: 10,
    arcane: 8
  },
  attributeMeta: {
    vigor: { label: 'Vigor', description: 'Increases maximum health.' },
    endurance: { label: 'Endurance', description: 'Increases maximum stamina and stamina recovery.' },
    strength: { label: 'Strength', description: 'Increases physical & heavy weapon damage.' },
    dexterity: { label: 'Dexterity', description: 'Increases attack speed and critical chance.' },
    intelligence: { label: 'Intelligence', description: 'Increases magic damage.' },
    faith: { label: 'Faith', description: 'Increases healing and holy ability potency.' },
    arcane: { label: 'Arcane', description: 'Empowers curses, corruption synergy, and supernatural abilities.' }
  },
  attributeScaling: {
    vigor: { maxHealthPerPoint: 14 },
    endurance: { maxStaminaPerPoint: 10, staminaRegenPerSecPerPoint: 1.4 },
    strength: { attackDamagePerPoint: 2.2, heavyMultPerPoint: 0.025 },
    dexterity: { attackSpeedPerPoint: 0.018, critChancePerPoint: 0.012 },
    intelligence: { magicPowerPerPoint: 3.5 },
    faith: { healingPowerPerPoint: 0.06, holyPowerPerPoint: 2.8 },
    arcane: { arcanePowerPerPoint: 3.0, corruptionBonusPerPoint: 0.015 }
  },
  hollowCrown: {
    maxCorruption: 100,
    corruptionGains: {
      forbiddenAbility: 12,
      cursedItemEquip: 8,
      hollowShrine: 15,
      bossCrownAbsorb: 20
    },
    thresholds: [
      {
        id: 'ash_whisper',
        corruption: 20,
        title: 'Whisper of Ash',
        abilityId: 'crown_ash_veil',
        abilityName: 'Ash Veil',
        cooldownMs: 4500,
        staminaCost: 15,
        bonusDamageMult: 1.08,
        drawback: { maxHealthMult: 0.96, npcDispositionDelta: -5 },
        hookFlags: { npcReactionTier: 1, endingPathBias: 'hollow' }
      },
      {
        id: 'fractured_diadem',
        corruption: 50,
        title: 'Fractured Diadem',
        abilityId: 'crown_soul_siphon',
        abilityName: 'Crown Siphon',
        cooldownMs: 6500,
        staminaCost: 24,
        bonusDamageMult: 1.18,
        drawback: { maxHealthMult: 0.9, npcDispositionDelta: -15 },
        hookFlags: { npcReactionTier: 2, endingPathBias: 'hollow' }
      },
      {
        id: 'sovereign_eclipse',
        corruption: 80,
        title: 'Sovereign Eclipse',
        abilityId: 'crown_abyss_judgment',
        abilityName: 'Abyss Judgment',
        cooldownMs: 9000,
        staminaCost: 35,
        bonusDamageMult: 1.32,
        drawback: { maxHealthMult: 0.82, incomingDamageMult: 1.1, npcDispositionDelta: -30 },
        hookFlags: { npcReactionTier: 3, endingPathBias: 'hollow_crown' }
      }
    ]
  }
};

export function getXpRequiredForLevel(level, cfg = PROGRESSION_CONFIG) {
  if (level <= 1) return 0;
  if (level > cfg.maxLevel) return Infinity;
  return Math.round(cfg.baseXpForLevel2 * Math.pow(level - 1, cfg.xpExponent));
}