import { createGame } from '@/core/game';
import { initOrientationController } from '@/core/orientation';
import { audioManager } from '@/audio/AudioManager';
import { LOGICAL_HEIGHT, computeLogicalWidth } from '@/core/config';

const root = document.getElementById('game-root');
if (!root) {
  throw new Error('Elemento #game-root não encontrado em index.html.');
}

const game = createGame(root);
audioManager.init(game);

// O Phaser só termina de inicializar (renderer/sistemas/primeira cena) de
// forma assíncrona — dormir o loop (`game.loop.sleep()`) ANTES desse boot
// completar impedia a primeira cena de sequer ser criada. `isReady` evita
// chamar sleep() cedo demais; enquanto o boot não termina e o aparelho já
// está em portrait, o overlay CSS já cobre o canvas de qualquer forma.
let isReady = false;
game.events.once('ready', () => {
  isReady = true;
});

/**
 * Landscape é a orientação principal de Ethurel. `initOrientationController`
 * deriva o estado ATUAL da viewport a cada resize/orientationchange/
 * visibilitychange/matchMedia (ver src/core/orientation.ts) — corrige o bug
 * em que girar fisicamente o aparelho de volta para landscape podia deixar
 * o overlay de portrait preso, porque antes só um listener de matchMedia
 * decidia o estado.
 */
initOrientationController({
  onPortrait: () => {
    document.documentElement.classList.remove('is-landscape');
    document.documentElement.classList.add('is-portrait');
    if (isReady) game.loop.sleep();
  },
  onLandscape: () => {
    document.documentElement.classList.remove('is-portrait');
    document.documentElement.classList.add('is-landscape');
    game.loop.wake();
    // Recalcula a largura lógica a partir da proporção da tela ATUAL — se o
    // jogo faz boot em portrait (comum: o celular pode estar assim ao abrir
    // o link), `computeLogicalWidth()` no boot usa o aspect ratio de
    // portrait (fica preso no mínimo de 240px) e nunca mais seria
    // recalculada sem isto.
    //
    // `refresh()` depois de `resize()` é o que de fato corrige a tela preta
    // que acontecia na PRIMEIRA rotação para landscape após o boot: o
    // #game-root sai de `display:none` (overlay de portrait) exatamente
    // neste instante, e `resize()` sozinho podia deixar o canvas com
    // display CSS 0×0 porque o Scale Manager ainda não tinha recomputado os
    // limites do parent contra o novo tamanho — `refresh()` força essa
    // recomputação. Bug real encontrado durante QA desta build, reproduzível
    // só na primeiríssima rotação (rotações seguintes já funcionavam).
    game.scale.resize(computeLogicalWidth(), LOGICAL_HEIGHT);
    game.scale.refresh();
  },
});
