// src/data/craftingEconomyData.js
export const CRAFTING_DISCIPLINES = {
  blacksmithing: { id: 'blacksmithing', name: 'Blacksmithing', xpPerCraft: 25, yieldBonusPerRank: 0.08 },
  alchemy: { id: 'alchemy', name: 'Alchemy', xpPerCraft: 22, yieldBonusPerRank: 0.1 },
  herbalism: { id: 'herbalism', name: 'Herbalism', xpPerCraft: 18, yieldBonusPerRank: 0.12 },
  enchanting: { id: 'enchanting', name: 'Enchanting', xpPerCraft: 30, yieldBonusPerRank: 0.07 },
  ancient_relic_crafting: { id: 'ancient_relic_crafting', name: 'Ancient Relic Crafting', xpPerCraft: 40, yieldBonusPerRank: 0.05 }
};

export const CRAFTING_STATIONS = {
  blacksmith_forge: { id: 'blacksmith_forge', name: 'Blacksmith Forge', discipline: 'blacksmithing', safeOnly: false },
  alchemy_laboratory: { id: 'alchemy_laboratory', name: 'Alchemy Laboratory', discipline: 'alchemy', safeOnly: false },
  herbalist_table: { id: 'herbalist_table', name: 'Herbalist Table', discipline: 'herbalism', safeOnly: false },
  enchanting_altar: { id: 'enchanting_altar', name: 'Enchanting Altar', discipline: 'enchanting', safeOnly: false },
  ancient_crafting_altar: {
    id: 'ancient_crafting_altar',
    name: 'Ancient Relic Altar',
    discipline: 'ancient_relic_crafting',
    safeOnly: false,
    minCorruption: 10
  }
};

export const GATHERING_NODE_DEFS = {
  mining_deposit: {
    id: 'mining_deposit',
    label: 'Ash-Iron Vein',
    kind: 'mining',
    requiredToolItemId: null, // Optional tool boosts yield; works with bare hands/weapon
    recommendedToolItemId: 'tool_pickaxe',
    gatherDurationMs: 650,
    respawnMs: 25000,
    baseYields: [{ itemId: 'ashen_ore', minQty: 1, maxQty: 3, weight: 80 }],
    rareYields: [{ itemId: 'hollow_core', minQty: 1, maxQty: 1, chance: 0.22 }]
  },
  wild_tree_plant: {
    id: 'wild_tree_plant',
    label: 'Gnarled Briar Wood',
    kind: 'wood_plant',
    requiredToolItemId: null,
    recommendedToolItemId: 'tool_hatchet',
    gatherDurationMs: 550,
    respawnMs: 20000,
    baseYields: [{ itemId: 'briar_timber', minQty: 1, maxQty: 2, weight: 85 }],
    rareYields: [{ itemId: 'ashen_ore', minQty: 1, maxQty: 1, chance: 0.25 }]
  },
  medicinal_herb: {
    id: 'medicinal_herb',
    label: 'Cinderwort Herb',
    kind: 'herb',
    requiredToolItemId: null,
    recommendedToolItemId: 'tool_sickle',
    gatherDurationMs: 450,
    respawnMs: 18000,
    baseYields: [{ itemId: 'cinderwort_leaf', minQty: 1, maxQty: 3, weight: 85 }],
    rareYields: [{ itemId: 'tarnished_coin', minQty: 1, maxQty: 1, chance: 0.18 }]
  },
  monster_remains: {
    id: 'monster_remains',
    label: 'Hollow Remains',
    kind: 'remains',
    requiredToolItemId: null,
    gatherDurationMs: 500,
    respawnMs: 30000,
    baseYields: [{ itemId: 'tarnished_coin', minQty: 1, maxQty: 2, weight: 70 }],
    rareYields: [{ itemId: 'hollow_core', minQty: 1, maxQty: 1, chance: 0.2 }]
  },
  ancient_ruin_cache: {
    id: 'ancient_ruin_cache',
    label: 'Runed Reliquary Stone',
    kind: 'ruin',
    requiredToolItemId: null,
    gatherDurationMs: 750,
    respawnMs: 35000,
    baseYields: [{ itemId: 'relic_fragment', minQty: 1, maxQty: 2, weight: 75 }],
    rareYields: [{ itemId: 'hollow_core', minQty: 1, maxQty: 1, chance: 0.3 }]
  },
  hidden_resource_cache: {
    id: 'hidden_resource_cache',
    label: 'Buried Ash Cache',
    kind: 'hidden_cache',
    requiredToolItemId: null,
    gatherDurationMs: 600,
    respawnMs: 40000,
    baseYields: [
      { itemId: 'ashen_ore', minQty: 1, maxQty: 2, weight: 50 },
      { itemId: 'cinderwort_leaf', minQty: 1, maxQty: 2, weight: 50 }
    ],
    rareYields: [{ itemId: 'amulet_of_ash', minQty: 1, maxQty: 1, chance: 0.08 }]
  },
  region_special_node: {
    id: 'region_special_node',
    label: 'Sovereign Cinder Fissure',
    kind: 'region_special',
    requiredToolItemId: null,
    gatherDurationMs: 800,
    respawnMs: 30000,
    baseYields: [{ itemId: 'hollow_core', minQty: 1, maxQty: 2, weight: 80 }],
    rareYields: [{ itemId: 'relic_fragment', minQty: 1, maxQty: 1, chance: 0.35 }]
  }
};

export const REGION_GATHERING_NODES = {
  ashen_vale: [
    { id: 'gn_vale_mine_1', defId: 'mining_deposit', tileX: 12, tileY: 9 },
    { id: 'gn_vale_herb_1', defId: 'medicinal_herb', tileX: 8, tileY: 14 },
    { id: 'gn_vale_cache_1', defId: 'hidden_resource_cache', tileX: 10, tileY: 26 }
  ],
  thornwood: [
    { id: 'gn_thorn_wood_1', defId: 'wild_tree_plant', tileX: 15, tileY: 15 },
    { id: 'gn_thorn_herb_1', defId: 'medicinal_herb', tileX: 9, tileY: 11 },
    { id: 'gn_thorn_rem_1', defId: 'monster_remains', tileX: 28, tileY: 20 }
  ],
  the_deep_below: [
    { id: 'gn_deep_ruin_1', defId: 'ancient_ruin_cache', tileX: 19, tileY: 13 },
    { id: 'gn_deep_mine_1', defId: 'mining_deposit', tileX: 25, tileY: 18 },
    { id: 'gn_deep_spec_1', defId: 'region_special_node', tileX: 34, tileY: 26 }
  ],
  veyr_kingdom: [
    { id: 'gn_veyr_ruin_1', defId: 'ancient_ruin_cache', tileX: 18, tileY: 16 },
    { id: 'gn_veyr_mine_1', defId: 'mining_deposit', tileX: 29, tileY: 12 },
    { id: 'gn_veyr_cache_1', defId: 'hidden_resource_cache', tileX: 14, tileY: 7 }
  ],
  crown_of_silence: [
    { id: 'gn_crown_spec_1', defId: 'region_special_node', tileX: 22, tileY: 12 },
    { id: 'gn_crown_ruin_1', defId: 'ancient_ruin_cache', tileX: 10, tileY: 11 }
  ]
};

export const CRAFTING_RECIPES = {
  rcp_cinder_blade: {
    id: 'rcp_cinder_blade',
    name: 'Forge Ashen Greatsword',
    stationId: 'blacksmith_forge',
    discipline: 'blacksmithing',
    craftDurationMs: 500,
    attrReq: { strength: 10 },
    skillReq: null,
    unlockedByDefault: true,
    ingredients: [
      { itemId: 'ashen_ore', quantity: 2 },
      { itemId: 'tarnished_coin', quantity: 1 }
    ],
    output: { itemId: 'wpn_greatsword', quantity: 1, rarity: 'uncommon' }
  },
  rcp_health_potion: {
    id: 'rcp_health_potion',
    name: 'Brew Crimson Ember Vial',
    stationId: 'alchemy_laboratory',
    discipline: 'alchemy',
    craftDurationMs: 350,
    attrReq: {},
    skillReq: null,
    unlockedByDefault: true,
    ingredients: [{ itemId: 'cinderwort_leaf', quantity: 2 }],
    output: { itemId: 'health_potion', quantity: 2 }
  },
  rcp_herbal_tonic: {
    id: 'rcp_herbal_tonic',
    name: 'Distill Whetstone Elixir',
    stationId: 'herbalist_table',
    discipline: 'herbalism',
    craftDurationMs: 350,
    attrReq: {},
    skillReq: null,
    unlockedByDefault: true,
    ingredients: [
      { itemId: 'cinderwort_leaf', quantity: 1 },
      { itemId: 'briar_timber', quantity: 1 }
    ],
    output: { itemId: 'damage_tonic', quantity: 1 }
  },
  rcp_enchant_gauntlets: {
    id: 'rcp_enchant_gauntlets',
    name: 'Enchant Cinder Gauntlets',
    stationId: 'enchanting_altar',
    discipline: 'enchanting',
    craftDurationMs: 600,
    attrReq: { intelligence: 10 },
    skillReq: null,
    unlockedByDefault: false,
    unlockFlag: 'sensed_catacomb_seal',
    ingredients: [
      { itemId: 'hollow_core', quantity: 1 },
      { itemId: 'cinder_gauntlets', quantity: 1 }
    ],
    output: { itemId: 'cinder_gauntlets', quantity: 1, rarity: 'rare' }
  },
  rcp_crown_amulet: {
    id: 'rcp_crown_amulet',
    name: 'Craft Amulet of the Ash-Bound',
    stationId: 'ancient_crafting_altar',
    discipline: 'ancient_relic_crafting',
    craftDurationMs: 800,
    attrReq: { arcane: 10 },
    skillReq: null,
    unlockedByDefault: false,
    unlockQuestId: 'q_hidden_catacomb_relic',
    ingredients: [
      { itemId: 'relic_fragment', quantity: 2 },
      { itemId: 'hollow_core', quantity: 1 }
    ],
    output: { itemId: 'amulet_of_ash', quantity: 1, rarity: 'legendary' }
  }
};

export const MERCHANT_PROFILES = {
  vale_quartermaster: {
    id: 'vale_quartermaster',
    name: 'Courtyard Quartermaster',
    faction: 'human_factions',
    regionId: 'ashen_vale',
    specialization: 'general_supplies',
    unlockFlag: null,
    basePriceMult: 1.0,
    restockIntervalMs: 60000,
    stock: [
      { itemId: 'health_potion', baseQty: 6, limited: false },
      { itemId: 'stamina_potion', baseQty: 6, limited: false },
      { itemId: 'ashen_ore', baseQty: 5, limited: false },
      { itemId: 'hollow_helm', baseQty: 1, limited: true }
    ]
  },
  deep_relic_broker: {
    id: 'deep_relic_broker',
    name: 'Hollow Broker',
    faction: 'hollow_creatures',
    regionId: 'the_deep_below',
    specialization: 'relics_and_tonics',
    unlockFlag: null,
    basePriceMult: 1.15,
    restockIntervalMs: 90000,
    stock: [
      { itemId: 'hollow_core', baseQty: 3, limited: true },
      { itemId: 'damage_tonic', baseQty: 4, limited: false },
      { itemId: 'defense_tonic', baseQty: 4, limited: false },
      { itemId: 'ring_of_embers', baseQty: 1, limited: true }
    ]
  }
};

export const NPC_SERVICES = {
  warden_marcus: {
    npcId: 'warden_marcus',
    services: ['dialogue', 'quest_board', 'merchant_trade'],
    merchantProfileId: 'vale_quartermaster'
  },
  tinker_cora: {
    npcId: 'tinker_cora',
    services: ['dialogue', 'blacksmith_upgrade', 'crafting_station', 'codex_lore'],
    stationId: 'blacksmith_forge'
  }
};