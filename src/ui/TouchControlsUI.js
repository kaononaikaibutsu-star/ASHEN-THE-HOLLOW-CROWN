// src/ui/TouchControlsUI.js
export class TouchControlsUI {
  constructor(scene, inputManager = null, options = {}) {
    this.scene = scene;
    this.inputManager = inputManager || scene?.inputManager || null;
    this.visible = Boolean(options.visible ?? false);
    this.container = null;
    this.elements = [];

    if (this.scene?.add) {
      this.create();
    }
  }

  create() {
    if (!this.scene?.add) return;
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
    this.container.setVisible(this.visible);

    const width = this.scene.scale?.width || 960;
    const height = this.scene.scale?.height || 540;

    // Virtual D-pad / thumbstick base (bottom-left)
    const padX = 96;
    const padY = height - 96;
    const padBase = this.scene.add.circle(padX, padY, 48, 0x1a1a24, 0.45);
    padBase.setStrokeStyle(2, 0xc8a96e, 0.6);
    padBase.setInteractive();

    const updateAxisFromPointer = (pointer) => {
      if (!pointer?.isDown) return;
      const dx = Math.max(-1, Math.min(1, (pointer.x - padX) / 40));
      const dy = Math.max(-1, Math.min(1, (pointer.y - padY) / 40));
      this.inputManager?.setTouchAxis?.(dx, dy);
    };

    const resetAxis = () => {
      this.inputManager?.setTouchAxis?.(0, 0);
    };

    padBase.on('pointerdown', updateAxisFromPointer);
    padBase.on('pointermove', updateAxisFromPointer);
    padBase.on('pointerup', resetAxis);
    padBase.on('pointerout', resetAxis);

    this.container.add(padBase);
    this.elements.push(padBase);

    // Action buttons (bottom-right)
    const actions = [
      { id: 'attack', label: 'ATK', x: width - 84, y: height - 84, radius: 32 },
      { id: 'heavy', label: 'HVY', x: width - 156, y: height - 68, radius: 26 },
      { id: 'dodge', label: 'DDG', x: width - 68, y: height - 156, radius: 26 },
      { id: 'interact', label: 'USE', x: width - 140, y: height - 138, radius: 24 }
    ];

    for (const act of actions) {
      const btn = this.scene.add.circle(act.x, act.y, act.radius, 0x241d29, 0.55);
      btn.setStrokeStyle(2, 0xd4b475, 0.7);
      btn.setInteractive();
      btn.on('pointerdown', () => {
        this.inputManager?.triggerTouchAction?.(act.id);
      });

      const txt = this.scene.add
        .text(act.x, act.y, act.label, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#f3e7d3'
        })
        .setOrigin(0.5);

      this.container.add([btn, txt]);
      this.elements.push(btn, txt);
    }
  }

  setVisible(flag) {
    this.visible = Boolean(flag);
    this.container?.setVisible(this.visible);
  }

  update() {}

  destroy() {
    this.container?.destroy(true);
    this.container = null;
    this.elements = [];
  }
}

export default TouchControlsUI;