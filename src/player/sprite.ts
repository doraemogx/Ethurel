import Phaser from 'phaser';
import type { CharacterAnimationSet } from '@/player/animation';
import type { Gender } from '@/player/types';

/**
 * Sprite real do jogador/NPCs — Mighty Pack (RPG Maker VX Ace resource),
 * licença confirmada (ver CREDITS.md): "Vx ace/Characters/Actors_1.png".
 * Substitui o placeholder procedural do ciclo anterior.
 *
 * Formato padrão RPG Maker VX Ace charset: folha de 384×336px, 8 personagens
 * em grade 4×2, cada um ocupando um bloco de 3 colunas (passo-esquerdo,
 * parado, passo-direito) × 4 linhas (baixo, esquerda, direita, cima), frame
 * de 32×42px. Índices confirmados por inspeção visual direta do arquivo
 * recebido antes de uso (ver CREDITS.md).
 */
export const PLAYER_TEXTURE_KEY = 'mighty-actors1';
export const PLAYER_TEXTURE_URL = 'assets/mighty/characters/actors1.png';

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 42;
const SHEET_COLS = 12; // 384 / 32

export const PLAYER_FRAME_WIDTH = FRAME_WIDTH;
export const PLAYER_FRAME_HEIGHT = FRAME_HEIGHT;

/** Posição (em blocos de 3 colunas / 4 linhas) de cada personagem escolhido
 * nesta folha — ver captura em CREDITS.md. Bloco C (colunas 6-8, linhas 0-3):
 * soldado de elmo azul. Bloco E (colunas 0-2, linhas 4-7): mulher de cabelo
 * castanho e vestido roxo. */
const GENDER_BLOCK: Record<Gender, { colStart: number; rowStart: number }> = {
  homem: { colStart: 6, rowStart: 0 },
  mulher: { colStart: 0, rowStart: 4 },
};

/** Ordem de linha padrão VX Ace dentro de cada bloco: baixo, esquerda, direita, cima. */
const DIRECTION_ROW_OFFSET = { down: 0, left: 1, right: 2, up: 3 } as const;
const WALK_COLS = [0, 1, 2] as const; // passo-esquerdo, parado, passo-direito
const STAND_COL = 1;

function frameIndex(colStart: number, rowStart: number, colOffset: number, rowOffset: number): number {
  const col = colStart + colOffset;
  const row = rowStart + rowOffset;
  return row * SHEET_COLS + col;
}

export function ensurePlayerTexture(scene: Phaser.Scene): void {
  // Textura vem de `preload()` (scene.load.spritesheet) — nada a gerar aqui;
  // função mantida por compatibilidade de API com quem já a chamava.
  if (!scene.textures.exists(PLAYER_TEXTURE_KEY)) {
    console.warn(`[player/sprite] Textura "${PLAYER_TEXTURE_KEY}" não carregada — verifique preload().`);
  }
}

export function buildAnimationSetForGender(gender: Gender): CharacterAnimationSet {
  const { colStart, rowStart } = GENDER_BLOCK[gender];
  const walkFrames = (dir: keyof typeof DIRECTION_ROW_OFFSET) =>
    WALK_COLS.map((c) => frameIndex(colStart, rowStart, c, DIRECTION_ROW_OFFSET[dir]));

  return {
    idle: {
      frames: [frameIndex(colStart, rowStart, STAND_COL, DIRECTION_ROW_OFFSET.down)],
      frameDurationMs: 600,
      loop: true,
    },
    walkDown: { frames: walkFrames('down'), frameDurationMs: 150, loop: true },
    walkUp: { frames: walkFrames('up'), frameDurationMs: 150, loop: true },
    walkLeft: { frames: walkFrames('left'), frameDurationMs: 150, loop: true },
    walkRight: { frames: walkFrames('right'), frameDurationMs: 150, loop: true },
  };
}

/** Frame estático (parado, de frente) — usado em previews de criação de
 * personagem sem precisar montar um sprite animado completo. */
export function standingFrameForGender(gender: Gender): number {
  const { colStart, rowStart } = GENDER_BLOCK[gender];
  return frameIndex(colStart, rowStart, STAND_COL, DIRECTION_ROW_OFFSET.down);
}
