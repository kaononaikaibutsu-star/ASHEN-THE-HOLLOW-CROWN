// src/ui/EcosystemDebugOverlay.js
export class EcosystemDebugOverlay {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.graphics = scene.add.graphics().setDepth(55).setVisible(false);
    this.panelText = scene.add
      .text(16, 86, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#7ce8ff',
        backgroundColor: '#0e0b14',
        padding: { x: 8, y: 6 }
      })
      .setDepth(56)
      .setVisible(false);
    this.logs = [];
  }

  toggle() {
    this.enabled = !this.enabled;
    this.graphics.setVisible(this.enabled);
    this.panelText.setVisible(this.enabled);
  }

  log(entry) {
    this.logs.unshift(entry);
    if (this.logs.length > 5) this.logs.pop();
  }

  update(enemies = [], bossController = null) {
    if (!this.enabled) return;
    this.graphics.clear();

    const lines = ['[DEV ECOSYSTEM DEBUG - F3]'];
    for (const e of enemies) {
      if (!e.active || e.isDead) continue;
      this.graphics.lineStyle(1, 0x5ca4ff, 0.35).strokeCircle(e.x, e.y, e.ai?.def?.detectRange || 160);
      this.graphics.lineStyle(1, 0xff4d4d, 0.5).strokeCircle(e.x, e.y, e.ai?.def?.attackRange || 30);
      lines.push(`${e.config?.name || e.enemyId}: ${e.ai?.state || 'active'} HP=${Math.ceil(e.hp)}`);
    }

    if (bossController && !bossController.defeated) {
      const ph = bossController.getCurrentPhase();
      lines.push(`BOSS ${bossController.def.name}: Phase ${ph.phase} (${ph.label}) HP=${Math.ceil(bossController.boss.hp)}`);
    }

    if (this.logs.length > 0) {
      lines.push('--- LOG ---', ...this.logs);
    }

    this.panelText.setText(lines.join('\n'));
  }
}