import Phaser from 'phaser';
import { VirtualJoystick } from '@/player/VirtualJoystick';
import { PLAYER_TEXTURE_KEY, PLAYER_FRAME_HEIGHT, buildAnimationSetForGender } from '@/player/sprite';
import { getClip, type AnimationState, type CharacterAnimationSet } from '@/player/animation';
import type { Gender } from '@/player/types';

export interface PlayerControllerOptions {
  speed?: number;
  /** Textura a usar — permite reaproveitar o controller para NPCs futuros
   * com outra folha, sem duplicar a classe. Padrão: sprite do jogador. */
  textureKey?: string;
}

type Facing = 'down' | 'up' | 'left' | 'right';

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
  private animations: CharacterAnimationSet;
  private inputEnabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    viewportWidth: number,
    viewportHeight: number,
    gender: Gender,
    options: PlayerControllerOptions = {}
  ) {
    this.speed = options.speed ?? 60;
    this.animations = buildAnimationSetForGender(gender);

    const textureKey = options.textureKey ?? PLAYER_TEXTURE_KEY;
    this.sprite = scene.physics.add.sprite(x, y, textureKey, getClip(this.animations, 'idle')?.frames[0] ?? 0);
    this.sprite.setOrigin(0.5, 1);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 10);
    body.setOffset((32 - 16) / 2, PLAYER_FRAME_HEIGHT - 10);
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

  /** Diálogo/combate pausam o movimento sem destruir o controller. */
  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (!enabled) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
  }

  private readInputVector(): { x: number; y: number } {
    if (!this.inputEnabled) return { x: 0, y: 0 };
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
   * agora com frames reais para as 4 direções (sem espelhar lado). */
  private updateFacing(dir: { x: number; y: number }): void {
    if (dir.x === 0 && dir.y === 0) return; // mantém a última direção ao parar
    if (Math.abs(dir.y) > Math.abs(dir.x)) {
      this.facing = dir.y < 0 ? 'up' : 'down';
    } else {
      this.facing = dir.x < 0 ? 'left' : 'right';
    }
  }

  update(deltaMs: number): void {
    const dir = this.readInputVector();
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(dir.x * this.speed, dir.y * this.speed);

    const moving = dir.x !== 0 || dir.y !== 0;
    this.updateFacing(dir);

    const nextState: AnimationState = !moving
      ? 'idle'
      : this.facing === 'down'
        ? 'walkDown'
        : this.facing === 'up'
          ? 'walkUp'
          : this.facing === 'left'
            ? 'walkLeft'
            : 'walkRight';

    if (nextState !== this.animState) {
      this.animState = nextState;
      this.animTimer = 0;
      this.animFrameIndex = 0;
    }

    const clip = getClip(this.animations, this.animState);
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
