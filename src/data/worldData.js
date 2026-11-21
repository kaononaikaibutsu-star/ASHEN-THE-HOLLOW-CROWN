// src/data/worldData.js
export const WORLD_REGIONS = {
  ashen_vale: {
    id: 'ashen_vale',
    name: 'Ashen Vale',
    faction: 'human_factions',
    isSafeHub: true,
    tileSize: 32,
    widthTiles: 44,
    heightTiles: 34,
    seed: 11001,
    lighting: { ambientColor: 0x3b3347, ambientAlpha: 0.25 },
    defaultWeather: 'ash_fall',
    ambienceKey: 'amb_vale_wind',
    musicKey: 'bgm_ashen_vale',
    subareas: [
      { id: 'vale_hearth_sanctum', name: 'Hearthstone Sanctuary', type: 'settlement', x: 5, y: 5, radius: 96, safeZone: true },
      { id: 'vale_ash_road', name: 'Cinder Path', type: 'wilderness', x: 18, y: 12, radius: 140, safeZone: false },
      { id: 'vale_sunken_crypt', name: 'Sunken Crypt Entrance', type: 'dungeon', x: 32, y: 10, radius: 90, safeZone: false },
      { id: 'vale_cliff_alcove', name: 'Weeping Cliff Alcove', type: 'hidden', x: 10, y: 27, radius: 75, safeZone: false },
      { id: 'vale_courtyard_ring', name: 'Ash-Scarred Ring', type: 'boss_arena', x: 34, y: 25, radius: 120, safeZone: false }
    ],
    npcs: ['warden_marcus', 'tinker_cora'],
    enemyPool: ['skeleton_skirmisher', 'cinder_hound_pack'],
    enemyCount: 6,
    resources: ['ashen_ore', 'health_potion'],
    landmarks: [
      { id: 'lm_vale_hearth', name: 'Hearthstone Lantern', kind: 'settlement', tileX: 5, tileY: 5 },
      { id: 'lm_vale_crypt_gate', name: 'Crypt Gate', kind: 'dungeon', tileX: 32, tileY: 10 }
    ],
    checkpoints: [{ id: 'cp_vale_main', label: 'Vale Wayshrine', tileX: 6, tileY: 6 }],
    chests: [
      { id: 'chest_vale_1', tileX: 11, tileY: 27, lootTableKey: 'treasure_chest', secret: true }
    ],
    breakableProps: [
      { id: 'brk_vale_1', tileX: 15, tileY: 11, dropItemId: 'ashen_ore', dropQty: 1 }
    ],
    switchesAndDoors: [],
    exits: [
      {
        id: 'exit_vale_to_thornwood',
        label: 'North Ridge to Thornwood',
        tileX: 22,
        tileY: 1,
        targetRegionId: 'thornwood',
        targetTileX: 22,
        targetTileY: 31,
        transitionType: 'region'
      },
      {
        id: 'exit_vale_to_deep_below',
        label: 'Descend into The Deep Below',
        tileX: 32,
        tileY: 10,
        targetRegionId: 'the_deep_below',
        targetTileX: 4,
        targetTileY: 5,
        transitionType: 'dungeon'
      }
    ]
  },

  thornwood: {
    id: 'thornwood',
    name: 'Thornwood',
    faction: 'corrupted_wildlife',
    isSafeHub: false,
    tileSize: 32,
    widthTiles: 44,
    heightTiles: 34,
    seed: 22002,
    lighting: { ambientColor: 0x1d2b24, ambientAlpha: 0.42 },
    defaultWeather: 'mist',
    ambienceKey: 'amb_thornwood_mist',
    musicKey: 'bgm_thornwood',
    subareas: [
      { id: 'thorn_camp', name: 'Briar Camp', type: 'settlement', x: 22, y: 29, radius: 85, safeZone: true },
      { id: 'thorn_bramble_wilds', name: 'Gnarled Bramble', type: 'wilderness', x: 16, y: 18, radius: 160, safeZone: false },
      { id: 'thorn_root_vault', name: 'Root-Bound Vault', type: 'dungeon', x: 35, y: 8, radius: 95, safeZone: false },
      { id: 'thorn_hollow_glade', name: 'Whispering Glade', type: 'hidden', x: 7, y: 9, radius: 80, safeZone: false },
      { id: 'thorn_maw_clearing', name: 'Maw Clearing', type: 'boss_arena', x: 33, y: 24, radius: 120, safeZone: false }
    ],
    npcs: [],
    enemyPool: ['cinder_hound_pack', 'skeleton_skirmisher'],
    enemyCount: 7,
    resources: ['ashen_ore', 'stamina_potion'],
    landmarks: [
      { id: 'lm_thorn_glade', name: 'Whispering Glade', kind: 'landmark', tileX: 7, tileY: 9 },
      { id: 'lm_thorn_vault', name: 'Root-Bound Vault', kind: 'dungeon', tileX: 35, tileY: 8 }
    ],
    checkpoints: [{ id: 'cp_thorn_camp', label: 'Briar Brazier', tileX: 22, tileY: 28 }],
    chests: [
      { id: 'chest_thorn_1', tileX: 7, tileY: 9, lootTableKey: 'treasure_chest', secret: true }
    ],
    breakableProps: [
      { id: 'brk_thorn_1', tileX: 19, tileY: 16, dropItemId: 'stamina_potion', dropQty: 1 }
    ],
    switchesAndDoors: [],
    exits: [
      {
        id: 'exit_thorn_to_vale',
        label: 'South Path to Ashen Vale',
        tileX: 22,
        tileY: 32,
        targetRegionId: 'ashen_vale',
        targetTileX: 22,
        targetTileY: 2,
        transitionType: 'region'
      },
      {
        id: 'exit_thorn_to_veyr',
        label: 'East Causeway to Veyr Kingdom',
        tileX: 42,
        tileY: 17,
        targetRegionId: 'veyr_kingdom',
        targetTileX: 2,
        targetTileY: 17,
        transitionType: 'region'
      }
    ]
  },

  the_deep_below: {
    id: 'the_deep_below',
    name: 'The Deep Below',
    faction: 'hollow_creatures',
    isSafeHub: false,
    tileSize: 32,
    widthTiles: 46,
    heightTiles: 36,
    seed: 33003,
    lighting: { ambientColor: 0x160f24, ambientAlpha: 0.55 },
    defaultWeather: 'cinder_rain',
    ambienceKey: 'amb_deep_echo',
    musicKey: 'bgm_deep_below',
    subareas: [
      { id: 'deep_entry_landing', name: 'Abyssal Landing', type: 'settlement', x: 4, y: 5, radius: 80, safeZone: true },
      { id: 'deep_catacomb_tunnels', name: 'Flooded Catacombs', type: 'dungeon', x: 18, y: 14, radius: 160, safeZone: false },
      { id: 'deep_sanctum_vault', name: 'Sealed Reliquary', type: 'dungeon', x: 32, y: 12, radius: 100, safeZone: false },
      { id: 'deep_secret_chasm', name: 'Sunken Ossuary', type: 'hidden', x: 10, y: 29, radius: 85, safeZone: false },
      { id: 'deep_sovereign_pit', name: 'Sovereign\'s Pit', type: 'boss_arena', x: 36, y: 27, radius: 135, safeZone: false }
    ],
    npcs: [],
    enemyPool: ['skeleton_skirmisher', 'hollow_cultist_caster', 'cinder_hound_pack'],
    enemyCount: 8,
    resources: ['hollow_core', 'ashen_ore'],
    landmarks: [
      { id: 'lm_deep_reliquary', name: 'Sealed Reliquary', kind: 'dungeon', tileX: 32, tileY: 12 },
      { id: 'lm_deep_pit', name: 'Sovereign\'s Pit', kind: 'boss_arena', tileX: 36, tileY: 27 }
    ],
    checkpoints: [{ id: 'cp_deep_landing', label: 'Abyssal Lantern', tileX: 5, tileY: 5 }],
    chests: [
      { id: 'chest_deep_1', tileX: 33, tileY: 12, lootTableKey: 'treasure_chest', secret: false },
      { id: 'chest_deep_secret', tileX: 10, tileY: 29, lootTableKey: 'hollow_boss', secret: true }
    ],
    breakableProps: [
      { id: 'brk_deep_1', tileX: 16, tileY: 14, dropItemId: 'hollow_core', dropQty: 1 }
    ],
    switchesAndDoors: [
      {
        id: 'sw_deep_gate_1',
        tileX: 24,
        tileY: 12,
        unlocksDoorId: 'door_deep_sanctum',
        hazardZone: { tileX: 20, tileY: 14, radiusPx: 36, damage: 10 }
      }
    ],
    doors: [
      { id: 'door_deep_sanctum', tileX: 28, tileY: 12, lockedBySwitchId: 'sw_deep_gate_1', shortcutTo: { tileX: 5, tileY: 5 } }
    ],
    bossId: 'hollow_warden_boss',
    exits: [
      {
        id: 'exit_deep_to_vale',
        label: 'Ascend to Ashen Vale',
        tileX: 4,
        tileY: 4,
        targetRegionId: 'ashen_vale',
        targetTileX: 32,
        targetTileY: 11,
        transitionType: 'dungeon_exit'
      },
      {
        id: 'exit_deep_to_crown',
        label: 'Crown Stairway',
        tileX: 44,
        tileY: 18,
        targetRegionId: 'crown_of_silence',
        targetTileX: 3,
        targetTileY: 17,
        transitionType: 'region'
      }
    ]
  },

  veyr_kingdom: {
    id: 'veyr_kingdom',
    name: 'Veyr Kingdom',
    faction: 'ancient_guardians',
    isSafeHub: false,
    tileSize: 32,
    widthTiles: 44,
    heightTiles: 34,
    seed: 44004,
    lighting: { ambientColor: 0x2f2836, ambientAlpha: 0.32 },
    defaultWeather: 'clear',
    ambienceKey: 'amb_veyr_ruins',
    musicKey: 'bgm_veyr_kingdom',
    subareas: [
      { id: 'veyr_gate_ward', name: 'Shattered Gatehouse', type: 'settlement', x: 4, y: 17, radius: 90, safeZone: true },
      { id: 'veyr_avenue', name: 'Royal Ash Avenue', type: 'wilderness', x: 20, y: 17, radius: 150, safeZone: false },
      { id: 'veyr_citadel_vault', name: 'Guardian Vault', type: 'dungeon', x: 34, y: 9, radius: 95, safeZone: false },
      { id: 'veyr_hidden_scriptorium', name: 'Hidden Scriptorium', type: 'hidden', x: 14, y: 6, radius: 75, safeZone: false },
      { id: 'veyr_throne_court', name: 'Sunken Throne Court', type: 'boss_arena', x: 35, y: 25, radius: 120, safeZone: false }
    ],
    npcs: [],
    enemyPool: ['ancient_sentinel', 'hollow_cultist_caster'],
    enemyCount: 7,
    resources: ['hollow_core', 'damage_tonic'],
    landmarks: [
      { id: 'lm_veyr_avenue', name: 'Royal Ash Avenue', kind: 'landmark', tileX: 20, tileY: 17 },
      { id: 'lm_veyr_vault', name: 'Guardian Vault', kind: 'dungeon', tileX: 34, tileY: 9 }
    ],
    checkpoints: [{ id: 'cp_veyr_gate', label: 'Gatehouse Hearth', tileX: 5, tileY: 17 }],
    chests: [
      { id: 'chest_veyr_1', tileX: 14, tileY: 6, lootTableKey: 'treasure_chest', secret: true }
    ],
    breakableProps: [],
    switchesAndDoors: [],
    exits: [
      {
        id: 'exit_veyr_to_thornwood',
        label: 'West Causeway to Thornwood',
        tileX: 1,
        tileY: 17,
        targetRegionId: 'thornwood',
        targetTileX: 41,
        targetTileY: 17,
        transitionType: 'region'
      },
      {
        id: 'exit_veyr_to_crown',
        label: 'Summit Bridge to Crown of Silence',
        tileX: 22,
        tileY: 1,
        targetRegionId: 'crown_of_silence',
        targetTileX: 22,
        targetTileY: 31,
        transitionType: 'region'
      }
    ]
  },

  crown_of_silence: {
    id: 'crown_of_silence',
    name: 'Crown of Silence',
    faction: 'hollow_creatures',
    isSafeHub: false,
    tileSize: 32,
    widthTiles: 44,
    heightTiles: 34,
    seed: 55005,
    lighting: { ambientColor: 0x12091c, ambientAlpha: 0.62 },
    defaultWeather: 'ash_fall',
    ambienceKey: 'amb_crown_void',
    musicKey: 'bgm_crown_of_silence',
    subareas: [
      { id: 'crown_threshold', name: 'Silent Threshold', type: 'settlement', x: 22, y: 30, radius: 80, safeZone: true },
      { id: 'crown_spire_approach', name: 'Obsidian Causeway', type: 'wilderness', x: 22, y: 18, radius: 140, safeZone: false },
      { id: 'crown_sanctum', name: 'Altar of Silence', type: 'boss_arena', x: 22, y: 8, radius: 130, safeZone: false },
      { id: 'crown_secret_shrine', name: 'Whispering Shrine', type: 'hidden', x: 8, y: 10, radius: 75, safeZone: false }
    ],
    npcs: [],
    enemyPool: ['ancient_sentinel', 'hollow_cultist_caster', 'cinder_hound_pack'],
    enemyCount: 8,
    resources: ['hollow_core', 'defense_tonic'],
    landmarks: [
      { id: 'lm_crown_altar', name: 'Altar of Silence', kind: 'boss_arena', tileX: 22, tileY: 8 }
    ],
    checkpoints: [{ id: 'cp_crown_threshold', label: 'Threshold Brazier', tileX: 22, tileY: 29 }],
    chests: [
      { id: 'chest_crown_1', tileX: 8, tileY: 10, lootTableKey: 'hollow_boss', secret: true }
    ],
    breakableProps: [],
    switchesAndDoors: [],
    exits: [
      {
        id: 'exit_crown_to_veyr',
        label: 'South Bridge to Veyr Kingdom',
        tileX: 22,
        tileY: 32,
        targetRegionId: 'veyr_kingdom',
        targetTileX: 22,
        targetTileY: 2,
        transitionType: 'region'
      }
    ]
  }
};

export const WORLD_REGION_LIST = Object.values(WORLD_REGIONS);