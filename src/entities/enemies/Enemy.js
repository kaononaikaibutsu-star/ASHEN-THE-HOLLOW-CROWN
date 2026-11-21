// src/entities/enemies/Enemy.js
import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config, id, feedback) {
    super(scene, x, y, config.textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.feedback = feedback;
    this.enemyId = id;
    this.config = config;
    this.hp = config.maxHealth;
    this.vulnerability = config.vulnerability ?? 1.0;
    this.isDead = false;
    this.radius = 13;
    this.homePos = { x, y };

    this.stunnedUntil = 0;
    this.nextAttackAt = 0;
    this.windupUntil = 0;
    this.pendingAttack = false;
    this.telegraphMarker = null;

    this.setCollideWorldBounds(true);
    this.body.setDrag(650, 650);
  }

  receivePlayerHit({ damage, isCrit, knockback, hitStunMs, attackerX, attackerY }, now) {
    if (this.isDead || !this.active) return;

    this.pendingAttack = false;
    this.clearTelegraph();

    const finalDmg = Math.max(1, Math.round(damage * this.vulnerability));
    this.hp -= finalDmg;
    this.stunnedUntil = Math.max(this.stunnedUntil, now + (hitStunMs || 140));

    if (knockback) {
      const ang = Math.atan2(this.y - attackerY, this.x - attackerX);
      this.setVelocity(Math.cos(ang) * knockback, Math.sin(ang) * knockback);
    }

    this.setTint(isCrit ? 0xff9d3b : 0xffffff);
    this.feedback?.spawnImpact(this.x, this.y, isCrit ? 0xff4d4d : 0xf5d78e, isCrit ? 1.25 : 0.9);
    this.feedback?.spawnDamageNumber(this.x, this.y, finalDmg, isCrit);

    this.scene.time.delayedCall(100, () => {
      if (this.active && !this.isDead) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  applyParriedStun(now, playerX, playerY) {
    this.pendingAttack = false;
    this.clearTelegraph();
    this.stunnedUntil = now + 950;
    this.nextAttackAt = now + 1100;
    const ang = Math.atan2(this.y - playerY, this.x - playerX);
    this.setVelocity(Math.cos(ang) * 165, Math.sin(ang) * 165);
    this.setTint(0x7ce8ff);
    this.scene.time.delayedCall(450, () => {
      if (this.active && !this.isDead) this.clearTint();
    });
  }

  die() {
    this.isDead = true;
    this.pendingAttack = false;
    this.clearTelegraph();
    this.setVelocity(0, 0);
    this.setActive(false).setVisible(false);
    this.body.enable = false;
  }

  clearTelegraph() {
    if (this.telegraphMarker) {
      this.telegraphMarker.destroy();
      this.telegraphMarker = null;
    }
  }

  updateAI(player, now) {
    if (this.isDead || !this.active) return;

    if (now < this.stunnedUntil) {
      return;
    }

    if (this.pendingAttack) {
      this.setVelocity(0, 0);
      if (now >= this.windupUntil) {
        this.pendingAttack = false;
        this.clearTelegraph();
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist <= this.config.attackRange + 10) {
          player.receiveEnemyAttack(this.config.damage, this, now);
        }
        this.nextAttackAt = now + this.config.attackCooldownMs;
      }
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist <= this.config.attackRange && now >= this.nextAttackAt) {
      this.pendingAttack = true;
      this.windupUntil = now + 340;
      this.setVelocity(0, 0);
      this.telegraphMarker = this.scene.add.circle(this.x, this.y - 18, 5, 0xff4433, 0.9).setDepth(24);
      return;
    }

    if (dist <= this.config.detectRadius) {
      this.scene.physics.moveToObject(this, player, this.config.moveSpeed);
      this.setFlipX(player.x < this.x);
    } else {
      const homeDist = Phaser.Math.Distance.Between(this.x, this.y, this.homePos.x, this.homePos.y);
      if (homeDist > 8) {
        this.scene.physics.moveTo(this, this.homePos.x, this.homePos.y, this.config.moveSpeed * 0.5);
      } else {
        this.setVelocity(0, 0);
      }
    }
  }
}