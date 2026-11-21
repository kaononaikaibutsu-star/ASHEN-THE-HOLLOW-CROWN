// src/systems/AbilitySystem.js
import Phaser from 'phaser';
import { findSkillById } from '../data/skillTreesData.js';
import { PROGRESSION_CONFIG } from '../data/progressionData.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export class AbilitySystem {
  constructor(gameState, progressionSystem) {
    this.gameState = gameState;
    this.progression = progressionSystem;
    this.cooldowns = new Map();
  }

  getCooldownRemaining(abilityId, now = Date.now()) {
    const until = this.cooldowns.get(abilityId) || 0;
    return Math.max(0, until - now);
  }

  activateSlot(slotIndex, worldScene, now = Date.now()) {
    const prog = this.progression.ensureProgressionShape();
    const abilityId = prog.equippedAbilities[slotIndex];
    if (!abilityId) return { ok: false, reason: 'empty_slot' };
    return this.activateById(abilityId, worldScene, now);
  }

  activateById(abilityId, worldScene, now = Date.now()) {
    const prog = this.progression.ensureProgressionShape();
    const st = this.gameState.getState();
    const player = worldScene?.player;
    if (!player || player.isDead()) return { ok: false, reason: 'player_unavailable' };

    const rem = this.getCooldownRemaining(abilityId, now);
    if (rem > 0) return { ok: false, reason: 'on_cooldown', remainingMs: rem };

    const found = findSkillById(abilityId);
    const crownTier = PROGRESSION_CONFIG.hollowCrown.thresholds.find((t) => t.abilityId === abilityId);

    let staminaCost = 15;
    let cooldownMs = 3000;
    let effectSpec = null;
    let rank = 1;

    if (found) {
      rank = prog.skillRanks[abilityId] || 0;
      if (rank <= 0) return { ok: false, reason: 'skill_not_unlocked' };
      effectSpec = found.skill.effect;
      staminaCost = effectSpec.staminaCost ?? 15;
      cooldownMs = effectSpec.cooldownMs ?? 3000;
    } else if (crownTier) {
      if (prog.corruption < crownTier.corruption) return { ok: false, reason: 'corruption_too_low' };
      staminaCost = crownTier.staminaCost ?? 20;
      cooldownMs = crownTier.cooldownMs ?? 5000;
      effectSpec = { type: 'crown_burst', abilityId: crownTier.abilityId, mult: crownTier.bonusDamageMult };
    } else {
      return { ok: false, reason: 'unknown_ability' };
    }

    if (st.player.stamina < staminaCost) return { ok: false, reason: 'low_stamina' };
    st.player.stamina -= staminaCost;
    this.cooldowns.set(abilityId, now + cooldownMs);

    const attrs = this.progression.getTotalAttributes();
    const enemies = worldScene.enemies || [];

    if (effectSpec.type === 'buff') {
      st.activeBuffs = st.activeBuffs || [];
      st.activeBuffs.push({
        effect: 'ability_buff',
        damageMult: effectSpec.damageMult || 1.2,
        speedMult: effectSpec.speedMult || 1.1,
        expiresAt: now + (effectSpec.durationMs || 5000)
      });
      worldScene.feedback?.spawnImpact(player.x, player.y, 0xff7b29, 1.2);
    } else if (effectSpec.type === 'dash_blink') {
      const dist = effectSpec.distance + (rank - 1) * 15;
      player.invulnUntil = Math.max(player.invulnUntil || 0, now + (effectSpec.invulnMs || 300));
      worldScene.feedback?.spawnDodgeGhost(player.x, player.y, player.texture.key, player.flipX);
      player.setPosition(
        player.x + Math.cos(player.facingAngle) * dist,
        player.y + Math.sin(player.facingAngle) * dist
      );
      worldScene.feedback?.spawnImpact(player.x, player.y, 0x9ab8d9, 1.0);
    } else if (effectSpec.type === 'drain_heal') {
      const healAmt = Math.round(
        ((effectSpec.baseHeal || 15) + (rank - 1) * (effectSpec.perRankHeal || 8)) *
          (1 + (attrs.faith - 10) * 0.05 + (attrs.arcane - 8) * 0.04)
      );
      st.player.health = Math.min(st.player.maxHealth, st.player.health + healAmt);
      worldScene.feedback?.spawnDamageNumber(player.x, player.y, `+${healAmt} HP`, false, '#63d471');
      for (const e of enemies) {
        if (e.active && !e.isDead && Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) <= (effectSpec.radius || 85)) {
          e.receivePlayerHit({ damage: Math.round(healAmt * 0.6), isCrit: false, knockback: 60, hitStunMs: 120, attackerX: player.x, attackerY: player.y }, now);
        }
      }
    } else if (effectSpec.type === 'debuff_zone') {
      for (const e of enemies) {
        if (e.active && !e.isDead && Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) <= (effectSpec.radius || 95)) {
          e.vulnerability = (e.vulnerability || 1) + (effectSpec.vulnBonus || 0.2);
          e.setTint(0xc06bff);
          worldScene.time.delayedCall(effectSpec.durationMs || 5000, () => {
            if (e.active && !e.isDead) {
              e.vulnerability = Math.max(0.5, (e.vulnerability || 1) - (effectSpec.vulnBonus || 0.2));
              e.clearTint();
            }
          });
        }
      }
      worldScene.feedback?.spawnImpact(player.x, player.y, 0xc06bff, 1.4);
    } else {
      // Offensive burst / bolt / crown ability
      const baseDmg = (effectSpec.basePower || 25) + (rank - 1) * (effectSpec.perRankPower || 10);
      const magicScale = 1 + Math.max(0, (attrs.intelligence - 10) * 0.05 + (attrs.arcane - 8) * 0.05);
      const strScale = 1 + Math.max(0, (attrs.strength - 10) * 0.04);
      const totalDmg = Math.round(baseDmg * Math.max(magicScale, strScale) * (effectSpec.mult || 1));
      const radius = effectSpec.radius || effectSpec.range || 70;

      for (const e of enemies) {
        if (e.active && !e.isDead && Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) <= radius) {
          e.receivePlayerHit({
            damage: totalDmg,
            isCrit: Boolean(effectSpec.forceCrit || crownTier),
            knockback: effectSpec.knockback || 140,
            hitStunMs: 180,
            attackerX: player.x,
            attackerY: player.y
          }, now);
        }
      }

      if (effectSpec.corruptionGain) {
        this.progression.addCorruption(effectSpec.corruptionGain, abilityId);
      }
      worldScene.feedback?.spawnImpact(
        player.x + Math.cos(player.facingAngle) * 24,
        player.y + Math.sin(player.facingAngle) * 24,
        crownTier ? 0xe63946 : 0x7ce8ff,
        1.35
      );
    }

    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, st.player);
    return { ok: true };
  }
}