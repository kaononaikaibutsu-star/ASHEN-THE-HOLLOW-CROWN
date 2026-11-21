// src/data/enemyEcosystemData.js
export const ELITE_MODIFIERS = {
  frenzied: {
    id: 'frenzied',
    label: 'Frenzied',
    hpMult: 1.4,
    dmgMult: 1.25,
    speedMult: 1.2,
    xpMult: 1.6,
    tint: 0xff7b29
  },
  ironclad: {
    id: 'ironclad',
    label: 'Ironclad',
    hpMult: 1.65,
    dmgMult: 1.1,
    speedMult: 0.9,
    armorBonus: 8,
    staggerThresholdMult: 1.5,
    xpMult: 1.75,
    tint: 0x9ab8d9
  },
  blighted: {
    id: 'blighted',
    label: 'Blighted',
    hpMult: 1.35,
    dmgMult: 1.2,
    speedMult: 1.05,
    onHitStatus: 'poison',
    xpMult: 1.65,
    tint: 0x7ce879
  }
};

export const ENEMY_ECOSYSTEM_DEFS = {
  skeleton_skirmisher: {
    id: 'skeleton_skirmisher',
    name: 'Ash-Bone Skirmisher',
    faction: 'undead',
    role: 'melee',
    textureKey: 'enemy_thrall',
    maxHealth: 50,
    stamina: 40,
    armor: 3,
    resistances: { physical: 0.05, fire: -0.1, arcane: 0.1 },
    damage: 11,
    moveSpeed: 84,
    detectRange: 175,
    hearingRange: 230,
    fovRad: Math.PI * 0.85,
    attackRange: 30,
    aggression: 0.75,
    staggerThreshold: 45,
    vulnerability: 1.0,
    leashRadius: 260,
    lootTableKey: 'hollow_thrall',
    xpReward: 25,
    attacks: [
      { id: 'bone_slash', kind: 'melee', damageMult: 1.0, windupMs: 320, recoveryMs: 420, cooldownMs: 1150, knockback: 95 }
    ]
  },
  cinder_hound_pack: {
    id: 'cinder_hound_pack',
    name: 'Cinder Hound',
    faction: 'corrupted_wildlife',
    role: 'melee',
    textureKey: 'enemy_hound',
    maxHealth: 38,
    stamina: 50,
    armor: 1,
    resistances: { physical: 0.0, fire: 0.35, arcane: -0.1 },
    damage: 13,
    moveSpeed: 128,
    detectRange: 210,
    hearingRange: 260,
    fovRad: Math.PI * 0.95,
    attackRange: 26,
    aggression: 0.9,
    staggerThreshold: 30,
    vulnerability: 1.1,
    leashRadius: 300,
    lootTableKey: 'cinder_hound',
    xpReward: 32,
    attacks: [
      { id: 'pounce_bite', kind: 'melee', damageMult: 1.0, windupMs: 250, recoveryMs: 340, cooldownMs: 900, knockback: 120 }
    ]
  },
  hollow_cultist_caster: {
    id: 'hollow_cultist_caster',
    name: 'Cinder Acolyte',
    faction: 'human_factions',
    role: 'magic',
    textureKey: 'enemy_thrall',
    maxHealth: 44,
    stamina: 45,
    armor: 2,
    resistances: { physical: 0.0, fire: 0.2, arcane: 0.25 },
    damage: 15,
    moveSpeed: 72,
    detectRange: 220,
    hearingRange: 190,
    fovRad: Math.PI * 0.8,
    attackRange: 135,
    aggression: 0.6,
    staggerThreshold: 32,
    vulnerability: 1.15,
    leashRadius: 250,
    lootTableKey: 'hollow_thrall',
    xpReward: 40,
    attacks: [
      { id: 'ember_bolt', kind: 'ranged_magic', damageMult: 1.0, windupMs: 420, recoveryMs: 520, cooldownMs: 1650, knockback: 70 }
    ]
  },
  ancient_sentinel: {
    id: 'ancient_sentinel',
    name: 'Kiln Sentinel',
    faction: 'ancient_guardians',
    role: 'support',
    textureKey: 'enemy_thrall',
    maxHealth: 95,
    stamina: 70,
    armor: 10,
    resistances: { physical: 0.25, fire: 0.3, arcane: 0.2 },
    damage: 16,
    moveSpeed: 64,
    detectRange: 190,
    hearingRange: 210,
    fovRad: Math.PI * 0.75,
    attackRange: 36,
    aggression: 0.65,
    staggerThreshold: 75,
    vulnerability: 0.85,
    leashRadius: 240,
    lootTableKey: 'hollow_thrall',
    xpReward: 55,
    attacks: [
      { id: 'ward_slam', kind: 'melee', damageMult: 1.0, windupMs: 450, recoveryMs: 550, cooldownMs: 1500, knockback: 185 }
    ]
  }
};

export const BOSS_DEFINITIONS = {
  hollow_warden_boss: {
    id: 'hollow_warden_boss',
    name: 'Vaelen, Ashen Sovereign',
    faction: 'hollow_creatures',
    role: 'boss',
    textureKey: 'enemy_thrall',
    maxHealth: 360,
    armor: 8,
    resistances: { physical: 0.15, fire: 0.2, arcane: 0.25 },
    baseDamage: 18,
    moveSpeed: 92,
    detectRange: 320,
    staggerThreshold: 110,
    lootTableKey: 'hollow_boss',
    xpReward: 220,
    corruptionOnDefeat: 15,
    phases: [
      {
        phase: 1,
        hpThresholdPct: 1.0,
        label: 'Ashen Vigil',
        speedMult: 1.0,
        damageMult: 1.0,
        vulnerabilityWindowMs: 650,
        attackIntervalMs: 1450,
        hazardIntervalMs: 4200,
        summonCount: 0,
        enraged: false
      },
      {
        phase: 2,
        hpThresholdPct: 0.55,
        label: 'Hollow Crown Awakened',
        speedMult: 1.22,
        damageMult: 1.25,
        vulnerabilityWindowMs: 520,
        attackIntervalMs: 1150,
        hazardIntervalMs: 3100,
        summonCount: 2,
        enraged: false
      },
      {
        phase: 3,
        hpThresholdPct: 0.25,
        label: 'Eclipse Frenzy',
        speedMult: 1.42,
        damageMult: 1.45,
        vulnerabilityWindowMs: 400,
        attackIntervalMs: 900,
        hazardIntervalMs: 2200,
        summonCount: 2,
        enraged: true
      }
    ]
  }
};