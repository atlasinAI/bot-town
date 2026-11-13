import { isTitleVisible, isUiBlocking, joystickAxis, tryInteract } from '../ui/hud';

const SPEED = 120;

export type WalkDir = 'down' | 'left' | 'right' | 'up';

export class Controls {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasd: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key> | undefined;
  private keyE: Phaser.Input.Keyboard.Key | undefined;
  private keySpace: Phaser.Input.Keyboard.Key | undefined;
  private pointerTarget: { x: number; y: number; interact?: boolean } | null = null;
  private pendingInteract = false;
  private lastStepAt = 0;

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (kb) {
      this.cursors = kb.createCursorKeys();
      this.wasd = {
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  onPointerWorld(cb: (x: number, y: number) => { x: number; y: number; interact?: boolean } | null): void {
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (isUiBlocking() || isTitleVisible()) return;
      const t = (p.event?.target as HTMLElement | null) ?? null;
      if (t && t.closest && t.closest('#hud, #bot-card, #codex, #title-screen, #joystick, #interact-btn')) {
        return;
      }
      const world = this.scene.cameras.main.getWorldPoint(p.x, p.y);
      const dest = cb(world.x, world.y);
      this.pointerTarget = dest;
      this.pendingInteract = Boolean(dest?.interact);
    });
  }

  clearTarget(): void {
    this.pointerTarget = null;
    this.pendingInteract = false;
  }

  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    opts?: { onStep?: () => void },
  ): WalkDir | 'idle' {
    if (isTitleVisible() || isUiBlocking()) {
      sprite.setVelocity(0, 0);
      return 'idle';
    }

    if (this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) tryInteract();
    if (this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace)) tryInteract();
    if (this.pendingInteract && tryInteract()) {
      this.pendingInteract = false;
      this.pointerTarget = null;
      sprite.setVelocity(0, 0);
      return 'idle';
    }

    let vx = 0;
    let vy = 0;
    const joy = joystickAxis();
    if (Math.abs(joy.x) > 0.15 || Math.abs(joy.y) > 0.15) {
      vx = joy.x;
      vy = joy.y;
      this.pointerTarget = null;
    } else {
      if (this.cursors?.left.isDown || this.wasd?.left.isDown) vx -= 1;
      if (this.cursors?.right.isDown || this.wasd?.right.isDown) vx += 1;
      if (this.cursors?.up.isDown || this.wasd?.up.isDown) vy -= 1;
      if (this.cursors?.down.isDown || this.wasd?.down.isDown) vy += 1;
      if (vx || vy) this.pointerTarget = null;
    }

    if (!vx && !vy && this.pointerTarget) {
      const dx = this.pointerTarget.x - sprite.x;
      const dy = this.pointerTarget.y - sprite.y;
      if (Math.hypot(dx, dy) < 16) {
        const interact = this.pointerTarget.interact;
        this.pointerTarget = null;
        this.pendingInteract = false;
        sprite.setVelocity(0, 0);
        if (interact) tryInteract();
        return 'idle';
      }
      vx = dx;
      vy = dy;
    }

    const mag = Math.hypot(vx, vy);
    if (mag < 0.01) {
      sprite.setVelocity(0, 0);
      return 'idle';
    }
    vx = (vx / mag) * SPEED;
    vy = (vy / mag) * SPEED;
    sprite.setVelocity(vx, vy);

    const now = this.scene.time.now;
    if (now - this.lastStepAt > 220) {
      this.lastStepAt = now;
      opts?.onStep?.();
    }

    if (Math.abs(vx) > Math.abs(vy)) return vx < 0 ? 'left' : 'right';
    return vy < 0 ? 'up' : 'down';
  }
}

export function playWalk(sprite: Phaser.GameObjects.Sprite, prefix: string, dir: WalkDir | 'idle'): void {
  if (dir === 'idle') {
    const key = sprite.anims.currentAnim?.key ?? `${prefix}-down`;
    sprite.anims.stop();
    let frame = 0;
    if (key.endsWith('-left')) frame = 4;
    else if (key.endsWith('-right')) frame = 8;
    else if (key.endsWith('-up')) frame = 12;
    else frame = 0;
    sprite.setFrame(frame);
    return;
  }
  const key = `${prefix}-${dir}`;
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}
