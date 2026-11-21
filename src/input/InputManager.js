// src/input/InputManager.js
export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      dodge: 'SPACE',
      interact: 'E',
      heal: 'Q',
      heavy: 'R',
      heavyAlt: 'SHIFT',
      block: 'F',
      special: 'C',
      cycleWeapon: 'TAB'
    });

    this.touchState = {
      dx: 0,
      dy: 0,
      attackQueued: false,
      heavyQueued: false,
      dodgeQueued: false,
      blockHeld: false,
      specialQueued: false,
      interactQueued: false
    };

    this.attackQueued = false;
    this.heavyQueued = false;
    this.dodgeQueued = false;
    this.specialQueued = false;
    this.interactQueued = false;
    this.healQueued = false;
    this.cycleWeaponQueued = false;
    this.blockHeld = false;

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.y < 40) return;
      if (pointer.rightButtonDown()) {
        this.blockHeld = true;
      } else if (pointer.leftButtonDown()) {
        this.attackQueued = true;
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (!pointer.rightButtonDown()) {
        this.blockHeld = false;
      }
    });

    scene.input.keyboard.on('keydown-SPACE', () => { this.dodgeQueued = true; });
    scene.input.keyboard.on('keydown-E', () => { this.interactQueued = true; });
    scene.input.keyboard.on('keydown-Q', () => { this.healQueued = true; });
    scene.input.keyboard.on('keydown-R', () => { this.heavyQueued = true; });
    scene.input.keyboard.on('keydown-SHIFT', () => { this.heavyQueued = true; });
    scene.input.keyboard.on('keydown-C', () => { this.specialQueued = true; });
    scene.input.keyboard.on('keydown-TAB', (ev) => {
      ev.preventDefault();
      this.cycleWeaponQueued = true;
    });
  }

  setTouchAxis(dx, dy) {
    this.touchState.dx = dx;
    this.touchState.dy = dy;
  }

  setTouchBlockHeld(held) {
    this.touchState.blockHeld = Boolean(held);
  }

  triggerTouchAction(action) {
    if (action === 'attack') this.touchState.attackQueued = true;
    if (action === 'heavy') this.touchState.heavyQueued = true;
    if (action === 'dodge') this.touchState.dodgeQueued = true;
    if (action === 'special') this.touchState.specialQueued = true;
    if (action === 'interact') this.touchState.interactQueued = true;
  }

  getMoveVector() {
    let x = this.touchState.dx;
    let y = this.touchState.dy;
    if (this.cursors.left.isDown || this.keys.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) y += 1;

    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  isBlocking() {
    return this.blockHeld || this.touchState.blockHeld || this.keys.block.isDown;
  }

  consumeAttack() {
    const v = this.attackQueued || this.touchState.attackQueued;
    this.attackQueued = false;
    this.touchState.attackQueued = false;
    return v;
  }

  consumeHeavyAttack() {
    const v = this.heavyQueued || this.touchState.heavyQueued;
    this.heavyQueued = false;
    this.touchState.heavyQueued = false;
    return v;
  }

  consumeDodge() {
    const v = this.dodgeQueued || this.touchState.dodgeQueued;
    this.dodgeQueued = false;
    this.touchState.dodgeQueued = false;
    return v;
  }

  consumeSpecial() {
    const v = this.specialQueued || this.touchState.specialQueued;
    this.specialQueued = false;
    this.touchState.specialQueued = false;
    return v;
  }

  consumeCycleWeapon() {
    const v = this.cycleWeaponQueued;
    this.cycleWeaponQueued = false;
    return v;
  }

  consumeInteract() {
    const v = this.interactQueued || this.touchState.interactQueued;
    this.interactQueued = false;
    this.touchState.interactQueued = false;
    return v;
  }

  consumeHeal() {
    const v = this.healQueued;
    this.healQueued = false;
    return v;
  }
}