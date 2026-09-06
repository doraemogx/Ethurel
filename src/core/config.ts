/**
 * Resolução lógica/escala — hipótese validada funcionalmente num Android real
 * na Fase 2 (320×180, tile 16px), mas o letterboxing em telas landscape muito
 * largas (ex.: 20:9) foi registrado como problema a corrigir neste ciclo
 * (docs/design/05-DIRECAO-DE-ARTE.md).
 *
 * Correção: a ALTURA lógica fica fixa (180px, mantém tile size e escala do
 * personagem já validados), mas a LARGURA lógica passa a ser calculada a
 * partir da proporção real da tela no momento do boot — ou seja, o mundo
 * mostrado horizontalmente varia (mostra mais ou menos cenário) para que o
 * canvas preencha a tela sem faixas pretas, em vez de esticar/cortar pixel
 * art. Isso é o padrão comum em jogos mobile 2D com proporção de tela
 * variável ("fixed height, variable width").
 */
export const LOGICAL_HEIGHT = 180;
export const GAME_ZOOM = 3;
export const TILE_SIZE = 16;

/** Largura lógica padrão (16:9) — usada só como fallback antes do boot real
 * (ex.: SSR/testes) ou se `window` não estiver disponível. */
export const DEFAULT_LOGICAL_WIDTH = 320;

const MIN_LOGICAL_WIDTH = 240;
const MAX_LOGICAL_WIDTH = 480;

/** Calcula a largura lógica a partir da proporção real da janela/tela no
 * momento da chamada — chamar de novo em resize/orientationchange se o jogo
 * precisar se readaptar (hoje só é chamado uma vez, no boot). */
export function computeLogicalWidth(): number {
  if (typeof window === 'undefined' || !window.innerWidth || !window.innerHeight) {
    return DEFAULT_LOGICAL_WIDTH;
  }
  const aspect = window.innerWidth / window.innerHeight;
  const width = Math.round(LOGICAL_HEIGHT * aspect);
  return Math.max(MIN_LOGICAL_WIDTH, Math.min(MAX_LOGICAL_WIDTH, width));
}
