import Phaser from 'phaser';
import type { ClassDefinition } from '@/classes/types';
import type { Enemy } from '@/combat/types';
import { createEnemyCombatant, createPlayerCombatant } from '@/combat/Combatant';
import { createBattleState, type BattleState } from '@/combat/BattleState';
import { TurnManager, type PlayerAction } from '@/combat/TurnManager';
import { CombatAnimationController } from '@/combat/CombatAnimationController';
import { BattleHUD, type BattleMenuChoice } from '@/combat/BattleHUD';
import { audioManager } from '@/audio/AudioManager';

export const DARK_KNIGHT_KEY = 'ansimuz-dark-knight';
export const DARK_KNIGHT_URL = 'assets/ansimuz/characters/dark-knight.png';
export const SLIME_KEY = 'ansimuz-slime';
export const SLIME_URL = 'assets/ansimuz/battle/slime.png';
export const HAZY_HILLS_KEY = 'ansimuz-hazy-hills';
export const HAZY_HILLS_URL = 'assets/ansimuz/battle/hazy-hills.png';

export interface BattleResult {
  victory: boolean;
  xpGained: number;
  playerHpAfter: number;
  playerTensionAfter: number;
}

export interface BattleSceneData {
  playerName: string;
  vigor: number;
  hp: number;
  maxHp: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
  classDef: ClassDefinition;
  enemy: Enemy;
  onDone: (result: BattleResult) => void;
}

/** Frames de `dark-knight.png` (folha 8×3 de 48×48px, ver CREDITS.md) —
 * idle usa o ciclo completo da 1ª fileira (capa balançando); ataque/hurt/
 * morte vêm da 3ª fileira, confirmados também pelos previews idle.gif/
 * walk.gif/attack.gif incluídos no pacote original. */
const DK_COLS = 8;
const DK_IDLE = [0, 1, 2, 3, 4, 5, 6, 7];
const DK_ATTACK = 2 * DK_COLS + 2;
const DK_HURT = 2 * DK_COLS + 3;
const DK_DEATH = 2 * DK_COLS + 4;

export class BattleScene extends Phaser.Scene {
  private sceneData!: BattleSceneData;
  private battle!: BattleState;
  private turnManager!: TurnManager;
  private hud!: BattleHUD;
  private anim!: CombatAnimationController;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Image;
  private busy = false;

  constructor() {
    super('BattleScene');
  }

  init(data: BattleSceneData): void {
    this.sceneData = data;
  }

  preload(): void {
    this.load.spritesheet(DARK_KNIGHT_KEY, DARK_KNIGHT_URL, { frameWidth: 48, frameHeight: 48 });
    this.load.image(SLIME_KEY, SLIME_URL);
    this.load.image(HAZY_HILLS_KEY, HAZY_HILLS_URL);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, HAZY_HILLS_KEY).setDisplaySize(width, height);

    audioManager.playMusic('battle-encounter', { loop: true });

    const player = createPlayerCombatant({
      name: this.sceneData.playerName,
      vigor: this.sceneData.vigor,
      hp: this.sceneData.hp,
      maxHp: this.sceneData.maxHp,
      arcaneFocus: this.sceneData.arcaneFocus,
      arcaneMax: this.sceneData.arcaneMax,
      tension: this.sceneData.tension,
    });
    const enemy = createEnemyCombatant(this.sceneData.enemy.id, this.sceneData.enemy.name, this.sceneData.enemy.stats.hp, this.sceneData.enemy.stats.atk, this.sceneData.enemy.stats.def);
    this.battle = createBattleState(player, enemy);
    this.turnManager = new TurnManager(this.battle, this.sceneData.classDef.passives, this.sceneData.classDef.tensionMult);

    this.playerSprite = this.add.sprite(width * 0.28, height * 0.72, DARK_KNIGHT_KEY, DK_IDLE[0]).setScale(1.6);
    this.enemySprite = this.add.image(width * 0.72, height * 0.62, SLIME_KEY).setScale(1.4);
    this.enemySprite.setFlipX(true);

    this.anim = new CombatAnimationController(
      this,
      { player: this.playerSprite, enemy: this.enemySprite, camera: this.cameras.main },
      { idle: DK_IDLE, attack: DK_ATTACK, hurt: DK_HURT, death: DK_DEATH }
    );
    this.anim.startIdle();

    this.hud = new BattleHUD(this);
    this.hud.setAbilities(this.sceneData.classDef.abilities);
    this.hud.refresh(player, enemy);
    this.hud.onMenuChoice((choice) => void this.handleMenuChoice(choice));

    void this.runIntro();
  }

  private async runIntro(): Promise<void> {
    this.hud.setEnabled(false);
    this.hud.appendLog(`Um ${this.battle.enemy.name.toLowerCase()} bloqueia o caminho!`);
    const startEvents = this.turnManager.runCombatStartTriggers();
    await this.anim.playEvents(startEvents);
    for (const e of startEvents) if (e.kind === 'message') this.hud.appendLog(e.text);
    this.hud.setEnabled(true);
  }

  private async handleMenuChoice(choice: BattleMenuChoice): Promise<void> {
    if (this.busy) return;
    let action: PlayerAction | null = null;
    if (choice.type === 'basicAttack') action = { type: 'basicAttack' };
    else if (choice.type === 'ability') action = { type: 'ability', ability: choice.ability };
    else if (choice.type === 'defend') action = { type: 'defend' };
    else if (choice.type === 'flee') action = { type: 'flee' };
    else return; // 'openAbilities'/'back' já tratados no HUD sem gerar ação

    this.busy = true;
    this.hud.setEnabled(false);
    const events = this.turnManager.runRound(action);
    await this.anim.playEvents(events);
    for (const e of events) if (e.kind === 'message') this.hud.appendLog(e.text);
    this.hud.refresh(this.battle.player, this.battle.enemy);

    if (this.battle.phase === 'victory') {
      this.hud.appendLog('Vitória!');
      audioManager.stopMusic();
      this.time.delayedCall(900, () => {
        this.sceneData.onDone({
          victory: true,
          xpGained: this.sceneData.enemy.xp,
          playerHpAfter: this.battle.player.hp,
          playerTensionAfter: this.battle.player.tension,
        });
      });
      return;
    }
    if (this.battle.phase === 'defeat' || action.type === 'flee') {
      audioManager.stopMusic();
      this.time.delayedCall(action.type === 'flee' ? 300 : 900, () => {
        this.sceneData.onDone({
          victory: false,
          xpGained: 0,
          playerHpAfter: Math.max(1, this.battle.player.hp),
          playerTensionAfter: this.battle.player.tension,
        });
      });
      return;
    }

    this.busy = false;
    this.hud.buildMainMenu();
    this.hud.setEnabled(true);
  }
}
