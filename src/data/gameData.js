// src/data/gameData.js
import { GAME_CONFIG, TILE_SIZE } from '../core/GameConfig.js';

export const PLAYER_BASE_STATS = {
  maxHp: 100,
  hp: 100,
  maxStamina: 100,
  stamina: 100,
  staminaRegenPerSec: 22,
  staminaRegenDelayMs: 650,
  moveSpeed: 155,
  sprintMultiplier: 1.45,
  dodgeSpeed: 310,
  dodgeDurationMs: 180,
  dodgeCooldownMs: 550,
  invulnDurationMs: 220,
  baseAttack: 12,
  baseDefense: 4,
  critChance: 0.1,
  critMultiplier: 1.65,
  defaultWeaponId: 'sword'
};

export { GAME_CONFIG, TILE_SIZE };
export default {
  PLAYER_BASE_STATS,
  GAME_CONFIG,
  TILE_SIZE
};