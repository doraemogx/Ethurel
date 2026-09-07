import Phaser from 'phaser';
import { drawPanel, drawButton } from '@/ui/Panel';
import type { CombatantState } from '@/combat/Combatant';
import type { Ability } from '@/effects/types';

export type BattleMenuChoice =
  | { type: 'basicAttack' }
  | { type: 'openAbilities' }
  | { type: 'ability'; ability: Ability }
  | { type: 'back' }
  | { type: 'defend' }
  | { type: 'flee' };

/** HUD de combate mobile landscape: HP/Foco/Tensão do jogador, HP do
 * inimigo, menu de ações compacto (Atacar/Habilidades/Item/Defender/Fugir). */
export class BattleHUD {
  private readonly container: Phaser.GameObjects.Container;
  private readonly playerHpText: Phaser.GameObjects.Text;
  private readonly playerHpBar: Phaser.GameObjects.Graphics;
  private readonly focusText: Phaser.GameObjects.Text;
  private readonly tensionText: Phaser.GameObjects.Text;
  private readonly enemyHpText: Phaser.GameObjects.Text;
  private readonly enemyHpBar: Phaser.GameObjects.Graphics;
  private readonly enemyNameText: Phaser.GameObjects.Text;
  private readonly logText: Phaser.GameObjects.Text;
  private readonly menuContainer: Phaser.GameObjects.Container;
  private onChoice: ((choice: BattleMenuChoice) => void) | null = null;
  private abilities: Ability[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    const topGfx = scene.add.graphics();
    drawPanel(topGfx, 0, 0, width, 24, 0.9);
    this.playerHpBar = scene.add.graphics();
    this.playerHpText = scene.add.text(4, 3, '', { fontFamily: 'sans-serif', fontSize: '7px', color: '#e8dcc4' });
    this.focusText = scene.add.text(4, 13, '', { fontFamily: 'sans-serif', fontSize: '7px', color: '#8fc7e8' });
    this.tensionText = scene.add.text(70, 13, '', { fontFamily: 'sans-serif', fontSize: '7px', color: '#a8d98a' });
    this.enemyNameText = scene.add.text(width - 4, 3, '', { fontFamily: 'sans-serif', fontSize: '7px', color: '#e8dcc4' }).setOrigin(1, 0);
    this.enemyHpText = scene.add.text(width - 4, 13, '', { fontFamily: 'sans-serif', fontSize: '7px', color: '#e8dcc4' }).setOrigin(1, 0);
    this.enemyHpBar = scene.add.graphics();

    this.logText = scene.add.text(4, height - 46, '', {
      fontFamily: 'sans-serif',
      fontSize: '7px',
      color: '#c9b98a',
      wordWrap: { width: width - 100 },
    });

    this.menuContainer = scene.add.container(width - 90, height - 46);
    this.buildMainMenu();

    this.container = scene.add.container(0, 0, [
      topGfx,
      this.playerHpBar,
      this.playerHpText,
      this.focusText,
      this.tensionText,
      this.enemyNameText,
      this.enemyHpText,
      this.enemyHpBar,
      this.logText,
      this.menuContainer,
    ]);
    this.container.setDepth(4500);
  }

  onMenuChoice(cb: (choice: BattleMenuChoice) => void): void {
    this.onChoice = cb;
  }

  setAbilities(abilities: Ability[]): void {
    this.abilities = abilities;
  }

  private clearMenu(): void {
    this.menuContainer.removeAll(true);
  }

  private addMenuButton(index: number, label: string, onClick: () => void): void {
    const w = 84;
    const h = 15;
    const y = index * (h + 2);
    const g = this.scene.add.graphics();
    drawButton(g, 0, 0, w, h);
    const t = this.scene.add.text(w / 2, h / 2, label, { fontFamily: 'sans-serif', fontSize: '7px', color: '#e8dcc4' }).setOrigin(0.5);
    const c = this.scene.add.container(0, y, [g, t]);
    c.setSize(w, h);
    // Ver nota em InteractionPrompt.ts: hitArea de Container precisa começar
    // em (w/2,h/2) para filhos desenhados a partir de (0,0).
    c.setInteractive(new Phaser.Geom.Rectangle(w / 2, h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', onClick);
    this.menuContainer.add(c);
  }

  buildMainMenu(): void {
    this.clearMenu();
    this.addMenuButton(0, 'Atacar', () => this.onChoice?.({ type: 'basicAttack' }));
    this.addMenuButton(1, 'Habilidades', () => this.buildAbilityMenu());
    this.addMenuButton(2, 'Item (vazio)', () => {});
    this.addMenuButton(3, 'Defender', () => this.onChoice?.({ type: 'defend' }));
    this.addMenuButton(4, 'Fugir', () => this.onChoice?.({ type: 'flee' }));
  }

  private buildAbilityMenu(): void {
    this.clearMenu();
    this.abilities.forEach((ability, i) => {
      this.addMenuButton(i, `${ability.name} (${ability.cost})`, () => this.onChoice?.({ type: 'ability', ability }));
    });
    this.addMenuButton(this.abilities.length, 'Voltar', () => this.buildMainMenu());
  }

  setEnabled(enabled: boolean): void {
    this.menuContainer.setAlpha(enabled ? 1 : 0.4);
    this.menuContainer.each((child: Phaser.GameObjects.Container) => {
      if (enabled) child.setInteractive();
      else child.disableInteractive();
    });
  }

  appendLog(text: string): void {
    const lines = this.logText.text ? this.logText.text.split('\n') : [];
    lines.push(text);
    while (lines.length > 3) lines.shift();
    this.logText.setText(lines.join('\n'));
  }

  refresh(player: CombatantState, enemy: CombatantState): void {
    this.playerHpText.setText(`${player.name}  HP ${player.hp}/${player.maxHp}`);
    this.focusText.setText(`Foco ${player.arcaneFocus}/${player.arcaneMax}`);
    this.tensionText.setText(`Tensão ${player.tension}`);
    this.enemyNameText.setText(enemy.name);
    this.enemyHpText.setText(`HP ${enemy.hp}/${enemy.maxHp}`);

    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0x2a1f1a, 1).fillRect(4, 22, 100, 3);
    this.playerHpBar.fillStyle(0x7fae5a, 1).fillRect(4, 22, 100 * Math.max(0, player.hp / player.maxHp), 3);

    const { width } = this.scene.scale;
    this.enemyHpBar.clear();
    this.enemyHpBar.fillStyle(0x2a1f1a, 1).fillRect(width - 104, 22, 100, 3);
    this.enemyHpBar.fillStyle(0xc96a4a, 1).fillRect(width - 104, 22, 100 * Math.max(0, enemy.hp / enemy.maxHp), 3);
  }

  destroy(): void {
    this.container.destroy();
  }
}
