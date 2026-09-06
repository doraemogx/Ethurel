import Phaser from 'phaser';

/**
 * Joystick virtual mínimo, sem dependência externa. Fica fixo na tela (ignora o
 * scroll da câmera do mundo) na metade esquerda da tela — o polegar pode tocar
 * em qualquer ponto dessa zona para "criar" a base do manche ali (joystick
 * flutuante, não fixo num pixel exato — docs/design/02-STACK-E-ARQUITETURA.md §9).
 *
 * Expõe um vetor normalizado (`getVector()`, componentes em [-1, 1]) que o
 * controlador do jogador usa para movimento — o mesmo vetor serve tanto para
 * toque quanto, futuramente, para outros esquemas de input.
 */
export class VirtualJoystick {
  private scene: Phaser.Scene;
  private activeZone: Phaser.Geom.Rectangle;
  private baseRadius: number;
  private pointerId: number | null = null;
  private originX = 0;
  private originY = 0;
  private vector = { x: 0, y: 0 };

  private baseGfx: Phaser.GameObjects.Arc;
  private thumbGfx: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, viewportWidth: number, viewportHeight: number) {
    this.scene = scene;
    this.baseRadius = 26;
    // Zona de ativação: metade esquerda da tela lógica.
    this.activeZone = new Phaser.Geom.Rectangle(0, 0, viewportWidth / 2, viewportHeight);

    this.baseGfx = scene.add.circle(0, 0, this.baseRadius, 0xe8dcc4, 0.12).setVisible(false);
    this.thumbGfx = scene.add.circle(0, 0, this.baseRadius * 0.45, 0xe8dcc4, 0.35).setVisible(false);
    this.baseGfx.setScrollFactor(0).setDepth(1000);
    this.thumbGfx.setScrollFactor(0).setDepth(1001);

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.input.on('pointerupoutside', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null) return; // já tem um toque controlando o manche
    if (!Phaser.Geom.Rectangle.Contains(this.activeZone, pointer.x, pointer.y)) return;

    this.pointerId = pointer.id;
    this.originX = pointer.x;
    this.originY = pointer.y;
    this.baseGfx.setPosition(this.originX, this.originY).setVisible(true);
    this.thumbGfx.setPosition(this.originX, this.originY).setVisible(true);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== pointer.id) return;

    const dx = pointer.x - this.originX;
    const dy = pointer.y - this.originY;
    const dist = Math.min(Math.hypot(dx, dy), this.baseRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;

    this.thumbGfx.setPosition(this.originX + clampedX, this.originY + clampedY);
    this.vector.x = clampedX / this.baseRadius;
    this.vector.y = clampedY / this.baseRadius;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== pointer.id) return;
    this.pointerId = null;
    this.vector.x = 0;
    this.vector.y = 0;
    this.baseGfx.setVisible(false);
    this.thumbGfx.setVisible(false);
  }

  getVector(): { x: number; y: number } {
    return this.vector;
  }

  isActive(): boolean {
    return this.pointerId !== null;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('pointerupoutside', this.onPointerUp, this);
    this.baseGfx.destroy();
    this.thumbGfx.destroy();
  }
}
