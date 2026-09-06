import { createGame } from '@/core/game';

const root = document.getElementById('game-root');
if (!root) {
  throw new Error('Elemento #game-root não encontrado em index.html.');
}

createGame(root);
