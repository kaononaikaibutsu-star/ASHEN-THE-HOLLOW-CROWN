// src/ui/MobileTouchControls.js
export class MobileTouchControls {
  constructor(scene, gameState, getInputMgr) {
    this.scene = scene;
    this.gameState = gameState;
    this.getInputMgr = getInputMgr;
    this.container = scene.add.container(0, 0).setDepth(70);
    this.stickPointerId = null;
    this.stickBase = { x: 88, y: 380 };
    this.stickRadius = 42;
    this.knob = null;
    this.baseRing = null;
  }

  shouldShow() {
    const mode = this.gameState.getState().settings?.touchMode || 'auto';
    if (mode === 'always') return true;
    if (mode === 'hidden') return false;
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || this.scene.scale.width < 900;
    }
    return true;
  }

  build() {
    this.container.removeAll(true);
    if (!this.shouldShow()) {
      this.container.setVisible(false);
      return;
    }
    this.container.setVisible(true);

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const scale = Math.max(0.8, Math.min(1.35, this.gameState.getState().settings?.touchScale || 1));
    const padX = 24;
    const padY = 24;

    this.stickBase = { x: padX + 58 * scale, y: h - padY - 58 * scale };
    this.stickRadius = 40 * scale;

    this.baseRing = this.scene.add
      .circle(this.stickBase.x, this.stickBase.y, this.stickRadius, 0x1a1520, 0.45)
      .setStrokeStyle(2, 0xc8cfd8, 0.75)
      .setInteractive();
    this.knob = this.scene.add
      .circle(this.stickBase.x, this.stickBase.y, 18 * scale, 0xf2b84b, 0.85);
    this.container.add([this.baseRing, this.knob]);

    this.baseRing.on('pointerdown', (pointer) => {
      this.stickPointerId = pointer.id;
      this.updateStick(pointer.x, pointer.y);
    });

    this.scene.input.on('pointermove', (pointer) => {
      if (this.stickPointerId === pointer.id) {
        this.updateStick(pointer.x, pointer.y);
      }
    });

    const releaseStick = (pointer) => {
      if (this.stickPointerId === pointer.id) {
        this.stickPointerId = null;
        this.knob?.setPosition(this.stickBase.x, this.stickBase.y);
        this.getInputMgr()?.setTouchAxis(0, 0);
      }
    };
    this.scene.input.on('pointerup', releaseStick);
    this.scene.input.on('pointerupoutside', releaseStick);

    // Ergonomic arc of right-hand combat & interaction buttons
    const rx = w - padX - 46 * scale;
    const by = h - padY - 46 * scale;
    const buttons = [
      { id: 'attack', label: 'ATK', x: rx, y: by, color: 0xe05a47 },
      { id: 'heavy', label: 'HVY', x: rx - 66 * scale, y: by - 16 * scale, color: 0xff9d3b },
      { id: 'dodge', label: 'DDG', x: rx - 56 * scale, y: by - 74 * scale, color: 0x7ce8ff },
      { id: 'block', label: 'BLK', x: rx + 4 * scale, y: by - 76 * scale, color: 0x8fb8e8, hold: true },
      { id: 'special', label: 'SPC', x: rx - 114 * scale, y: by - 64 * scale, color: 0xc06bff },
      { id: 'interact', label: 'USE', x: rx - 122 * scale, y: by - 6 * scale, color: 0x8be09c }
    ];

    for (const b of buttons) {
      const btn = this.scene.add
        .circle(b.x, b.y, 24 * scale, 0x1a1520, 0.72)
        .setStrokeStyle(2, b.color, 0.9)
        .setInteractive({ useHandCursor: true });
      const lbl = this.scene.add
        .text(b.x, b.y, b.label, {
          fontFamily: 'monospace',
          fontSize: `${Math.round(11 * scale)}px`,
          color: '#f4ead5'
        })
        .setOrigin(0.5);

      if (b.hold) {
        btn.on('pointerdown', () => this.getInputMgr()?.setTouchBlockHeld(true));
        btn.on('pointerup', () => this.getInputMgr()?.setTouchBlockHeld(false));
        btn.on('pointerout', () => this.getInputMgr()?.setTouchBlockHeld(false));
      } else {
        btn.on('pointerdown', () => this.getInputMgr()?.triggerTouchAction(b.id));
      }

      this.container.add([btn, lbl]);
    }
  }

  updateStick(px, py) {
    const dx = px - this.stickBase.x;
    const dy = py - this.stickBase.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, this.stickRadius);
    const ang = Math.atan2(dy, dx);

    this.knob?.setPosition(
      this.stickBase.x + Math.cos(ang) * clamped,
      this.stickBase.y + Math.sin(ang) * clamped
    );

    const norm = this.stickRadius > 0 ? clamped / this.stickRadius : 0;
    if (norm < 0.15) {
      this.getInputMgr()?.setTouchAxis(0, 0);
    } else {
      this.getInputMgr()?.setTouchAxis(Math.cos(ang) * norm, Math.sin(ang) * norm);
    }
  }
}