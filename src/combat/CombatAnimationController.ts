import Phaser from 'phaser';
import type { BattleEvent } from '@/combat/TurnManager';

export interface CombatSprites {
  player: Phaser.GameObjects.Sprite;
  enemy: Phaser.GameObjects.Image;
  camera: Phaser.Cameras.Scene2D.Camera;
}

export interface PlayerAnimFrames {
  idle: number[];
  attack: number;
  hurt: number;
  death: number;
}

/**
 * Consome a lista de `BattleEvent` (já decidida pela lógica em
 * `TurnManager`) e só REPRESENTA visualmente o que já aconteceu — nunca
 * decide dano (spec §17/§19). Pipeline por golpe: input bloqueia (quem
 * chama já cuida disso) → animação de ataque → impacto/hit-flash →
 * partícula → damage number → pequeno camera shake → volta ao idle.
 */
export class CombatAnimationController {
  private idleTimer: Phaser.Time.TimerEvent | null = null;
  private idleFrameIdx = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sprites: CombatSprites,
    private readonly playerFrames: PlayerAnimFrames
  ) {}

  startIdle(): void {
    this.idleTimer?.remove();
    this.idleFrameIdx = 0;
    this.idleTimer = this.scene.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        this.idleFrameIdx = (this.idleFrameIdx + 1) % this.playerFrames.idle.length;
        this.sprites.player.setFrame(this.playerFrames.idle[this.idleFrameIdx]);
      },
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.scene.time.delayedCall(ms, resolve));
  }

  private damageNumber(x: number, y: number, amount: number, color: string): void {
    const text = this.scene.add
      .text(x, y, `${amount}`, { fontFamily: 'sans-serif', fontSize: '16px', color, fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(5000);
    this.scene.tweens.add({
      targets: text,
      y: y - 22,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  private shake(): void {
    this.sprites.camera.shake(120, 0.006);
  }

  /**
   * VFX de Arcane — orgânico/pulsante (veios esmeralda, não elétrico/roxo),
   * reaproveitando a paleta já estabelecida para Arcane no mundo (pedra com
   * veio verde em VarrethOutskirtsScene). Distinto do golpe físico: em vez
   * de um flash branco seco, um pulso de "veios" crescendo e desvanecendo.
   */
  private arcaneBurst(): void {
    const target = this.sprites.enemy;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const startX = target.x + Math.cos(angle) * 4;
      const startY = target.y - target.displayHeight * 0.5 + Math.sin(angle) * 4;
      const vein = this.scene.add.circle(startX, startY, 2, 0x6fae7a, 0.8).setDepth(4800).setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({
        targets: vein,
        x: target.x + Math.cos(angle) * 20,
        y: target.y - target.displayHeight * 0.5 + Math.sin(angle) * 20,
        radius: 0.5,
        alpha: 0,
        duration: 380,
        ease: 'Cubic.easeOut',
        onComplete: () => vein.destroy(),
      });
    }
    const pulse = this.scene.add.circle(target.x, target.y - target.displayHeight * 0.5, 4, 0x6fae7a, 0.5).setDepth(4790).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({ targets: pulse, radius: 26, alpha: 0, duration: 340, ease: 'Sine.easeOut', onComplete: () => pulse.destroy() });
  }

  private hitFlash(target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite): void {
    target.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => target.clearTint());
  }

  private targetSprite(targetId: string): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite {
    return targetId === 'player' ? this.sprites.player : this.sprites.enemy;
  }

  private targetWorldPos(targetId: string): { x: number; y: number } {
    const s = this.targetSprite(targetId);
    return { x: s.x, y: s.y - s.displayHeight * 0.6 };
  }

  /** Processa os eventos em ordem, aguardando cada etapa — retorna quando a
   * representação visual do round inteiro termina. */
  async playEvents(events: BattleEvent[]): Promise<void> {
    for (const event of events) {
      switch (event.kind) {
        case 'attack': {
          this.idleTimer?.remove();
          if (event.casterId === 'player') {
            this.sprites.player.setFrame(this.playerFrames.attack);
            if (event.ability) this.arcaneBurst();
            await this.wait(event.ability ? 320 : 180);
          } else {
            this.scene.tweens.add({ targets: this.sprites.enemy, x: this.sprites.enemy.x - 10, duration: 90, yoyo: true });
            await this.wait(180);
          }
          break;
        }
        case 'damage': {
          const sprite = this.targetSprite(event.targetId);
          this.hitFlash(sprite);
          const pos = this.targetWorldPos(event.targetId);
          this.damageNumber(pos.x, pos.y, event.amount, event.targetId === 'player' ? '#ff6b6b' : '#ffe066');
          this.shake();
          if (event.targetId === 'player') {
            this.sprites.player.setFrame(this.playerFrames.hurt);
          }
          await this.wait(260);
          this.startIdle();
          break;
        }
        case 'tension': {
          await this.wait(60);
          break;
        }
        case 'death': {
          const sprite = this.targetSprite(event.targetId);
          if (event.targetId === 'player') {
            this.sprites.player.setFrame(this.playerFrames.death);
          } else {
            this.scene.tweens.add({ targets: sprite, alpha: 0, scale: 0.7, duration: 500, ease: 'Cubic.easeIn' });
          }
          await this.wait(550);
          break;
        }
        case 'message':
        case 'victory':
        case 'defeat':
          break;
      }
    }
  }

  destroy(): void {
    this.idleTimer?.remove();
  }
}
