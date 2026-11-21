// src/systems/StatCalculator.js
import { PLAYER_BASE_STATS } from '../data/gameData.js';
import { getItemDef } from '../data/itemDatabase.js';
import { RARITIES } from '../data/rarityData.js';

export function computeAggregatedStats(state, now = Date.now()) {
  const p = state.player || {};
  const equipped = state.equipment || {};
  const buffs = state.activeBuffs || [];

  const stats = {
    maxHealth: p.maxHealth ?? PLAYER_BASE_STATS.maxHealth,
    maxStamina: p.maxStamina ?? PLAYER_BASE_STATS.maxStamina,
    attackDamage: PLAYER_BASE_STATS.baseAttackPower,
    defense: PLAYER_BASE_STATS.defense,
    critChance: 0.1,
    critDamage: 1.75,
    moveSpeed: PLAYER_BASE_STATS.moveSpeed,
    magicPower: 10,
    elementalResistance: 0
  };

  for (const entry of Object.values(equipped)) {
    if (!entry || !entry.itemId) continue;
    const def = getItemDef(entry.itemId);
    if (!def) continue;

    const rarity = RARITIES[entry.rarity || def.rarity] || RARITIES.common;
    const upgradeLvl = Math.max(0, Number(entry.upgradeLevel || 0));
    const scale = rarity.statMult * (1 + upgradeLvl * 0.12);
    const s = def.stats || {};

    if (s.attackDamage) stats.attackDamage += s.attackDamage * scale;
    if (s.defense) stats.defense += s.defense * scale;
    if (s.maxHealth) stats.maxHealth += s.maxHealth * scale;
    if (s.maxStamina) stats.maxStamina += s.maxStamina * scale;
    if (s.moveSpeed) stats.moveSpeed += s.moveSpeed * (upgradeLvl > 0 ? 1 + upgradeLvl * 0.04 : 1);
    if (s.magicPower) stats.magicPower += s.magicPower * scale;
    if (s.critChance) stats.critChance += s.critChance * (1 + upgradeLvl * 0.05);
    if (s.critDamage) stats.critDamage += s.critDamage * (1 + upgradeLvl * 0.05);
    if (s.elementalResistance) stats.elementalResistance += s.elementalResistance;

    if (rarity.cursedPenalty) {
      if (rarity.cursedPenalty.maxHealth) stats.maxHealth += rarity.cursedPenalty.maxHealth;
      if (rarity.cursedPenalty.elementalResistance) {
        stats.elementalResistance += rarity.cursedPenalty.elementalResistance;
      }
    }
  }

  let dmgMult = 1;
  for (const b of buffs) {
    if (b.expiresAt > now) {
      if (b.effect === 'damage_buff') {
        dmgMult *= b.mult || 1.25;
        stats.magicPower += b.magicBonus || 0;
      } else if (b.effect === 'defense_buff') {
        stats.defense += b.defenseBonus || 0;
        stats.elementalResistance += b.resBonus || 0;
      }
    }
  }

  stats.attackDamage = Math.max(1, Math.round(stats.attackDamage * dmgMult));
  stats.defense = Math.max(0, Math.round(stats.defense));
  stats.maxHealth = Math.max(20, Math.round(stats.maxHealth));
  stats.maxStamina = Math.max(20, Math.round(stats.maxStamina));
  stats.moveSpeed = Math.max(60, Math.round(stats.moveSpeed));
  stats.magicPower = Math.max(0, Math.round(stats.magicPower));
  stats.critChance = Math.min(0.95, Math.max(0, Number(stats.critChance.toFixed(3))));
  stats.critDamage = Math.max(1.2, Number(stats.critDamage.toFixed(2)));
  stats.elementalResistance = Math.min(0.85, Math.max(-0.5, Number(stats.elementalResistance.toFixed(2))));

  return stats;
}