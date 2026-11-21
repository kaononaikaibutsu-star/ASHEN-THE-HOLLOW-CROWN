// src/data/skillTreesData.js
export const SKILL_TREES = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    skills: [
      {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        description: 'Active: Enter bloodlust for 6s (+25% damage, +15% move speed, costs 20 stamina).',
        icon: 'icon_sk_berserker',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { strength: 11 },
        effect: { type: 'buff', durationMs: 6000, damageMult: 1.25, speedMult: 1.15, staminaCost: 20, cooldownMs: 5000 }
      },
      {
        id: 'iron_skin',
        name: 'Iron Skin',
        description: 'Passive: +8 Defense and +6% damage reduction per rank.',
        icon: 'icon_sk_iron_skin',
        category: 'passive',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { vigor: 11 },
        effect: { type: 'passive_defense', defensePerRank: 8, damageReductionPerRank: 0.06 }
      },
      {
        id: 'executioners_strike',
        name: 'Executioner\'s Strike',
        description: 'Active: Heavy cleave dealing bonus damage & heavy knockback.',
        icon: 'icon_sk_executioner',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'berserker_rage',
        minRankOfReq: 1,
        attrReq: { strength: 14 },
        effect: { type: 'melee_burst', basePower: 34, perRankPower: 14, knockback: 240, staminaCost: 28, cooldownMs: 4200 }
      },
      {
        id: 'weapon_mastery',
        name: 'Weapon Mastery',
        description: 'Passive: +10% weapon damage and +5% crit chance per rank.',
        icon: 'icon_sk_mastery',
        category: 'passive',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'iron_skin',
        minRankOfReq: 1,
        attrReq: { strength: 13, dexterity: 11 },
        effect: { type: 'passive_weapon', damagePctPerRank: 0.1, critChancePerRank: 0.05 }
      },
      {
        id: 'unbreakable_will',
        name: 'Unbreakable Will',
        description: 'Passive: +20 Max Health and +15 Max Stamina per rank.',
        icon: 'icon_sk_will',
        category: 'passive',
        maxRank: 3,
        pointCost: 2,
        requiresSkillId: 'weapon_mastery',
        minRankOfReq: 1,
        attrReq: { vigor: 14, endurance: 13 },
        effect: { type: 'passive_vitals', hpPerRank: 20, staminaPerRank: 15 }
      }
    ]
  },
  wanderer: {
    id: 'wanderer',
    name: 'Wanderer',
    skills: [
      {
        id: 'shadow_step',
        name: 'Shadow Step',
        description: 'Active: Blink forward with brief invulnerability.',
        icon: 'icon_sk_shadow_step',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { dexterity: 11 },
        effect: { type: 'dash_blink', distance: 95, invulnMs: 320, staminaCost: 16, cooldownMs: 2400 }
      },
      {
        id: 'lethal_precision',
        name: 'Lethal Precision',
        description: 'Passive: +6% Crit Chance and +20% Crit Damage per rank.',
        icon: 'icon_sk_precision',
        category: 'passive',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { dexterity: 12 },
        effect: { type: 'passive_crit', critChancePerRank: 0.06, critMultPerRank: 0.2 }
      },
      {
        id: 'phantom_dodge',
        name: 'Phantom Dodge',
        description: 'Passive: +120ms dodge invulnerability and -12% dodge stamina cost per rank.',
        icon: 'icon_sk_phantom_dodge',
        category: 'passive',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'shadow_step',
        minRankOfReq: 1,
        attrReq: { dexterity: 13, endurance: 11 },
        effect: { type: 'passive_dodge', extraInvulnMsPerRank: 120, staminaDiscountPerRank: 0.12 }
      },
      {
        id: 'backstab',
        name: 'Backstab',
        description: 'Active: High-crit strike against nearby enemies.',
        icon: 'icon_sk_backstab',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'lethal_precision',
        minRankOfReq: 1,
        attrReq: { dexterity: 14 },
        effect: { type: 'melee_burst', basePower: 28, perRankPower: 13, forceCrit: true, staminaCost: 22, cooldownMs: 3600 }
      },
      {
        id: 'death_mark',
        name: 'Death Mark',
        description: 'Active: Marks foes in range for +20% damage taken for 5s.',
        icon: 'icon_sk_death_mark',
        category: 'active',
        maxRank: 3,
        pointCost: 2,
        requiresSkillId: 'backstab',
        minRankOfReq: 1,
        attrReq: { dexterity: 15, arcane: 10 },
        effect: { type: 'debuff_zone', radius: 95, vulnBonus: 0.2, durationMs: 5000, staminaCost: 24, cooldownMs: 6000 }
      }
    ]
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    skills: [
      {
        id: 'soul_drain',
        name: 'Soul Drain',
        description: 'Active: Siphon life from nearby foes to restore HP (scales with Faith & Arcane).',
        icon: 'icon_sk_soul_drain',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { intelligence: 11 },
        effect: { type: 'drain_heal', radius: 85, baseHeal: 18, perRankHeal: 10, staminaCost: 22, cooldownMs: 4500 }
      },
      {
        id: 'void_bolt',
        name: 'Void Bolt',
        description: 'Active: Launch a piercing arcane pulse in facing direction.',
        icon: 'icon_sk_void_bolt',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: null,
        minRankOfReq: 0,
        attrReq: { intelligence: 12 },
        effect: { type: 'arcane_bolt', basePower: 26, perRankPower: 12, range: 150, staminaCost: 18, cooldownMs: 2600 }
      },
      {
        id: 'blood_pact',
        name: 'Blood Pact',
        description: 'Passive/Forbidden: +18 Magic & Arcane power per rank; increases Hollow Crown corruption.',
        icon: 'icon_sk_blood_pact',
        category: 'passive',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'soul_drain',
        minRankOfReq: 1,
        attrReq: { intelligence: 13, arcane: 11 },
        effect: { type: 'passive_arcane', magicPerRank: 18, corruptionGain: 10 }
      },
      {
        id: 'dark_flame',
        name: 'Dark Flame',
        description: 'Active: Scorch foes in an arc with burning ember damage.',
        icon: 'icon_sk_dark_flame',
        category: 'active',
        maxRank: 3,
        pointCost: 1,
        requiresSkillId: 'void_bolt',
        minRankOfReq: 1,
        attrReq: { intelligence: 14, faith: 11 },
        effect: { type: 'arcane_burst', basePower: 32, perRankPower: 14, radius: 75, staminaCost: 26, cooldownMs: 4000 }
      },
      {
        id: 'abyssal_storm',
        name: 'Abyssal Storm',
        description: 'Active: Unleashes a wide storm around the player; inflicts corruption.',
        icon: 'icon_sk_abyssal_storm',
        category: 'active',
        maxRank: 3,
        pointCost: 2,
        requiresSkillId: 'dark_flame',
        minRankOfReq: 1,
        attrReq: { intelligence: 16, arcane: 13 },
        effect: { type: 'arcane_burst', basePower: 48, perRankPower: 18, radius: 120, corruptionGain: 12, staminaCost: 36, cooldownMs: 7500 }
      }
    ]
  }
};

export function findSkillById(skillId) {
  for (const tree of Object.values(SKILL_TREES)) {
    const found = tree.skills.find((s) => s.id === skillId);
    if (found) return { treeId: tree.id, skill: found };
  }
  return null;
}