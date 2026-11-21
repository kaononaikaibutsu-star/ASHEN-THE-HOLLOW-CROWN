// src/data/rarityData.js
export const RARITIES = {
  common: {
    id: 'common',
    label: 'Common',
    colorHex: '#c8cfd8',
    statMult: 1.0,
    valueMult: 1.0,
    dropWeight: 55
  },
  uncommon: {
    id: 'uncommon',
    label: 'Uncommon',
    colorHex: '#63d471',
    statMult: 1.18,
    valueMult: 1.6,
    dropWeight: 24
  },
  rare: {
    id: 'rare',
    label: 'Rare',
    colorHex: '#5ca4ff',
    statMult: 1.38,
    valueMult: 2.75,
    dropWeight: 12
  },
  epic: {
    id: 'epic',
    label: 'Epic',
    colorHex: '#c06bff',
    statMult: 1.62,
    valueMult: 4.5,
    dropWeight: 6
  },
  legendary: {
    id: 'legendary',
    label: 'Legendary',
    colorHex: '#f5a623',
    statMult: 1.95,
    valueMult: 8.0,
    dropWeight: 2.5
  },
  cursed: {
    id: 'cursed',
    label: 'Cursed',
    colorHex: '#e63946',
    statMult: 1.75,
    valueMult: 5.5,
    dropWeight: 0.5,
    // Meaningful cursed trade-off: high power/stats with a penalty
    cursedPenalty: {
      maxHealth: -20,
      elementalResistance: -0.15
    }
  }
};

export const EQUIPMENT_SLOTS = [
  'main_hand',
  'off_hand',
  'helmet',
  'chest_armor',
  'gloves',
  'leg_armor',
  'boots',
  'ring_1',
  'ring_2',
  'amulet'
];

export const ITEM_CATEGORIES = [
  'all',
  'weapon',
  'armor',
  'helmet',
  'gloves',
  'leg_armor',
  'boots',
  'ring',
  'amulet',
  'consumable',
  'crafting_material',
  'quest_item',
  'misc'
];