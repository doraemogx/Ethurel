import { createGame } from '@/core/game';

const root = document.getElementById('game-root');
if (!root) {
  throw new Error('Elemento #game-root não encontrado em index.html.');
}

const game = createGame(root);

/**
 * Landscape é a orientação principal de Ethurel — o CSS já esconde o jogo e
 * mostra o pedido de rotação em portrait (index.html). Aqui só pausamos o
 * loop do Phaser nesse estado (economiza bateria/CPU em vez de renderizar
 * atrás de um overlay invisível) e retomamos ao voltar para landscape.
 */
const portraitQuery = window.matchMedia('(orientation: portrait)');
function syncGameLoopToOrientation(isPortrait: boolean): void {
  if (isPortrait) game.loop.sleep();
  else game.loop.wake();
}
syncGameLoopToOrientation(portraitQuery.matches);
portraitQuery.addEventListener('change', (event) => syncGameLoopToOrientation(event.matches));
