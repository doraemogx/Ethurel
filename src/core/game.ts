import Phaser from 'phaser';
import { BootScene } from '@/core/BootScene';

/**
 * Config do Phaser. Resolução lógica 320×180 e zoom 3 seguem a especificação
 * inicial de docs/design/02-STACK-E-ARQUITETURA.md §8 — tratada como HIPÓTESE
 * a validar visualmente num Android real na Fase 2, não uma decisão congelada.
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 320,
    height: 180,
    zoom: 3,
    pixelArt: true,
    backgroundColor: '#141a17',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene],
  });
}
