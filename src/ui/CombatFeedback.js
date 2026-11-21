// src/ui/CombatFeedback.js
export class CombatFeedback {
  constructor(scene) {
    this.scene = scene;
  }

  spawnSwingTrail(x, y, angle, reach, isHeavy = false) {
    const g = this.scene.add.graphics().setPosition(x, y).setRotation(angle).setDepth(22);
    g.lineStyle(isHeavy ? 6 : 4, isHeavy ? 0xff9d3b : 0xf5d78e, 0.92);
    g.beginPath();
    g.arc(0, 0, Math.min(reach, 64), -0.75, 0.75, false);
    g.strokePath();

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: isHeavy ? 190 : 130,
      onComplete: () => g.destroy()
    });
  }

  spawnImpact(x, y, color = 0xffcf70, scale = 1) {
    const flash = this.scene.add.circle(x, y, 10 * scale, color, 0.85).setDepth(25);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.9,
      alpha: 0,
      duration: 140,
      onComplete: () => flash.destroy()
    });
  }

  spawnParryBurst(x, y) {
    const ring = this.scene.add.circle(x, y, 8, 0x7ce8ff, 0.2).setStrokeStyle(3, 0xffffff, 1).setDepth(26);
    this.scene.tweens.add({
      targets: ring,
      radius: 36,
      scale: 2.2,
      alpha: 0,
      duration: 240,
      onComplete: () => ring.destroy()
    });
    this.spawnDamageNumber(x, y - 16, 'PARRY!', false, '#7ce8ff');
  }

  spawnDodgeGhost(x, y, textureKey, flipX) {
    const ghost = this.scene.add.image(x, y, textureKey).setFlipX(flipX).setAlpha(0.45).setTint(0x9ab8d9).setDepth(15);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 180,
      onComplete: () => ghost.destroy()
    });
  }

  spawnDamageNumber(x, y, value, isCrit = false, customColor = null) {
    const color = customColor || (isCrit ? '#ff4d4d' : '#f4ead5');
    const label = isCrit ? `${value}!` : `${value}`;
    const txt = this.scene.add.text(x, y - 10, label, {
      fontFamily: 'monospace',
      fontSize: isCrit ? '15px' : '12px',
      fontStyle: isCrit ? 'bold' : 'normal',
      color,
      stroke: '#0d0b0e',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);

    this.scene.tweens.add({
      targets: txt,
      y: y - 34,
      alpha: 0,
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }
}