// src/systems/EnemyAIController.js
import Phaser from 'phaser';
import { FACTIONS } from '../data/factionsData.js';

export const AI_STATES = {
  IDLE: 'idle',
  PATROL: 'patrol',
  GUARD: 'guard',
  INVESTIGATE: 'investigate',
  ALERT: 'alert',
  CHASE: 'chase',
  ATTACK: 'attack',
  RECOVER: 'recover',
  RETREAT: 'retreat',
  SEARCH: 'search',
  STUNNED: 'stunned',
  FLEE: 'flee',
  DEAD: 'dead'
};

export class EnemyAIController {
  constructor(enemy, def, difficultyScale = 1.0) {
    this.enemy = enemy;
    this.def = def;
    this.difficultyScale = difficultyScale;
    this.state = AI_STATES.IDLE;
    this.stateUntil = 0;
    this.investigatePoint = null;
    this.lastKnownPlayerPos = null;
    this.staggerAccum = 0;
    this.statuses = new Map(); // statusType -> expiresAt
  }

  applyStatus(type, durationMs, now) {
    const fRes = FACTIONS[this.def.faction]?.statusResistances?.[type] ?? 0;
    const effectiveDuration = Math.round(durationMs * Math.max(0.1, 1 - fRes));
    if (effectiveDuration <= 0) return false;
    this.statuses.set(type, now + effectiveDuration);
    return true;
  }

  hasStatus(type, now) {
    const exp = this.statuses.get(type) || 0;
    if (exp <= now) {
      this.statuses.delete(type);
      return false;
    }
    return true;
  }

  hearSound(x, y, radius, now) {
    if (this.state === AI_STATES.DEAD || this.state === AI_STATES.STUNNED) return;
    const dist = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, x, y);
    const effHearing = Math.max(this.def.hearingRange || 180, radius);
    if (dist <= effHearing && this.state !== AI_STATES.CHASE && this.state !== AI_STATES.ATTACK) {
      this.investigatePoint = { x, y };
      this.state = AI_STATES.INVESTIGATE;
      this.stateUntil = now + 2600;
    }
  }

  hasLineOfSight(player, wallsGroup) {
    if (!wallsGroup || !wallsGroup.children) return true;
    const line = new Phaser.Geom.Line(this.enemy.x, this.enemy.y, player.x, player.y);
    for (const w of wallsGroup.children.getArray()) {
      if (!w.active) continue;
      if (Phaser.Geom.Intersects.LineToRectangle(line, w.getBounds())) {
        return false;
      }
    }
    return true;
  }

  registerStaggerDamage(staggerAmount, now) {
    this.staggerAccum += staggerAmount;
    const threshold = (this.def.staggerThreshold || 45) * this.difficultyScale;
    if (this.staggerAccum >= threshold) {
      this.staggerAccum = 0;
      this.state = AI_STATES.STUNNED;
      this.stateUntil = now + 750;
      this.enemy.clearTelegraph?.();
      this.enemy.pendingAttack = false;
      return true;
    }
    return false;
  }

  update(player, wallsGroup, allEnemies, now, delta) {
    const e = this.enemy;
    if (!e.active || e.hp <= 0) {
      this.state = AI_STATES.DEAD;
      return;
    }

    // Tick active statuses (poison/burn)
    if (this.hasStatus('poison', now) || this.hasStatus('burn', now)) {
      e.hp -= (4 * delta) / 1000;
      if (e.hp <= 0) {
        this.state = AI_STATES.DEAD;
        e.die();
        return;
      }
    }

    if (this.state === AI_STATES.STUNNED) {
      if (now < this.stateUntil) return;
      this.state = AI_STATES.CHASE;
    }

    const homeDist = Phaser.Math.Distance.Between(e.x, e.y, e.homePos.x, e.homePos.y);
    if (homeDist > (this.def.leashRadius || 260) && this.state !== AI_STATES.RETREAT) {
      this.state = AI_STATES.RETREAT;
      e.clearTelegraph?.();
      e.pendingAttack = false;
    }

    if (this.state === AI_STATES.RETREAT) {
      if (homeDist <= 12) {
        this.state = AI_STATES.GUARD;
        e.setVelocity(0, 0);
      } else {
        e.scene.physics.moveTo(e, e.homePos.x, e.homePos.y, this.def.moveSpeed * 0.9);
      }
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y);
    const canSee = distToPlayer <= (this.def.detectRange || 180) && this.hasLineOfSight(player, wallsGroup);

    if (canSee) {
      this.lastKnownPlayerPos = { x: player.x, y: player.y };
      if (this.state === AI_STATES.IDLE || this.state === AI_STATES.PATROL || this.state === AI_STATES.GUARD) {
        this.state = AI_STATES.ALERT;
        this.stateUntil = now + 220;
      }
    }

    if (this.state === AI_STATES.ALERT) {
      e.setVelocity(0, 0);
      if (now >= this.stateUntil) {
        this.state = AI_STATES.CHASE;
      }
      return;
    }

    if (this.state === AI_STATES.INVESTIGATE && this.investigatePoint) {
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.investigatePoint.x, this.investigatePoint.y);
      if (d < 12 || now >= this.stateUntil) {
        this.state = AI_STATES.SEARCH;
        this.stateUntil = now + 1800;
        e.setVelocity(0, 0);
      } else {
        e.scene.physics.moveTo(e, this.investigatePoint.x, this.investigatePoint.y, this.def.moveSpeed * 0.7);
      }
      return;
    }

    if (this.state === AI_STATES.SEARCH) {
      e.setVelocity(0, 0);
      if (now >= this.stateUntil) {
        this.state = AI_STATES.PATROL;
      }
      return;
    }

    // Low HP flee check for skittish/low-aggression roles
    if (e.hp / e.maxHp < 0.22 && (this.def.aggression || 0.7) < 0.65 && this.def.role !== 'boss') {
      this.state = AI_STATES.FLEE;
      const awayAng = Math.atan2(e.y - player.y, e.x - player.x);
      e.setVelocity(Math.cos(awayAng) * this.def.moveSpeed, Math.sin(awayAng) * this.def.moveSpeed);
      return;
    }

    if (canSee) {
      const atkRange = this.def.attackRange || 30;
      if (distToPlayer <= atkRange && now >= e.nextAttackAt) {
        this.state = AI_STATES.ATTACK;
        e.triggerTelegraphedAttack(player, now);
        this.stateUntil = now + 450;
        return;
      }

      if (now < this.stateUntil && this.state === AI_STATES.RECOVER) {
        e.setVelocity(0, 0);
        return;
      }

      this.state = AI_STATES.CHASE;
      // Basic group flanking offset
      const allyIdx = (allEnemies || []).filter((other) => other.active && !other.isDead).indexOf(e);
      const flankAngle = allyIdx > 0 ? ((allyIdx % 2 === 0 ? 1 : -1) * 0.35) : 0;
      const baseAngle = Math.atan2(player.y - e.y, player.x - e.x) + flankAngle;
      const spd = this.def.moveSpeed * this.difficultyScale;
      e.setVelocity(Math.cos(baseAngle) * spd, Math.sin(baseAngle) * spd);
      e.setFlipX(player.x < e.x);
      return;
    }

    if (this.lastKnownPlayerPos && this.state === AI_STATES.CHASE) {
      this.investigatePoint = { ...this.lastKnownPlayerPos };
      this.lastKnownPlayerPos = null;
      this.state = AI_STATES.INVESTIGATE;
      this.stateUntil = now + 2200;
      return;
    }

    // Default patrol / guard / idle
    this.state = this.def.role === 'support' ? AI_STATES.GUARD : AI_STATES.PATROL;
    const drift = Math.sin(now * 0.001 + (e.seedOffset || 0)) * 22;
    const tx = e.homePos.x + drift;
    const ty = e.homePos.y;
    if (Phaser.Math.Distance.Between(e.x, e.y, tx, ty) > 6) {
      e.scene.physics.moveTo(e, tx, ty, this.def.moveSpeed * 0.35);
    } else {
      e.setVelocity(0, 0);
    }
  }
}