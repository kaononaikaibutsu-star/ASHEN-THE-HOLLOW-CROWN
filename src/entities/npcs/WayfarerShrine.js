// src/entities/npcs/WayfarerShrine.js
export class WayfarerShrine {
  constructor(scene, x = 192, y = 192, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.id = config.id || 'wayfarer_shrine';
    this.label = config.label || 'Wayfarer Shrine';
    this.radius = config.radius || 28;
    this.container = null;

    if (this.scene?.add) {
      this.create();
    }
  }

  create() {
    if (!this.scene?.add) return;
    this.container = this.scene.add.container(this.x, this.y);

    const base = this.scene.add.circle(0, 0, 14, 0x3a2e45, 0.9);
    base.setStrokeStyle(2, 0xd4b475, 0.85);

    const beacon = this.scene.add.circle(0, -6, 5, 0xf2d08a, 0.95);
    const label = this.scene.add
      .text(0, 22, this.label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#f3e7d3'
      })
      .setOrigin(0.5);

    this.container.add([base, beacon, label]);
  }

  isPlayerNearby(player, dist = 48) {
    if (!player) return false;
    const px = player.x ?? player.sprite?.x;
    const py = player.y ?? player.sprite?.y;
    if (typeof px !== 'number' || typeof py !== 'number') return false;
    return Math.hypot(px - this.x, py - this.y) <= dist;
  }

  interact() {
    return {
      ok: true,
      id: this.id,
      label: this.label,
      x: this.x,
      y: this.y
    };
  }

  update() {}

  destroy() {
    this.container?.destroy(true);
    this.container = null;
  }
}

export default WayfarerShrine;