import Phaser from 'phaser';
import { drawButton } from '@/ui/Panel';
import type { Interactable } from '@/interaction/Interactable';

/**
 * Botão "Interagir" no lado direito da tela + indicador discreto flutuante
 * sobre o alvo. Fixo na câmera (scrollFactor 0) — o botão em si não se move
 * com o mundo. Nunca dispara diálogo sozinho por proximidade: só chama
 * `onInteract` quando o jogador toca o botão (ver spec §12).
 */
export class InteractionPrompt {
  private readonly buttonContainer: Phaser.GameObjects.Container;
  private readonly buttonGfx: Phaser.GameObjects.Graphics;
  private readonly buttonText: Phaser.GameObjects.Text;
  private readonly worldIndicator: Phaser.GameObjects.Text;
  private current: Interactable | null = null;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const btnW = 64;
    const btnH = 22;
    const x = width - btnW - 10;
    const y = height - btnH - 10;

    this.buttonGfx = scene.add.graphics();
    drawButton(this.buttonGfx, 0, 0, btnW, btnH, false);
    this.buttonText = scene.add
      .text(btnW / 2, btnH / 2, 'Interagir', { fontFamily: 'sans-serif', fontSize: '9px', color: '#e8dcc4' })
      .setOrigin(0.5);

    this.buttonContainer = scene.add.container(x, y, [this.buttonGfx, this.buttonText]);
    this.buttonContainer.setScrollFactor(0).setDepth(3000).setVisible(false).setSize(btnW, btnH);
    // Nota: o hit-test de input do Phaser para um Container usa coordenadas
    // locais deslocadas em (width/2, height/2) relativo à posição do
    // container, INDEPENDENTE de como os filhos são desenhados — por isso o
    // retângulo de hitArea para filhos desenhados a partir de (0,0) precisa
    // começar em (largura/2, altura/2), não em (0,0). Confirmado
    // empiricamente (ver histórico de depuração desta build).
    this.buttonContainer.setInteractive(new Phaser.Geom.Rectangle(btnW / 2, btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    this.buttonContainer.on('pointerdown', () => {
      if (this.current) this.current.onInteract();
    });

    this.worldIndicator = scene.add
      .text(0, 0, '!', { fontFamily: 'sans-serif', fontSize: '12px', color: '#f2d98c', fontStyle: 'bold' })
      .setOrigin(0.5, 1)
      .setDepth(3000)
      .setVisible(false);
  }

  update(target: Interactable | null): void {
    this.current = target;
    this.buttonContainer.setVisible(target !== null);
    if (target) {
      this.worldIndicator.setPosition(target.x, target.y - 30);
      this.worldIndicator.setVisible(true);
    } else {
      this.worldIndicator.setVisible(false);
    }
  }

  destroy(): void {
    this.buttonContainer.destroy();
    this.worldIndicator.destroy();
  }
}
