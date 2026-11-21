// src/data/campaignReleaseData.js
export const DIFFICULTY_MODES = {
  pilgrim: {
    id: 'pilgrim',
    label: 'Story / Pilgrim',
    enemyDamageMult: 0.65,
    enemyHealthMult: 0.8,
    enemyAggressionMult: 0.85,
    telegraphBonusMs: 120,
    lootBonusMult: 1.1,
    xpMult: 1.0
  },
  ashen: {
    id: 'ashen',
    label: 'Standard / Ashen',
    enemyDamageMult: 1.0,
    enemyHealthMult: 1.0,
    enemyAggressionMult: 1.0,
    telegraphBonusMs: 0,
    lootBonusMult: 1.0,
    xpMult: 1.0
  },
  hollowed: {
    id: 'hollowed',
    label: 'Hardcore / Hollowed',
    enemyDamageMult: 1.45,
    enemyHealthMult: 1.35,
    enemyAggressionMult: 1.25,
    telegraphBonusMs: -70,
    lootBonusMult: 1.35,
    xpMult: 1.25
  }
};

export const CAMPAIGN_CHAPTERS = [
  {
    chapter: 1,
    id: 'ch1_the_forgotten',
    title: 'Chapter I — The Forgotten',
    regionId: 'ashen_vale',
    mainQuestId: 'q_ch1_awakening',
    sideQuestIds: ['q_ch1_ember_forge'],
    miniBossId: 'vale_shrine_warden',
    loreIds: ['lore_hollow_crown', 'lore_warden_marcus', 'lore_ashen_courtyard'],
    moralBranch: {
      lightFlag: 'ch1_spared_shrine',
      darkFlag: 'ch1_claimed_shrine_ash',
      corruptionDeltaDark: 10
    }
  },
  {
    chapter: 2,
    id: 'ch2_dying_woods',
    title: 'Chapter II — The Dying Woods',
    regionId: 'thornwood',
    mainQuestId: 'q_ch2_bLighted_grove',
    sideQuestIds: ['q_ch2_fallen_rangers'],
    miniBossId: 'thorn_maw_alpha',
    loreIds: ['lore_factions_ash', 'lore_first_eclipse'],
    moralBranch: {
      lightFlag: 'ch2_purified_briar',
      darkFlag: 'ch2_fed_briar_hunger',
      corruptionDeltaDark: 12
    }
  },
  {
    chapter: 3,
    id: 'ch3_beneath_silence',
    title: 'Chapter III — Beneath the Silence',
    regionId: 'the_deep_below',
    mainQuestId: 'q_ch3_origin_of_hollowing',
    sideQuestIds: ['q_ch3_sealed_reliquary'],
    miniBossId: 'hollow_warden_boss',
    loreIds: ['lore_catacomb_seal', 'lore_ancient_guardians'],
    moralBranch: {
      lightFlag: 'ch3_sealed_hollow_fissure',
      darkFlag: 'ch3_drank_abyss_fount',
      corruptionDeltaDark: 16
    }
  },
  {
    chapter: 4,
    id: 'ch4_broken_kingdom',
    title: 'Chapter IV — The Broken Kingdom',
    regionId: 'veyr_kingdom',
    mainQuestId: 'q_ch4_fractured_throne',
    sideQuestIds: ['q_ch4_citadel_truces'],
    miniBossId: 'veyr_regent_sentinel',
    loreIds: ['lore_veyr_schism'],
    moralBranch: {
      lightFlag: 'ch4_allied_regent',
      darkFlag: 'ch4_usurped_citadel',
      corruptionDeltaDark: 14
    }
  },
  {
    chapter: 5,
    id: 'ch5_hollow_crown',
    title: 'Chapter V — The Hollow Crown',
    regionId: 'crown_of_silence',
    mainQuestId: 'q_ch5_final_sovereign',
    sideQuestIds: ['q_ch5_silent_choir'],
    finalBossId: 'silence_sovereign_boss',
    loreIds: ['lore_crown_of_silence_truth'],
    moralBranch: {
      lightFlag: 'ch5_shattered_crown',
      darkFlag: 'ch5_ascended_hollow_king',
      corruptionDeltaDark: 20
    }
  }
];

export const FOUR_CAMPAIGN_ENDINGS = [
  {
    id: 'ending_eclipse_sovereign',
    title: 'Ending A — Sovereign of the Hollow Crown',
    epilogue: 'Wearing the completed crown in silence, you command the ash legions as an eternal monarch of ruin.',
    priority: 40,
    requires: { minCorruption: 70, flags: { ch5_ascended_hollow_king: true } }
  },
  {
    id: 'ending_dawn_of_veyr',
    title: 'Ending B — Kindling the Broken Throne',
    epilogue: 'With low corruption, surviving allies, and the crown unmade, dawn breaks over Veyr and Ashen Vale.',
    priority: 30,
    requires: { maxCorruption: 35, flags: { ch1_spared_shrine: true, ch4_allied_regent: true, ch5_shattered_crown: true } }
  },
  {
    id: 'ending_keeper_of_depths',
    title: 'Ending C — Keeper of the Deep Silence',
    epilogue: 'Having uncovered the true origin of the Hollowing, you seal the abyss alone beneath the ruins.',
    priority: 20,
    requires: { flags: { ch3_sealed_hollow_fissure: true, ch5_shattered_crown: true } }
  },
  {
    id: 'ending_ashen_pilgrim',
    title: 'Ending D — The Uncrowned Pilgrim',
    epilogue: 'Neither saint nor tyrant, you walk away from the shattered silence carrying every scar of your choices.',
    priority: 10,
    requires: {}
  }
];

export const NG_PLUS_RELICS = {
  ng1: {
    id: 'relic_ashen_diadem_ng1',
    name: 'Diadem of Rekindled Ash (NG+)',
    slot: 'amulet',
    rarity: 'legendary',
    stats: { maxHealth: 50, maxStamina: 30, attackDamage: 12, magicPower: 18 }
  },
  ng2: {
    id: 'relic_abyssal_crown_ng2',
    name: 'Crown of Endless Cycle (NG+2)',
    slot: 'helmet',
    rarity: 'cursed',
    stats: { maxHealth: 65, attackDamage: 22, magicPower: 26, critChance: 0.12 }
  }
};