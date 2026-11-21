// src/systems/CombatSystem.js
import Phaser from 'phaser';
import { PLAYER_BASE_STATS } from '../data/gameData.js';
import { WEAPON_CATEGORIES } from '../data/weaponsData.js';
import { GameState } from '../core/GameState.js';
import { EventBus, EVENTS } from '../core/EventBus.js';

export const COMBAT_STATES = {
  IDLE: 'idle',
  MOVING: 'moving',
  ATTACKING: 'attacking',
  HEAVY_ATTACKING: 'heavy_attacking',
  DODGING: 'dodging',
  BLOCKING: 'blocking',
  PARRYING: 'parrying',
  STUNNED: 'stunned',
  DEAD: 'dead'
};

export function rollDamage({ power, weapon, mult = 1, defense = 0, vulnerability = 1, rng = Math.random }) {
  const isCrit = rng() < (weapon.critChance ?? 0.1);
  const critMult = isCrit ? (weapon.critMultiplier ?? 1.75) : 1;
  const mitigated = Math.max(2, (power + weapon.baseDamage) * mult * critMult * vulnerability - defense * 0.45);
  return {
    amount: Math.round(mitigated),
    isCrit
  };
}

export class ActiveHitbox {
  constructor({ swingId, originX, originY, angle, reach, arcRad, damage, isCrit, knockback, hitStunMs, durationMs, source }) {
    this.swingId = swingId;
    this.originX = originX;
    this.originY = originY;
    this.angle = angle;
    this.reach = reach;
    this.arcRad = arcRad;
    this.damage = damage;
    this.isCrit = isCrit;
    this.knockback = knockback;
    this.hitStunMs = hitStunMs;
    this.remainingMs = durationMs;
    this.source = source;
    this.hitEntityIds = new Set();
  }

  updatePosition(x, y, angle) {
    this.originX = x;
    this.originY = y;
    this.angle = angle;
  }

  hitsTarget(target) {
    if (!target || !target.active || target.isDead) return false;
    const id = target.enemyId || target.name || target;
    if (this.hitEntityIds.has(id)) return false;

    const dist = Phaser.Math.Distance.Between(this.originX, this.originY, target.x, target.y);
    if (dist > this.reach + (target.radius || 14)) return false;

    if (this.arcRad < Math.PI * 1.99) {
      const toTarget = Math.atan2(target.y - this.originY, target.x - this.originX);
      const diff = Math.abs(Phaser.Math.Angle.Wrap(toTarget - this.angle));
      if (diff > this.arcRad * 0.5) return false;
    }

    this.hitEntityIds.add(id);
    return true;
  }
}

export function getWeaponDef(weaponId) {
  return WEAPON_CATEGORIES[weaponId] || WEAPON_CATEGORIES.sword;
}

export function getBaseCombatStats() {
  return PLAYER_BASE_STATS;
}

export class CombatSystem {
  constructor(scene, player = null, enemies = []) {
    this.scene = scene;
    this.player = player;
    this.enemies = Array.isArray(enemies) ? enemies : [];
    this.state = COMBAT_STATES.IDLE;
    this.comboIndex = 0;
    this.lastAttackTime = 0;
    this.attackCooldownUntil = 0;
    this.specialCooldownUntil = 0;
    this.activeHitboxes = [];
  }

  setPlayer(player) {
    this.player = player;
  }

  setEnemies(enemies) {
    this.enemies = Array.isArray(enemies) ? enemies : [];
  }

  getEquippedWeapon() {
    const state = GameState.getState?.() || {};
    const weaponId =
      this.player?.equippedWeaponId ||
      state.player?.equippedWeaponId ||
      'sword';
    return getWeaponDef(weaponId);
  }

  performAttack(options = {}) {
    const now = this.scene?.time?.now ?? performance.now();
    if (now < this.attackCooldownUntil) {
      return { ok: false, reason: 'cooldown' };
    }

    const weapon = this.getEquippedWeapon();
    const isHeavy = Boolean(options.heavy);
    const stages = Array.isArray(weapon.comboStages) && weapon.comboStages.length > 0
      ? weapon.comboStages
      : [{ name: 'Strike', damageMult: 1.0, knockback: 90, hitStunMs: 140 }];

    if (now - this.lastAttackTime > (weapon.comboWindowMs || 520)) {
      this.comboIndex = 0;
    }

    const stage = stages[this.comboIndex % stages.length];
    this.comboIndex = (this.comboIndex + 1) % stages.length;
    this.lastAttackTime = now;

    const speedMult = weapon.attackSpeed || 1;
    const activeMs = Math.max(40, (weapon.activeMs || 110) / speedMult);
    const totalMs = ((weapon.startupMs || 70) + (weapon.activeMs || 110) + (weapon.recoveryMs || 170)) / speedMult;
    this.attackCooldownUntil = now + (isHeavy ? totalMs * 1.35 : totalMs);
    this.state = isHeavy ? COMBAT_STATES.HEAVY_ATTACKING : COMBAT_STATES.ATTACKING;

    const px = this.player?.x ?? this.player?.sprite?.x ?? 160;
    const py = this.player?.y ?? this.player?.sprite?.y ?? 160;
    const aimAngle = typeof options.angle === 'number'
      ? options.angle
      : (this.player?.facingAngle ?? 0);

    if (this.scene?.textures?.exists('slash_effect') && this.scene?.add) {
      const offsetDist = Math.min(weapon.range || 36, 36);
      const slash = this.scene.add.image(
        px + Math.cos(aimAngle) * offsetDist,
        py + Math.sin(aimAngle) * offsetDist,
        'slash_effect'
      );
      slash.setRotation(aimAngle);
      slash.setScale(isHeavy ? 1.35 : 1.0);
      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: slash,
          alpha: 0,
          duration: 140,
          onComplete: () => slash.destroy()
        });
      } else {
        slash.destroy();
      }
    }

    const state = GameState.getState?.() || {};
    const power = this.player?.attackDamage ?? state.player?.attackDamage ?? PLAYER_BASE_STATS.baseAttack ?? 12;
    const heavyMult = isHeavy ? (weapon.heavyMultiplier || 1.85) : 1.0;
    const rolled = rollDamage({
      power,
      weapon,
      mult: (stage.damageMult || 1.0) * heavyMult,
      defense: 0,
      vulnerability: 1
    });

    const reach = (weapon.range || 36) * (isHeavy ? 1.2 : 1.0);
    const hitbox = new ActiveHitbox({
      swingId: `swing_${now}_${this.comboIndex}`,
      originX: px,
      originY: py,
      angle: aimAngle,
      reach,
      arcRad: weapon.arcRad ?? Math.PI * 0.65,
      damage: rolled.amount,
      isCrit: rolled.isCrit,
      knockback: stage.knockback ?? 90,
      hitStunMs: stage.hitStunMs ?? 140,
      durationMs: activeMs,
      source: this.player
    });

    const hits = this.evaluateHitbox(hitbox);
    this.activeHitboxes.push(hitbox);

    if (EventBus && typeof EventBus.emit === 'function') {
      EventBus.emit(EVENTS?.COMBAT_ATTACK || 'combat:attack', {
        weaponId: weapon.id,
        stageName: stage.name,
        isHeavy,
        hits
      });
    }

    return { ok: true, stage: stage.name, hits };
  }

  evaluateHitbox(hitbox) {
    const hits = [];
    for (const enemy of this.enemies) {
      if (!enemy || enemy.isDead || enemy.hp <= 0) continue;
      if (!hitbox.hitsTarget(enemy)) continue;

      if (typeof enemy.takeDamage === 'function') {
        enemy.takeDamage(hitbox.damage, {
          angle: hitbox.angle,
          knockback: hitbox.knockback,
          hitStunMs: hitbox.hitStunMs,
          isCrit: hitbox.isCrit
        });
      } else if (typeof enemy.hp === 'number') {
        enemy.hp = Math.max(0, enemy.hp - hitbox.damage);
      }

      hits.push({
        enemy,
        damage: hitbox.damage,
        isCrit: hitbox.isCrit
      });
    }
    return hits;
  }

  performSpecial(options = {}) {
    const now = this.scene?.time?.now ?? performance.now();
    const weapon = this.getEquippedWeapon();
    const cd = weapon.specialAbility?.cooldownMs || 1500;
    if (now < this.specialCooldownUntil) {
      return { ok: false, reason: 'cooldown' };
    }
    this.specialCooldownUntil = now + cd;
    return this.performAttack({ ...options, heavy: true });
  }

  update(time = 0, delta = 16) {
    const now = this.scene?.time?.now ?? time ?? performance.now();
    if (now >= this.attackCooldownUntil && this.state !== COMBAT_STATES.DEAD) {
      this.state = COMBAT_STATES.IDLE;
    }

    const px = this.player?.x ?? this.player?.sprite?.x;
    const py = this.player?.y ?? this.player?.sprite?.y;
    const aimAngle = this.player?.facingAngle ?? 0;

    for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
      const hb = this.activeHitboxes[i];
      hb.remainingMs -= delta;
      if (typeof px === 'number' && typeof py === 'number') {
        hb.updatePosition(px, py, aimAngle);
        this.evaluateHitbox(hb);
      }
      if (hb.remainingMs <= 0) {
        this.activeHitboxes.splice(i, 1);
      }
    }
  }

  destroy() {
    this.activeHitboxes = [];
    this.player = null;
    this.enemies = [];
    this.scene = null;
  }
}

export default CombatSystem;