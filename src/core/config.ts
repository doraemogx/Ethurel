/**
 * Constantes de resolução lógica/escala — tratadas como HIPÓTESE a validar
 * visualmente num Android real (docs/design/02-STACK-E-ARQUITETURA.md §8),
 * não uma decisão congelada. Centralizadas aqui (em vez de duplicadas em
 * game.ts e nas cenas) para mudar num único lugar quando a Fase 2 validar
 * outro valor.
 */
export const LOGICAL_WIDTH = 320;
export const LOGICAL_HEIGHT = 180;
export const GAME_ZOOM = 3;
export const TILE_SIZE = 16;
