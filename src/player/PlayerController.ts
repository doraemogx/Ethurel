import Phaser from 'phaser';
import { VirtualJoystick } from '@/player/VirtualJoystick';
import { ensurePlayerTexture, PLAYER_ANIMATIONS, PLAYER_FRAME_HEIGHT, PLAYER_FRAMES, PLAYER_TEXTURE_KEY } from '@/player/sprite';
import { getClip, type AnimationState } from '@/player/animation';

export interface PlayerControllerOptions {
  speed?: number;
}

type Facing = 'down' | 'up' | 'side';

export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private wasd: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key } | null;
  private joystick: VirtualJoystick;
  private speed: number;
  private animTimer = 0;
  private animFrameIndex = 0;
  private animState: AnimationState = 'idle';
  private facing: Facing = 'down';
  private facingLeft = false;

  constructor(scene: Phaser.Scene, x: number, y: number, viewportWidth: number, viewportHeight: number, options: PlayerControllerOptions = {}) {
    this.speed = options.speed ?? 60;

    ensurePlayerTexture(scene);

    this.sprite = scene.physics.add.sprite(x, y, PLAYER_TEXTURE_KEY, PLAYER_FRAMES.idleA);
    this.sprite.setOrigin(0.5, 1);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(4, PLAYER_FRAME_HEIGHT - 8);
    this.sprite.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard?.createCursorKeys() ?? null;
    this.wasd = scene.input.keyboard
      ? {
          up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        }
      : null;

    this.joystick = new VirtualJoystick(scene, viewportWidth, viewportHeight);
  }

  private readInputVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.cursors?.left.isDown || this.wasd?.left.isDown) x -= 1;
    if (this.cursors?.right.isDown || this.wasd?.right.isDown) x += 1;
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) y -= 1;
    if (this.cursors?.down.isDown || this.wasd?.down.isDown) y += 1;

    if (x !== 0 || y !== 0) {
      const len = Math.hypot(x, y);
      return { x: x / len, y: y / len };
    }

    const joy = this.joystick.getVector();
    if (Math.hypot(joy.x, joy.y) > 0.15) return joy;

    return { x: 0, y: 0 };
  }

  /** Prioriza o eixo dominante para decidir a direção "de leitura" do sprite —
   * convenção comum de RPG top-down (só 3 conjuntos de frames: baixo/cima/lado). */
  private updateFacing(dir: { x: number; y: number }): void {
    if (dir.x === 0 && dir.y === 0) return; // mantém a última direção ao parar
    if (Math.abs(dir.y) > Math.abs(dir.x) * 1.2) {
      this.facing = dir.y < 0 ? 'up' : 'down';
    } else if (dir.x !== 0) {
      this.facing = 'side';
      this.facingLeft = dir.x < 0;
    }
  }

  update(deltaMs: number): void {
    const dir = this.readInputVector();
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(dir.x * this.speed, dir.y * this.speed);

    const moving = dir.x !== 0 || dir.y !== 0;
    this.updateFacing(dir);
    this.sprite.setFlipX(this.facing === 'side' && this.facingLeft);

    const nextState: AnimationState = !moving
      ? 'idle'
      : this.facing === 'down'
        ? 'walkDown'
        : this.facing === 'up'
          ? 'walkUp'
          : 'walkSide';

    if (nextState !== this.animState) {
      this.animState = nextState;
      this.animTimer = 0;
      this.animFrameIndex = 0;
    }

    // Estados sem clipe registrado (attack/cast/hurt/death — ver
    // src/player/animation.ts) simplesmente não têm o que tocar ainda;
    // isso nunca deveria acontecer para idle/walk*, mas o código não assume.
    const clip = getClip(PLAYER_ANIMATIONS, this.animState);
    if (clip) {
      this.animTimer += deltaMs;
      if (this.animTimer > clip.frameDurationMs) {
        this.animTimer = 0;
        this.animFrameIndex = (this.animFrameIndex + 1) % clip.frames.length;
      }
      this.sprite.setFrame(clip.frames[this.animFrameIndex]);
    }

    // Y-sorting simples: quem está mais abaixo na tela desenha por cima.
    this.sprite.setDepth(this.sprite.y);
  }

  destroy(): void {
    this.joystick.destroy();
  }
}
