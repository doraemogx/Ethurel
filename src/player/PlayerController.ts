import Phaser from 'phaser';
import { VirtualJoystick } from '@/player/VirtualJoystick';

const TEXTURE_KEY = 'player-proto';
const FRAME_WIDTH = 16;
const FRAME_HEIGHT = 24;

/**
 * Sprite do jogador gerado por código (Graphics → texture), não um asset final.
 * Placeholder de PROTÓTIPO da Fase 2 — a arte definitiva (pixel art real, 4
 * direções distintas) é trabalho da Fase 3/8, não desta fase de movimento.
 * 2 frames (idle/passo alternado) + flip horizontal para esquerda/direita —
 * suficiente para provar a máquina de estado de movimento/animação sem
 * investir em arte final agora.
 */
function ensurePlayerTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEY)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  const drawFrame = (offsetX: number, legOffset: number) => {
    // cabeça
    g.fillStyle(0xd8c39a, 1);
    g.fillRect(offsetX + 5, 1, 6, 6);
    // corpo (tom "âmbar" da paleta, para não ficar neutro/cinza puro)
    g.fillStyle(0x8a6a3f, 1);
    g.fillRect(offsetX + 4, 7, 8, 9);
    // indicador de frente (sigilo/rosto) — ponto mais claro no centro do corpo
    g.fillStyle(0xc9b98a, 1);
    g.fillRect(offsetX + 7, 9, 2, 2);
    // pernas (alternam para o passo)
    g.fillStyle(0x3a342a, 1);
    g.fillRect(offsetX + 4, 16 + legOffset, 3, 7 - legOffset);
    g.fillRect(offsetX + 9, 16 - legOffset, 3, 7 + legOffset);
  };

  drawFrame(0, 0); // frame 0: idle/passo A
  drawFrame(FRAME_WIDTH, 2); // frame 1: passo B

  g.generateTexture(TEXTURE_KEY, FRAME_WIDTH * 2, FRAME_HEIGHT);
  g.destroy();

  scene.textures.get(TEXTURE_KEY).add(0, 0, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
  scene.textures.get(TEXTURE_KEY).add(1, 0, FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT);
}

export interface PlayerControllerOptions {
  speed?: number;
}

export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private wasd: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key } | null;
  private joystick: VirtualJoystick;
  private speed: number;
  private animTimer = 0;
  private animFrame = 0;
  private facingX = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, viewportWidth: number, viewportHeight: number, options: PlayerControllerOptions = {}) {
    this.speed = options.speed ?? 60;

    ensurePlayerTexture(scene);

    this.sprite = scene.physics.add.sprite(x, y, TEXTURE_KEY, 0);
    this.sprite.setOrigin(0.5, 1);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, FRAME_HEIGHT - 8);
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

  update(deltaMs: number): void {
    const dir = this.readInputVector();
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(dir.x * this.speed, dir.y * this.speed);

    const moving = dir.x !== 0 || dir.y !== 0;
    if (dir.x !== 0) this.facingX = dir.x > 0 ? 1 : -1;
    this.sprite.setFlipX(this.facingX < 0);

    if (moving) {
      this.animTimer += deltaMs;
      if (this.animTimer > 160) {
        this.animTimer = 0;
        this.animFrame = this.animFrame === 0 ? 1 : 0;
        this.sprite.setFrame(this.animFrame);
      }
    } else {
      this.animTimer = 0;
      this.animFrame = 0;
      this.sprite.setFrame(0);
    }
  }

  destroy(): void {
    this.joystick.destroy();
  }
}
