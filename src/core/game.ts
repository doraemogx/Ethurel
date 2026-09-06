import Phaser from 'phaser';
import { VarrethOutskirtsScene } from '@/world/VarrethOutskirtsScene';
import { GAME_ZOOM, LOGICAL_HEIGHT, computeLogicalWidth } from '@/core/config';

/**
 * Config do Phaser. Altura lógica e tile size seguem `src/core/config.ts`
 * (validados na Fase 2); a LARGURA lógica é calculada a partir da proporção
 * real da tela no momento do boot, para eliminar letterboxing em landscape
 * ultrawide sem esticar/cortar pixel art — ver comentário em `config.ts`.
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: computeLogicalWidth(),
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
