// src/data/factionsData.js
export const FACTIONS = {
  undead: {
    id: 'undead',
    name: 'Undead',
    hostileToPlayer: true,
    allies: ['undead', 'hollow_creatures'],
    rivals: ['ancient_guardians', 'human_factions'],
    statusResistances: { poison: 0.75, bleed: 1.0, burn: 0.1, stun: 0.25 }
  },
  corrupted_wildlife: {
    id: 'corrupted_wildlife',
    name: 'Corrupted Wildlife',
    hostileToPlayer: true,
    allies: ['corrupted_wildlife', 'hollow_creatures'],
    rivals: ['ancient_guardians'],
    statusResistances: { poison: 0.35, bleed: 0.1, burn: 0.0, stun: 0.15 }
  },
  hollow_creatures: {
    id: 'hollow_creatures',
    name: 'Hollow Creatures',
    hostileToPlayer: true,
    allies: ['hollow_creatures', 'undead', 'corrupted_wildlife'],
    rivals: ['ancient_guardians'],
    statusResistances: { poison: 0.5, bleed: 0.5, burn: 0.2, stun: 0.35 }
  },
  ancient_guardians: {
    id: 'ancient_guardians',
    name: 'Ancient Guardians',
    hostileToPlayer: true, // Hostile unless player holds low corruption/seal in future hooks
    allies: ['ancient_guardians'],
    rivals: ['undead', 'hollow_creatures', 'corrupted_wildlife'],
    statusResistances: { poison: 0.85, bleed: 0.85, burn: 0.4, stun: 0.55 }
  },
  human_factions: {
    id: 'human_factions',
    name: 'Corrupted Cult & Soldiers',
    hostileToPlayer: true,
    allies: ['human_factions'],
    rivals: ['hollow_creatures'],
    statusResistances: { poison: 0.15, bleed: 0.1, burn: 0.1, stun: 0.1 }
  }
};

export function areFactionsAllied(factionA, factionB) {
  if (!factionA || !factionB) return false;
  if (factionA === factionB) return true;
  return Boolean(FACTIONS[factionA]?.allies?.includes(factionB));
}