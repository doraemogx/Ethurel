import Phaser from 'phaser';
import { drawPanel, drawButton } from '@/ui/Panel';
import type { DialogueLine, DialogueNode } from '@/dialogue/types';

export const PORTRAIT_TEXTURE_KEY = 'ansimuz-npc-faces';
export const PORTRAIT_TEXTURE_URL = 'assets/ansimuz/portraits/npc-faces.png';

/**
 * Caixa de diálogo estilo JRPG: portrait|nome / texto, compacta (não cobre a
 * tela toda), toque para avançar, escolhas só quando `DialogueNode.choices`
 * existe. Pausa o movimento do jogador enquanto ativa (quem chama decide
 * isso via `onOpen`/`onClose`).
 */
export class DialogueBox {
  private readonly container: Phaser.GameObjects.Container;
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly continueIndicator: Phaser.GameObjects.Text;
  private readonly choiceButtons: Phaser.GameObjects.Container[] = [];

  private queue: DialogueLine[] = [];
  private currentNode: DialogueNode | null = null;
  private onDone: ((choiceId?: string) => void) | null = null;
  private choicesVisible = false;

  private readonly panelX: number;
  private readonly panelY: number;
  private readonly panelW: number;
  private readonly panelH: number;

  constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.panelW = Math.min(width - 12, 220);
    this.panelH = 56;
    this.panelX = (width - this.panelW) / 2;
    this.panelY = height - this.panelH - 8;

    this.gfx = scene.add.graphics();
    drawPanel(this.gfx, 0, 0, this.panelW, this.panelH);

    this.portrait = scene.add.image(10, 10, PORTRAIT_TEXTURE_KEY, 0).setOrigin(0, 0).setScale(2.2);
    this.nameText = scene.add.text(46, 6, '', { fontFamily: 'sans-serif', fontSize: '9px', color: '#f2d98c', fontStyle: 'bold' });
    this.bodyText = scene.add.text(46, 18, '', {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      color: '#e8dcc4',
      wordWrap: { width: this.panelW - 56 },
      lineSpacing: 3,
    });
    this.continueIndicator = scene.add
      .text(this.panelW - 12, this.panelH - 12, '▼', { fontFamily: 'sans-serif', fontSize: '9px', color: '#c9b98a' })
      .setOrigin(0.5);
    scene.tweens.add({ targets: this.continueIndicator, y: this.panelH - 8, duration: 450, yoyo: true, repeat: -1 });

    this.container = scene.add.container(this.panelX, this.panelY, [
      this.gfx,
      this.portrait,
      this.nameText,
      this.bodyText,
      this.continueIndicator,
    ]);
    this.container.setScrollFactor(0).setDepth(4000).setVisible(false);
    this.container.setSize(this.panelW, this.panelH);
    // Ver nota em InteractionPrompt.ts: hitArea de Container precisa começar
    // em (w/2,h/2) para filhos desenhados a partir de (0,0).
    this.container.setInteractive(new Phaser.Geom.Rectangle(this.panelW / 2, this.panelH / 2, this.panelW, this.panelH), Phaser.Geom.Rectangle.Contains);
    this.container.on('pointerdown', () => this.advance());
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  open(node: DialogueNode, onDone: (choiceId?: string) => void): void {
    this.currentNode = node;
    this.queue = [...node.lines];
    this.onDone = onDone;
    this.choicesVisible = false;
    this.container.setVisible(true);
    this.container.setInteractive();
    this.showNextLine();
  }

  private showNextLine(): void {
    const line = this.queue.shift();
    if (!line) {
      if (this.currentNode?.choices?.length) {
        this.showChoices(this.currentNode.choices);
      } else {
        this.close();
      }
      return;
    }
    this.nameText.setText(line.speakerName);
    this.bodyText.setText(line.text);
    this.portrait.setVisible(line.portraitFrame !== undefined);
    if (line.portraitFrame !== undefined) this.portrait.setFrame(line.portraitFrame);
    this.continueIndicator.setVisible(true);
  }

  private showChoices(choices: { id: string; text: string }[]): void {
    this.choicesVisible = true;
    // O painel principal também é interativo (toque-para-avançar) e cobre a
    // mesma área dos botões de escolha — desabilita sua interatividade
    // enquanto os botões estão visíveis para garantir que só ELES recebam o
    // toque.
    this.container.disableInteractive();
    this.continueIndicator.setVisible(false);
    this.bodyText.setText('');
    this.nameText.setText('');
    this.clearChoiceButtons();

    // Nota de implementação: os botões de escolha são criados como
    // containers de TOPO DE CENA (coordenadas absolutas), não aninhados
    // dentro de `this.container` — aninhar um container interativo dentro
    // de outro container interativo produziu coordenadas locais de hit-test
    // incorretas e inconsistentes (bug real encontrado durante QA desta
    // build; ver nota equivalente em InteractionPrompt.ts para o caso de
    // um único nível, que tem fórmula previsível — dois níveis não teve).
    const btnH = 16;
    const gap = 3;
    const btnW = this.panelW - 20;
    choices.forEach((choice, i) => {
      const g = this.scene.add.graphics();
      drawButton(g, 0, 0, btnW, btnH);
      const t = this.scene.add
        .text(btnW / 2, btnH / 2, choice.text, { fontFamily: 'sans-serif', fontSize: '8px', color: '#e8dcc4' })
        .setOrigin(0.5);
      const worldX = this.panelX + 10;
      const worldY = this.panelY + 4 + i * (btnH + gap);
      const c = this.scene.add.container(worldX, worldY, [g, t]);
      c.setScrollFactor(0).setDepth(4001);
      c.setSize(btnW, btnH);
      c.setInteractive(new Phaser.Geom.Rectangle(btnW / 2, btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      c.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.close(choice.id);
      });
      this.choiceButtons.push(c);
    });
  }

  private clearChoiceButtons(): void {
    for (const b of this.choiceButtons) b.destroy();
    this.choiceButtons.length = 0;
  }

  private advance(): void {
    // Enquanto os botões de escolha estão visíveis, o toque no painel não
    // deve fazer nada (só os próprios botões respondem) — mas isso NÃO pode
    // impedir a transição PARA as escolhas quando a última linha acaba de
    // ser mostrada (bug real: comparar contra queue.length===0 disparava
    // cedo demais, já que a fila fica vazia exatamente ao mostrar a última
    // linha, impedindo showChoices() de ser alcançado pelo toque seguinte).
    if (this.choicesVisible) return;
    this.showNextLine();
  }

  private close(choiceId?: string): void {
    this.choicesVisible = false;
    this.clearChoiceButtons();
    this.container.setVisible(false);
    const cb = this.onDone;
    this.currentNode = null;
    this.onDone = null;
    cb?.(choiceId);
  }

  destroy(): void {
    this.container.destroy();
  }
}
