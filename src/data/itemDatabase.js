// src/data/itemDatabase.js
import { WEAPON_CATEGORIES } from './weaponsData.js';
import { ITEMS } from './items.js';

export const CORE_ITEMS = {
  ashen_ore: {
    id: 'ashen_ore',
    name: 'Ashen Ore',
    description: 'Smelted cinder-iron used to reinforce weapons and armor.',
    category: 'crafting_material',
    rarity: 'common',
    icon: 'icon_ore',
    stackLimit: 99,
    baseValue: 20,
    slot: null,
    unique: false,
    stats: {}
  },
  hollow_core: {
    id: 'hollow_core',
    name: 'Hollow Core',
    description: 'Crystallized ash essence required for high-tier equipment upgrades.',
    category: 'crafting_material',
    rarity: 'rare',
    icon: 'icon_core',
    stackLimit: 50,
    baseValue: 110,
    slot: null,
    unique: false,
    stats: {}
  },
  tarnished_coin: {
    id: 'tarnished_coin',
    name: 'Tarnished Coin',
    description: 'Relic currency of the fallen crown, valued by merchants.',
    category: 'misc',
    rarity: 'common',
    icon: 'icon_coin',
    stackLimit: 99,
    baseValue: 24,
    slot: null,
    unique: false,
    stats: {}
  },
  hollow_crown_fragment: {
    id: 'hollow_crown_fragment',
    name: 'Hollow Crown Fragment',
    description: 'A jagged shard of the shattered sovereign circlet.',
    category: 'quest_item',
    rarity: 'legendary',
    icon: 'icon_crown_shard',
    stackLimit: 10,
    baseValue: 250,
    slot: null,
    unique: true,
    stats: {}
  },
  health_potion: {
    id: 'health_potion',
    name: 'Crimson Ash Draught',
    description: 'Restores vitality when consumed.',
    category: 'consumable',
    rarity: 'common',
    icon: 'icon_hp_potion',
    stackLimit: 20,
    baseValue: 30,
    slot: null,
    unique: false,
    stats: { heal: 50 }
  },
  stamina_potion: {
    id: 'stamina_potion',
    name: 'Cinderleaf Tincture',
    description: 'Replenishes stamina and steadies breathing.',
    category: 'consumable',
    rarity: 'common',
    icon: 'icon_stam_potion',
    stackLimit: 20,
    baseValue: 28,
    slot: null,
    unique: false,
    stats: { staminaRestore: 45 }
  },
  damage_tonic: {
    id: 'damage_tonic',
    name: 'Emberrage Tonic',
    description: 'Temporarily heightens strike lethality.',
    category: 'consumable',
    rarity: 'uncommon',
    icon: 'icon_dmg_tonic',
    stackLimit: 10,
    baseValue: 55,
    slot: null,
    unique: false,
    stats: { attackBonus: 6 }
  },
  defense_tonic: {
    id: 'defense_tonic',
    name: 'Ironbark Elixir',
    description: 'Hardens skin against incoming blows.',
    category: 'consumable',
    rarity: 'uncommon',
    icon: 'icon_def_tonic',
    stackLimit: 10,
    baseValue: 55,
    slot: null,
    unique: false,
    stats: { defenseBonus: 6 }
  },
  antidote_vial: {
    id: 'antidote_vial',
    name: 'Purging Ash Vial',
    description: 'Neutralizes blight and venomous afflictions.',
    category: 'consumable',
    rarity: 'common',
    icon: 'icon_antidote',
    stackLimit: 15,
    baseValue: 25,
    slot: null,
    unique: false,
    stats: { curePoison: true }
  },
  ashen_buckler: {
    id: 'ashen_buckler',
    name: 'Ashen Buckler',
    description: 'Light cinder-forged shield suited for quick deflections.',
    category: 'armor',
    rarity: 'common',
    icon: 'icon_buckler',
    stackLimit: 1,
    baseValue: 65,
    slot: 'offhand',
    unique: false,
    stats: { defense: 4 }
  },
  ash_buckler: {
    id: 'ash_buckler',
    name: 'Ash Buckler',
    description: 'Standard issue buckler tempered in kiln ash.',
    category: 'armor',
    rarity: 'common',
    icon: 'icon_buckler',
    stackLimit: 1,
    baseValue: 60,
    slot: 'offhand',
    unique: false,
    stats: { defense: 4 }
  },
  hollow_helm: {
    id: 'hollow_helm',
    name: 'Hollow Helm',
    description: 'Visored helm worn by fallen royal sentinels.',
    category: 'armor',
    rarity: 'uncommon',
    icon: 'icon_helm',
    stackLimit: 1,
    baseValue: 85,
    slot: 'head',
    unique: false,
    stats: { defense: 5, maxHp: 10 }
  },
  ashen_cuirass: {
    id: 'ashen_cuirass',
    name: 'Ashen Cuirass',
    description: 'Heavy blackened breastplate scarred by emberfire.',
    category: 'armor',
    rarity: 'rare',
    icon: 'icon_cuirass',
    stackLimit: 1,
    baseValue: 160,
    slot: 'chest',
    unique: false,
    stats: { defense: 11, maxHp: 20 }
  },
  cinder_gauntlets: {
    id: 'cinder_gauntlets',
    name: 'Cinder Gauntlets',
    description: 'Articulated iron gauntlets that steady heavy swings.',
    category: 'armor',
    rarity: 'uncommon',
    icon: 'icon_gauntlets',
    stackLimit: 1,
    baseValue: 75,
    slot: 'hands',
    unique: false,
    stats: { defense: 3, attack: 2 }
  },
  ash_greaves: {
    id: 'ash_greaves',
    name: 'Ash Greaves',
    description: 'Reinforced leg guards built for ash-choked terrain.',
    category: 'armor',
    rarity: 'common',
    icon: 'icon_greaves',
    stackLimit: 1,
    baseValue: 70,
    slot: 'legs',
    unique: false,
    stats: { defense: 4 }
  },
  wind_strider_boots: {
    id: 'wind_strider_boots',
    name: 'Wind-Strider Boots',
    description: 'Supple leather boots stitched with gale-thread.',
    category: 'armor',
    rarity: 'uncommon',
    icon: 'icon_boots',
    stackLimit: 1,
    baseValue: 95,
    slot: 'feet',
    unique: false,
    stats: { defense: 3, speed: 12 }
  },
  cursed_crown_blade: {
    id: 'cursed_crown_blade',
    name: 'Cursed Crown Blade',
    description: 'Sovereign greatsword humming with hollow malice.',
    category: 'weapon',
    rarity: 'legendary',
    icon: 'icon_cursed_blade',
    stackLimit: 1,
    baseValue: 320,
    slot: 'weapon',
    unique: true,
    stats: { attack: 28, critChance: 0.2 }
  },
  amulet_of_ash: {
    id: 'amulet_of_ash',
    name: 'Amulet of Ash',
    description: 'Charred medallion that bolsters resilience against the hollow.',
    category: 'accessory',
    rarity: 'rare',
    icon: 'icon_amulet',
    stackLimit: 1,
    baseValue: 180,
    slot: 'accessory',
    unique: true,
    stats: { maxHp: 30, defense: 5 }
  },
  ring_of_embers: {
    id: 'ring_of_embers',
    name: 'Ring of Embers',
    description: 'Smoldering signet that quickens stamina recovery.',
    category: 'accessory',
    rarity: 'rare',
    icon: 'icon_ring',
    stackLimit: 1,
    baseValue: 150,
    slot: 'accessory',
    unique: false,
    stats: { attack: 4, staminaRegen: 4 }
  }
};

export const GATHERING_ITEM_ADDITIONS = {
  briar_timber: {
    id: 'briar_timber',
    name: 'Briar Timber',
    description: 'Tough wood gathered from Thornwood groves.',
    category: 'crafting_material',
    rarity: 'common',
    icon: 'icon_wood',
    stackLimit: 99,
    baseValue: 16,
    slot: null,
    unique: false,
    stats: {}
  },
  cinderwort_leaf: {
    id: 'cinderwort_leaf',
    name: 'Cinderwort Leaf',
    description: 'Ash-dusted medicinal leaf used in alchemy and herbalism.',
    category: 'crafting_material',
    rarity: 'common',
    icon: 'icon_herb',
    stackLimit: 99,
    baseValue: 15,
    slot: null,
    unique: false,
    stats: {}
  },
  relic_fragment: {
    id: 'relic_fragment',
    name: 'Ancient Relic Fragment',
    description: 'Carved stone fragment holding pre-collapse resonance.',
    category: 'crafting_material',
    rarity: 'rare',
    icon: 'icon_relic',
    stackLimit: 50,
    baseValue: 85,
    slot: null,
    unique: false,
    stats: {}
  },
  tool_pickaxe: {
    id: 'tool_pickaxe',
    name: 'Ash-Iron Pickaxe',
    description: 'Increases ore and relic yield when mining.',
    category: 'misc',
    rarity: 'uncommon',
    icon: 'icon_pickaxe',
    stackLimit: 1,
    baseValue: 90,
    slot: null,
    unique: false,
    stats: {}
  }
};

const WEAPON_ENTRIES = Object.values(WEAPON_CATEGORIES || {}).reduce((acc, entry) => {
  if (entry && typeof entry === 'object') {
    const id = entry.id || entry.category;
    if (id) {
      acc[id] = {
        category: 'weapon',
        rarity: 'common',
        stackLimit: 1,
        baseValue: 75,
        slot: 'weapon',
        unique: false,
        stats: { attack: entry.baseDamage || 10 },
        ...entry,
        id
      };
    }
  }
  return acc;
}, {});

export const ITEM_DATABASE = {
  ...WEAPON_ENTRIES,
  ...CORE_ITEMS,
  ...GATHERING_ITEM_ADDITIONS,
  ...(ITEMS || {})
};

export function getItemDef(itemId) {
  if (!itemId || typeof itemId !== 'string') return null;
  return ITEM_DATABASE[itemId] || null;
}