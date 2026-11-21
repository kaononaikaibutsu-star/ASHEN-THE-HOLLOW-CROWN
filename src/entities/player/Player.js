// src/entities/player/Player.js
import Phaser from 'phaser';
import { PLAYER_BASE_STATS } from '../../data/gameData.js';
import { getWeaponDef } from '../../data/weaponsData.js';
import { GameState } from '../../core/GameState.js';
import { EVENTS, EventBus } from '../../core/EventBus.js';
import { COMBAT_STATES, ActiveHitbox, rollDamage } from '../../systems/CombatSystem.js';

const PARRY_WINDOW_MS = 190;

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, feedback) {
    super(scene, x, y, 'player_knight');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.feedback = feedback;
    this.setCollideWorldBounds(true);
    this.body.setSize(16, 16).setOffset(4, 10);
    this.body.setDrag(750, 750);
    this.radius = 12;
    this.facingAngle = 0;

    this.state = COMBAT_STATES.IDLE;
    this.comboIndex = 0;
    this.lastComboActionAt = 0;
    this.actionLockUntil = 0;
    this.nextDodgeAt = 0;
    this.nextSpecialAt = 0;
    this.parryUntil = 0;
    this.regenAllowedAt = 0;
    this.invulnUntil = 0;
    this.swingCounter = 0;
  }

  getWeapon() {
    const id = GameState.getState().player.equippedWeaponId;
    return getWeaponDef(id);
  }

  isDead() {
    return this.state === COMBAT_STATES.DEAD || GameState.getState().player.health <= 0;
  }

  canAct(now) {
    if (this.isDead()) return false;
    if (this.state === COMBAT_STATES.STUNNED) return false;
    return now >= this.actionLockUntil;
  }

  spendStamina(cost, now) {
    const p = GameState.getState().player;
    if (p.stamina < cost) return false;
    p.stamina = Math.max(0, p.stamina - cost);
    this.regenAllowedAt = now + PLAYER_BASE_STATS.staminaRegenDelayMs;
    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, p);
    return true;
  }

  tryLightAttack(moveVec, now, activeHitboxes) {
    if (!this.canAct(now)) return null;
    const weapon = this.getWeapon();
    const cost = Math.max(4, Math.round(weapon.staminaCost / weapon.attackSpeed));
    if (!this.spendStamina(cost, now)) return null;

    if (moveVec.x !== 0 || moveVec.y !== 0) {
      this.facingAngle = Math.atan2(moveVec.y, moveVec.x);
      this.setFlipX(moveVec.x < 0);
    }

    if (now - this.lastComboActionAt > weapon.comboWindowMs) {
      this.comboIndex = 0;
    }
    const stage = weapon.comboStages[this.comboIndex % weapon.comboStages.length];
    this.comboIndex = (this.comboIndex + 1) % weapon.comboStages.length;
    this.lastComboActionAt = now;

    const totalMs = Math.round((weapon.startupMs + weapon.activeMs + weapon.recoveryMs) / weapon.attackSpeed);
    this.state = COMBAT_STATES.ATTACKING;
    this.actionLockUntil = now + totalMs;

    // Slight forward step
    this.setVelocity(Math.cos(this.facingAngle) * 85, Math.sin(this.facingAngle) * 85);
    this.feedback?.spawnSwingTrail(
      this.x + Math.cos(this.facingAngle) * 14,
      this.y + Math.sin(this.facingAngle) * 14,
      this.facingAngle,
      weapon.range,
      false
    );

    const rolled = rollDamage({
      power: PLAYER_BASE_STATS.baseAttackPower,
      weapon,
      mult: stage.damageMult
    });

    const hb = new ActiveHitbox({
      swingId: `p_light_${++this.swingCounter}`,
      originX: this.x,
      originY: this.y,
      angle: this.facingAngle,
      reach: weapon.range,
      arcRad: weapon.arcRad,
      damage: rolled.amount,
      isCrit: rolled.isCrit,
      knockback: stage.knockback,
      hitStunMs: stage.hitStunMs,
      durationMs: Math.max(70, Math.round(weapon.activeMs / weapon.attackSpeed)),
      source: 'player'
    });
    activeHitboxes.push(hb);
    return hb;
  }

  tryHeavyAttack(moveVec, now, activeHitboxes) {
    if (!this.canAct(now)) return null;
    const weapon = this.getWeapon();
    if (!this.spendStamina(weapon.heavyStaminaCost, now)) return null;

    if (moveVec.x !== 0 || moveVec.y !== 0) {
      this.facingAngle = Math.atan2(moveVec.y, moveVec.x);
      this.setFlipX(moveVec.x < 0);
    }

    this.comboIndex = 0;
    const totalMs = Math.round((weapon.startupMs * 1.4 + weapon.activeMs * 1.2 + weapon.heavyRecoveryMs) / weapon.attackSpeed);
    this.state = COMBAT_STATES.HEAVY_ATTACKING;
    this.actionLockUntil = now + totalMs;

    this.setVelocity(Math.cos(this.facingAngle) * 125, Math.sin(this.facingAngle) * 125);
    this.feedback?.spawnSwingTrail(
      this.x + Math.cos(this.facingAngle) * 18,
      this.y + Math.sin(this.facingAngle) * 18,
      this.facingAngle,
      weapon.range * 1.15,
      true
    );

    const rolled = rollDamage({
      power: PLAYER_BASE_STATS.baseAttackPower,
      weapon,
      mult: weapon.heavyMultiplier
    });

    const hb = new ActiveHitbox({
      swingId: `p_heavy_${++this.swingCounter}`,
      originX: this.x,
      originY: this.y,
      angle: this.facingAngle,
      reach: weapon.range * 1.15,
      arcRad: Math.min(Math.PI * 1.1, weapon.arcRad * 1.25),
      damage: rolled.amount,
      isCrit: rolled.isCrit,
      knockback: 220,
      hitStunMs: 250,
      durationMs: Math.max(90, Math.round(weapon.activeMs * 1.2)),
      source: 'player'
    });
    activeHitboxes.push(hb);
    return hb;
  }

  trySpecialAbility(moveVec, now, activeHitboxes) {
    if (!this.canAct(now) || now < this.nextSpecialAt) return null;
    const weapon = this.getWeapon();
    const spec = weapon.specialAbility;
    if (!spec || !this.spendStamina(spec.staminaCost, now)) return null;

    if (moveVec.x !== 0 || moveVec.y !== 0) {
      this.facingAngle = Math.atan2(moveVec.y, moveVec.x);
      this.setFlipX(moveVec.x < 0);
    }

    this.nextSpecialAt = now + spec.cooldownMs;
    this.state = COMBAT_STATES.HEAVY_ATTACKING;
    this.actionLockUntil = now + 260;
    this.invulnUntil = Math.max(this.invulnUntil, now + 180);

    if (spec.mode === 'blink_strike' || spec.mode === 'pierce_line' || spec.mode === 'lunge_slash') {
      this.setVelocity(Math.cos(this.facingAngle) * 290, Math.sin(this.facingAngle) * 290);
      this.feedback?.spawnDodgeGhost(this.x, this.y, this.texture.key, this.flipX);
    }

    const rolled = rollDamage({
      power: PLAYER_BASE_STATS.baseAttackPower,
      weapon,
      mult: 1.65
    });

    const isRadial = spec.mode === 'radial_slam';
    const hb = new ActiveHitbox({
      swingId: `p_spec_${++this.swingCounter}`,
      originX: this.x,
      originY: this.y,
      angle: this.facingAngle,
      reach: isRadial ? weapon.range * 1.4 : weapon.range * 1.35,
      arcRad: isRadial ? Math.PI * 2 : Math.max(weapon.arcRad, Math.PI * 0.6),
      damage: rolled.amount,
      isCrit: true,
      knockback: 240,
      hitStunMs: 260,
      durationMs: 140,
      source: 'player'
    });
    activeHitboxes.push(hb);
    this.feedback?.spawnSwingTrail(this.x, this.y, this.facingAngle, hb.reach, true);
    return hb;
  }

  tryDodge(moveVec, now) {
    if (!this.canAct(now) || now < this.nextDodgeAt) return false;
    if (!this.spendStamina(PLAYER_BASE_STATS.dodgeStaminaCost, now)) return false;

    this.comboIndex = 0;
    this.state = COMBAT_STATES.DODGING;
    this.actionLockUntil = now + PLAYER_BASE_STATS.dodgeDurationMs;
    this.nextDodgeAt = now + PLAYER_BASE_STATS.dodgeCooldownMs;
    this.invulnUntil = now + PLAYER_BASE_STATS.invulnDurationMs;

    const dx = moveVec.x !== 0 || moveVec.y !== 0 ? moveVec.x : Math.cos(this.facingAngle);
    const dy = moveVec.x !== 0 || moveVec.y !== 0 ? moveVec.y : Math.sin(this.facingAngle);
    const norm = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / norm) * PLAYER_BASE_STATS.dodgeSpeed, (dy / norm) * PLAYER_BASE_STATS.dodgeSpeed);
    this.setAlpha(0.65);
    this.feedback?.spawnDodgeGhost(this.x, this.y, this.texture.key, this.flipX);

    this.scene.time.delayedCall(PLAYER_BASE_STATS.invulnDurationMs, () => {
      if (this.active && !this.isDead()) {
        this.setAlpha(1);
      }
    });
    return true;
  }

  receiveEnemyAttack(amount, attacker, now) {
    if (this.isDead()) return false;
    if (now < this.invulnUntil || this.state === COMBAT_STATES.DODGING) {
      return false;
    }

    // Parry check
    if (this.state === COMBAT_STATES.PARRYING || now <= this.parryUntil) {
      this.feedback?.spawnParryBurst(this.x, this.y);
      if (attacker && attacker.applyParriedStun) {
        attacker.applyParriedStun(now, this.x, this.y);
      }
      if (GameState.getState().settings.screenShake) {
        this.scene.cameras.main.shake(110, 0.007);
      }
      return false;
    }

    // Block check
    if (this.state === COMBAT_STATES.BLOCKING) {
      const blockCost = Math.max(6, Math.round(amount * 0.65));
      const p = GameState.getState().player;
      if (p.stamina >= blockCost) {
        p.stamina -= blockCost;
        this.regenAllowedAt = now + PLAYER_BASE_STATS.staminaRegenDelayMs;
        const blockedDmg = Math.max(1, Math.round(amount * 0.2));
        p.health = Math.max(0, p.health - blockedDmg);
        this.feedback?.spawnImpact(this.x, this.y, 0x8fb8e8, 0.8);
        this.feedback?.spawnDamageNumber(this.x, this.y, blockedDmg, false, '#9bc4f0');
        EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, p);
        if (p.health <= 0) this.enterDeathState();
        return true;
      }
      // Guard broken if stamina insufficient
      this.state = COMBAT_STATES.STUNNED;
      this.actionLockUntil = now + 380;
    }

    // Standard hit + interruption + knockback + hit stun
    const p = GameState.getState().player;
    const mitigated = Math.max(2, Math.round(amount - PLAYER_BASE_STATS.defense * 0.4));
    p.health = Math.max(0, p.health - mitigated);
    this.comboIndex = 0;
    this.state = p.health <= 0 ? COMBAT_STATES.DEAD : COMBAT_STATES.STUNNED;
    this.actionLockUntil = now + 220;
    this.invulnUntil = now + 260;

    if (attacker) {
      const ang = Math.atan2(this.y - attacker.y, this.x - attacker.x);
      this.setVelocity(Math.cos(ang) * 145, Math.sin(ang) * 145);
    }

    this.setTint(0xff5555);
    this.feedback?.spawnImpact(this.x, this.y, 0xff4d4d, 1);
    this.feedback?.spawnDamageNumber(this.x, this.y, mitigated, false);
    if (GameState.getState().settings.screenShake) {
      this.scene.cameras.main.shake(130, 0.009);
    }

    this.scene.time.delayedCall(220, () => {
      if (this.active && !this.isDead()) this.clearTint();
    });

    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, p);
    if (this.state === COMBAT_STATES.DEAD) {
      this.enterDeathState();
    }
    return true;
  }

  enterDeathState() {
    this.state = COMBAT_STATES.DEAD;
    this.setVelocity(0, 0);
    this.setTint(0x554b5e);
    EventBus.emit(EVENTS.PLAYER_DIED);
  }

  reviveAt(x, y) {
    const p = GameState.getState().player;
    p.health = p.maxHealth;
    p.stamina = p.maxStamina;
    this.state = COMBAT_STATES.IDLE;
    this.actionLockUntil = 0;
    this.invulnUntil = 0;
    this.comboIndex = 0;
    this.clearTint();
    this.setAlpha(1);
    this.setPosition(x, y);
    EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, p);
  }

  updateEntity(moveVec, isBlockingInput, deltaMs, now) {
    if (this.isDead()) {
      this.state = COMBAT_STATES.DEAD;
      this.setVelocity(0, 0);
      return;
    }

    const p = GameState.getState().player;
    const isActiveCombat =
      this.state === COMBAT_STATES.ATTACKING ||
      this.state === COMBAT_STATES.HEAVY_ATTACKING ||
      this.state === COMBAT_STATES.DODGING;

    if (now >= this.regenAllowedAt && !isActiveCombat && p.stamina < p.maxStamina) {
      p.stamina = Math.min(p.maxStamina, p.stamina + (PLAYER_BASE_STATS.staminaRegenPerSec * deltaMs) / 1000);
      EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, p);
    }

    if (now < this.actionLockUntil) {
      return;
    }

    if (isBlockingInput && p.stamina > 2) {
      if (this.state !== COMBAT_STATES.BLOCKING && this.state !== COMBAT_STATES.PARRYING) {
        this.parryUntil = now + PARRY_WINDOW_MS;
        this.state = COMBAT_STATES.PARRYING;
      } else if (now > this.parryUntil) {
        this.state = COMBAT_STATES.BLOCKING;
      }
      this.setVelocity(moveVec.x * PLAYER_BASE_STATS.moveSpeed * 0.45, moveVec.y * PLAYER_BASE_STATS.moveSpeed * 0.45);
      return;
    }

    this.parryUntil = 0;
    if (moveVec.x !== 0 || moveVec.y !== 0) {
      this.state = COMBAT_STATES.MOVING;
      this.facingAngle = Math.atan2(moveVec.y, moveVec.x);
      this.setVelocity(moveVec.x * PLAYER_BASE_STATS.moveSpeed, moveVec.y * PLAYER_BASE_STATS.moveSpeed);
      this.setFlipX(moveVec.x < 0);
    } else {
      this.state = COMBAT_STATES.IDLE;
    }
  }
}