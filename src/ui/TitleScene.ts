import Phaser from 'phaser';
import { drawButton } from '@/ui/Panel';
import { hasContinuableSave } from '@/save/gameSave';
import { createEmptySaveV3 } from '@/save/schema';
import { saveStore } from '@/save/SaveStore';

const SAVE_KEY = 'save_slot_1';

/** Tela de título — Novo Jogo sempre disponível; Continuar só aparece se
 * houver um personagem criado (spec §7/§28). */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#141a17');

    this.add
      .text(width / 2, height * 0.32, 'ETHUREL', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#e8dcc4' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.32 + 16, 'arredores de Varreth', { fontFamily: 'sans-serif', fontSize: '8px', color: '#9aa08c' })
      .setOrigin(0.5);

    const canContinue = hasContinuableSave();
    const btnW = 110;
    const btnH = 18;
    let y = height * 0.6;

    this.addButton(width / 2, y, btnW, btnH, 'Novo Jogo', () => this.startNewGame());
    if (canContinue) {
      y += btnH + 6;
      this.addButton(width / 2, y, btnW, btnH, 'Continuar', () => this.scene.start('VarrethOutskirtsScene'));
    }
  }

  private addButton(cx: number, cy: number, w: number, h: number, label: string, onClick: () => void): void {
    const g = this.add.graphics();
    drawButton(g, -w / 2, -h / 2, w, h, true);
    const t = this.add.text(0, 0, label, { fontFamily: 'sans-serif', fontSize: '9px', color: '#e8dcc4' }).setOrigin(0.5);
    const c = this.add.container(cx, cy, [g, t]);
    c.setSize(w, h);
    // Ver nota equivalente em CharacterCreationScene.addButton: o hit-test de
    // Container usa coordenadas locais ancoradas no canto superior-esquerdo,
    // mesmo com filhos desenhados centralizados — por isso (0,0,w,h).
    c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', onClick);
  }

  private startNewGame(): void {
    // "Novo Jogo" sempre recomeça do zero — se havia um save anterior
    // completo, ele é substituído (sem confirmação extra: mesma convenção
    // simples de JRPGs clássicos; não há múltiplos slots nesta slice).
    const fresh = createEmptySaveV3();
    saveStore.save(SAVE_KEY, fresh);
    this.scene.start('CharacterCreationScene');
  }
}
