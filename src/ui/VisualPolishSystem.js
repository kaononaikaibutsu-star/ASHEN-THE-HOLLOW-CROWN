// src/ui/VisualPolishSystem.js
export const QUALITY_PRESETS = {
  low: { maxParticles: 12, hitStopEnabled: false, vignetteAlpha: 0.25, poolSize: 16 },
  medium: { maxParticles: 28, hitStopEnabled: true, vignetteAlpha: 0.38, poolSize: 28 },
  high: { maxParticles: 52, hitStopEnabled: true, vignetteAlpha: 0.48, poolSize: 40 }
};

export class VisualPolishSystem {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.hitStopUntil = 0;
    this.textPool = [];
    this.weatherParticles = [];
    this.ambientOverlay = null;
    this.playerGlow = null;
  }

  getPreset() {
    const key = this.gameState.getState().settings?.graphicsQuality || 'medium';
    return QUALITY_PRESETS[key] || QUALITY_PRESETS.medium;
  }

  initLayers(worldW, worldH) {
    const preset = this.getPreset();
    this.ambientOverlay = this.scene.add
      .rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x160f24, 0.25)
      .setDepth(42);

    this.playerGlow = this.scene.add
      .circle(0, 0, 58, 0xf2b84b, 0.11)
      .setDepth(41);

    for (let i = 0; i < preset.poolSize; i++) {
      const txt = this.scene.add
        .text(-999, -999, '', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#f4ead5',
          stroke: '#0d0b0e',
          strokeThickness: 3
        })
        .setOrigin(0.5)
        .setDepth(48)
        .setVisible(false);
      this.textPool.push({ txt, busy: false });
    }
  }

  triggerHitStop(durationMs = 42, now = Date.now()) {
    const settings = this.gameState.getState().settings || {};
    if (settings.hitStop === false || !this.getPreset().hitStopEnabled) return;
    this.hitStopUntil = Math.max(this.hitStopUntil, now + durationMs);
  }

  isHitStopped(now = Date.now()) {
    return now < this.hitStopUntil;
  }

  spawnPooledCallout(x, y, label, color = '#f4ead5', isEmphasis = false) {
    const slot = this.textPool.find((s) => !s.busy);
    if (!slot) return;
    slot.busy = true;
    slot.txt
      .setPosition(x, y - 10)
      .setText(label)
      .setColor(color)
      .setFontSize(isEmphasis ? '15px' : '12px')
      .setAlpha(1)
      .setVisible(true);

    this.scene.tweens.add({
      targets: slot.txt,
      y: y - 34,
      alpha: 0,
      duration: 540,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        slot.txt.setVisible(false);
        slot.busy = false;
      }
    });
  }

  updateAtmosphere(player, lightingSpec, corruption = 0) {
    if (this.playerGlow && player) {
      this.playerGlow.setPosition(player.x, player.y);
      const corrTint = corruption >= 50 ? 0xc06bff : 0xf2b84b;
      this.playerGlow.setFillStyle(corrTint, corruption >= 50 ? 0.16 : 0.11);
    }

    if (this.ambientOverlay && lightingSpec) {
      this.ambientOverlay.setFillStyle(lightingSpec.color, lightingSpec.alpha);
    }
  }

  destroy() {
    this.ambientOverlay?.destroy();
    this.playerGlow?.destroy();
    for (const s of this.textPool) s.txt.destroy();
    this.textPool = [];
    for (const p of this.weatherParticles) p.destroy();
    this.weatherParticles = [];
  }
}