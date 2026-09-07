import Phaser from 'phaser';
import { drawButton } from '@/ui/Panel';
import { PLAYER_TEXTURE_KEY, PLAYER_TEXTURE_URL, standingFrameForGender } from '@/player/sprite';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { loadOrCreateSave, forceSave } from '@/save/gameSave';
import type { SaveDataV3, CharacterSaveState } from '@/save/schema';
import { createInitialIndole, createInitialReputation } from '@/social/indole';
import type { Gender } from '@/player/types';
import type { ClassDefinition } from '@/classes/types';
import type { OriginDefinition } from '@/player/types';

type Step = 'gender' | 'name' | 'class' | 'origin' | 'confirm';

/**
 * Criação de personagem — fluxo simplificado (Revisão 2, já aprovado):
 * gênero → nome → classe → origem → iniciar. SEM formulário de
 * personalidade (Índole emerge no jogo) e SEM customização visual de
 * aparência: os únicos sprites com licença confirmada (Mighty Pack) são
 * blocos fixos por gênero, sem partes de roupa/cabelo intercambiáveis — em
 * vez de inventar sliders sem efeito real, este passo simplesmente não
 * existe nesta build (ver relatório final, seção de limitações).
 */
export class CharacterCreationScene extends Phaser.Scene {
  private step: Step = 'gender';
  private gender: Gender = 'homem';
  private name = '';
  private classDef: ClassDefinition = CLASSES[0];
  private origin: OriginDefinition = ORIGINS[0];
  private nameInput: HTMLInputElement | null = null;
  private stepContainer!: Phaser.GameObjects.Container;
  private previewSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super('CharacterCreationScene');
  }

  preload(): void {
    this.load.spritesheet(PLAYER_TEXTURE_KEY, PLAYER_TEXTURE_URL, { frameWidth: 32, frameHeight: 42 });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#141a17');
    const { width } = this.scale;

    this.add.text(width / 2, 10, 'Criação de personagem', { fontFamily: 'sans-serif', fontSize: '9px', color: '#c9b98a' }).setOrigin(0.5);
    this.previewSprite = this.add.sprite(width / 2, 46, PLAYER_TEXTURE_KEY, standingFrameForGender(this.gender)).setScale(1.6);
    this.stepContainer = this.add.container(0, 0);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.removeNameInput());
    this.renderStep();
  }

  private clearStep(): void {
    this.stepContainer.removeAll(true);
    this.removeNameInput();
  }

  private addButton(container: Phaser.GameObjects.Container, cx: number, cy: number, w: number, h: number, label: string, onClick: () => void): void {
    const g = this.add.graphics();
    drawButton(g, -w / 2, -h / 2, w, h);
    const t = this.add.text(0, 0, label, { fontFamily: 'sans-serif', fontSize: '8px', color: '#e8dcc4', align: 'center', wordWrap: { width: w - 8 } }).setOrigin(0.5);
    const c = this.add.container(cx, cy, [g, t]);
    c.setSize(w, h);
    // Nota de implementação: para um Container, o hit-test de input do Phaser
    // usa coordenadas locais ancoradas no canto superior-esquerdo de uma caixa
    // width×height (mesmo quando os filhos são desenhados centralizados em
    // torno da posição do container) — por isso o retângulo de hitArea usa
    // (0,0,w,h), não (-w/2,-h/2,w,h), apesar do conteúdo visual ser centralizado.
    c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', onClick);
    container.add(c);
  }

  private renderStep(): void {
    this.clearStep();
    const { width, height } = this.scale;

    if (this.step === 'gender') {
      this.addButton(this.stepContainer, width / 2 - 60, height * 0.62, 90, 20, 'Homem', () => {
        this.gender = 'homem';
        this.previewSprite.setFrame(standingFrameForGender(this.gender));
        this.step = 'name';
        this.renderStep();
      });
      this.addButton(this.stepContainer, width / 2 + 60, height * 0.62, 90, 20, 'Mulher', () => {
        this.gender = 'mulher';
        this.previewSprite.setFrame(standingFrameForGender(this.gender));
        this.step = 'name';
        this.renderStep();
      });
      return;
    }

    if (this.step === 'name') {
      this.showNameInput();
      return;
    }

    if (this.step === 'class') {
      const cols = 2;
      const btnW = width / cols - 12;
      const btnH = 16;
      CLASSES.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = 8 + col * (btnW + 6) + btnW / 2;
        const cy = height * 0.56 + row * (btnH + 3);
        this.addButton(this.stepContainer, cx, cy, btnW, btnH, c.name, () => {
          this.classDef = c;
          this.step = 'origin';
          this.renderStep();
        });
      });
      return;
    }

    if (this.step === 'origin') {
      const btnW = width - 16;
      const btnH = 16;
      ORIGINS.forEach((o, i) => {
        const cy = height * 0.5 + i * (btnH + 3);
        this.addButton(this.stepContainer, width / 2, cy, btnW, btnH, o.name, () => {
          this.origin = o;
          this.finishCreation();
        });
      });
      return;
    }
  }

  private showNameInput(): void {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.gap = '10px';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'rgba(20,26,23,0.92)';

    const label = document.createElement('div');
    label.textContent = 'Qual é o seu nome?';
    label.style.color = '#e8dcc4';
    label.style.fontFamily = 'sans-serif';
    label.style.fontSize = '14px';

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 18;
    input.placeholder = 'Nome do personagem';
    input.style.fontSize = '16px';
    input.style.padding = '6px 10px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #c9b98a';
    input.style.background = '#1c2420';
    input.style.color = '#e8dcc4';
    input.style.textAlign = 'center';

    const confirm = document.createElement('button');
    confirm.textContent = 'Continuar';
    confirm.style.padding = '6px 16px';
    confirm.style.borderRadius = '4px';
    confirm.style.border = '1px solid #c9b98a';
    confirm.style.background = '#262e28';
    confirm.style.color = '#e8dcc4';

    const commit = (): void => {
      const trimmed = input.value.trim();
      if (!trimmed) return;
      this.name = trimmed;
      this.step = 'class';
      this.renderStep();
    };
    confirm.addEventListener('click', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
    });

    overlay.appendChild(label);
    overlay.appendChild(input);
    overlay.appendChild(confirm);
    document.body.appendChild(overlay);
    this.nameInput = input;
    (this.nameInput as unknown as { __overlay?: HTMLDivElement }).__overlay = overlay;
    input.focus();
  }

  private removeNameInput(): void {
    const overlay = (this.nameInput as unknown as { __overlay?: HTMLDivElement } | null)?.__overlay;
    overlay?.remove();
    this.nameInput = null;
  }

  private finishCreation(): void {
    const save: SaveDataV3 = loadOrCreateSave();
    const maxHp = 20 + this.classDef.baseAttrs.vigor * 4;
    const arcaneMax = 10 + this.classDef.baseAttrs.mente * 3;

    const character: CharacterSaveState = {
      name: this.name || 'Viajante',
      gender: this.gender,
      appearance: { skinTone: 'clara', hairStyle: 'curto', hairColor: 'castanho', sigilAccent: 'esmeralda' },
      classId: this.classDef.id,
      originId: this.origin.id,
      hp: maxHp,
      maxHp,
      arcaneFocus: arcaneMax,
      arcaneMax,
      tension: 0,
      marca: 0,
      xp: 0,
      level: 1,
    };

    save.character = character;
    save.indole = createInitialIndole();
    save.reputation = createInitialReputation();
    forceSave(save);
    this.scene.start('VarrethOutskirtsScene');
  }
}
