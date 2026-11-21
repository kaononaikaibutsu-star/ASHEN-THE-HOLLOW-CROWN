// src/data/items.js
export const ITEMS = {
  ashen_flask: {
    id: 'ashen_flask',
    name: 'Ashen Flask',
    type: 'consumable',
    category: 'consumable',
    rarity: 'common',
    stackLimit: 20,
    baseValue: 30,
    slot: null,
    unique: false,
    healAmount: 45,
    stats: { heal: 45 },
    description: 'Restores 45 health with lingering ash.'
  },
  hollow_shard: {
    id: 'hollow_shard',
    name: 'Hollow Shard',
    type: 'material',
    category: 'crafting_material',
    rarity: 'uncommon',
    stackLimit: 99,
    baseValue: 45,
    slot: null,
    unique: false,
    healAmount: 0,
    stats: {},
    description: 'A jagged remnant of a shattered crown.'
  }
};

export default ITEMS;