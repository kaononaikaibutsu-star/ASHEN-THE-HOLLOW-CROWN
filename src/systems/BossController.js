// src/systems/BossController.js
import { BOSS_DEFINITIONS, ENEMY_ECOSYSTEM_DEFS } from '../data/enemyEcosystemData.js';
import { generateLoot } from './LootAndEconomySystem.js';
import { EVENTS, EventBus } from '../core/EventBus.js';

export const BOSS_EVENTS = {
  PHASE_CHANGED: 'boss:phase_changed',
  HAZARD_SPAWNED: 'boss:hazard_spawned',
  DEFEATED: 'boss:defeated'
};

export class BossController {
  constructor(scene, bossEntity, bossKey = 'hollow_warden_boss', { progressionSystem, invSystem, onSummonEnemy } = {}) {
    this.scene = scene;
    this.boss = bossEntity;
    this.def = BOSS_DEFINITIONS[bossKey] || BOSS_DEFINITIONS.hollow_warden_boss;
    this.progression = progressionSystem;
    this.invSystem = invSystem;
    this.onSummonEnemy = onSummonEnemy;

    this.currentPhaseIndex = 0;
    this.nextAttackAt = 0;
    this.nextHazardAt = 0;
    this.vulnerableUntil = 0;
    this.defeated = false;
    this.hazards = [];
  }

  getCurrentPhase() {
    return this.def.phases[this.currentPhaseIndex] || this.def.phases[0];
  }

  evaluatePhaseTransitions(now) {
    if (this.defeated || !this.boss?.active) return;
    const hpPct = Math.max(0, this.boss.hp / this.boss.maxHealth);

    for (let i = this.def.phases.length - 1; i > this.currentPhaseIndex; i--) {
      const candidate = this.def.phases[i];
      if (hpPct <= candidate.hpThresholdPct) {
        this.enterPhase(i, now);
        break;
      }
    }
  }

  enterPhase(nextIdx, now) {
    this.currentPhaseIndex = nextIdx;
    const phase = this.getCurrentPhase();
    this.vulnerableUntil = now + (phase.vulnerabilityWindowMs || 500);
    this.boss.setTint(phase.enraged ? 0xff4433 : 0xc06bff);
    this.scene.cameras.main.shake(220, 0.012);
    this.scene.feedback?.spawnDamageNumber(this.boss.x, this.boss.y - 24, `PHASE ${phase.phase}: ${phase.label}`, true, '#ff9d3b');

    if (phase.summonCount > 0 && typeof this.onSummonEnemy === 'function') {
      for (let s = 0; s < phase.summonCount; s++) {
        this.onSummonEnemy(ENEMY_ECOSYSTEM_DEFS.skeleton_skirmisher, this.boss.x + (s === 0 ? -36 : 36), this.boss.y);
      }
    }

    EventBus.emit(BOSS_EVENTS.PHASE_CHANGED, {
      bossId: this.def.id,
      phase: phase.phase,
      label: phase.label,
      enraged: phase.enraged
    });
  }

  spawnArenaHazard(player, now) {
    const hz = this.scene.add.circle(player.x, player.y, 28, 0xc06bff, 0.25).setStrokeStyle(2, 0xff5577, 0.85).setDepth(12);
    this.hazards.push({ zone: hz, x: player.x, y: player.y, radius: 28, detonatesAt: now + 900, dealt: false });
    EventBus.emit(BOSS_EVENTS.HAZARD_SPAWNED, { x: player.x, y: player.y });
  }

  update(player, now, delta) {
    if (this.defeated || !this.boss?.active) return;
    this.evaluatePhaseTransitions(now);
    const phase = this.getCurrentPhase();

    // Update active arena hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (!h.dealt && now >= h.detonatesAt) {
        h.dealt = true;
        h.zone.setFillStyle(0xff4433, 0.55);
        const dist = Phaser.Math.Distance.Between(player.x, player.y, h.x, h.y);
        if (dist <= h.radius + (player.radius || 12)) {
          const dmg = Math.round(this.def.baseDamage * phase.damageMult * 0.8);
          player.receiveEnemyAttack?.(dmg, this.boss, now);
        }
        this.scene.time.delayedCall(220, () => h.zone.destroy());
        this.hazards.splice(i, 1);
      }
    }

    if (now >= this.nextHazardAt) {
      this.nextHazardAt = now + (phase.hazardIntervalMs || 3500);
      this.spawnArenaHazard(player, now);
    }

    const dist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, player.x, player.y);
    if (dist > 24) {
      this.scene.physics.moveToObject(this.boss, player, this.def.moveSpeed * phase.speedMult);
      this.boss.setFlipX(player.x < this.boss.x);
    } else {
      this.boss.setVelocity(0, 0);
    }

    if (dist <= 44 && now >= this.nextAttackAt) {
      this.nextAttackAt = now + (phase.attackIntervalMs || 1200);
      const isVulnerableNow = now <= this.vulnerableUntil;
      const dmg = Math.round(this.def.baseDamage * phase.damageMult * (isVulnerableNow ? 0.75 : 1));
      player.receiveEnemyAttack?.(dmg, this.boss, now);
    }

    if (this.boss.hp <= 0) {
      this.handleBossDeath();
    }
  }

  handleBossDeath() {
    if (this.defeated) return;
    this.defeated = true;
    for (const h of this.hazards) h.zone?.destroy();
    this.hazards = [];

    const loot = generateLoot(this.def.lootTableKey);
    const st = this.invSystem?.ensureShape();
    if (st) {
      st.gold = (st.gold || 0) + loot.gold;
      for (const d of loot.drops) {
        this.invSystem.addItem(d.itemId, d.quantity, { rarity: d.rarity });
      }
    }

    this.progression?.awardXp(this.def.xpReward, 'boss');
    if (this.def.corruptionOnDefeat) {
      this.progression?.addCorruption(this.def.corruptionOnDefeat, 'boss_defeat');
    }

    EventBus.emit(BOSS_EVENTS.DEFEATED, { bossId: this.def.id, loot, xpReward: this.def.xpReward });
    EventBus.emit(EVENTS.INVENTORY_CHANGED, st?.inventory || []);
  }
}