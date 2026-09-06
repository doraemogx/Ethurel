import Phaser from 'phaser';
import { VarrethOutskirtsScene } from '@/world/VarrethOutskirtsScene';
import { GAME_ZOOM, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/core/config';

/**
 * Config do Phaser. Resolução lógica e zoom seguem `src/core/config.ts` —
 * HIPÓTESE a validar visualmente num Android real na Fase 2, não uma decisão
 * congelada (docs/design/02-STACK-E-ARQUITETURA.md §8).
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    zoom: GAME_ZOOM,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#141a17',
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [VarrethOutskirtsScene],
  });
}
