/**
 * Controlador central de orientação — corrige o bug em que o overlay de
 * portrait podia ficar preso mesmo depois do aparelho ser girado para
 * landscape. A causa raiz da versão anterior: o estado só era sincronizado
 * uma vez, via `matchMedia('(orientation: portrait)').addEventListener`
 * (main.ts antigo). Isso normalmente dispara certo no Android, mas não é a
 * única fonte de verdade — ficava vulnerável a: o listener de `change` não
 * disparar de forma confiável em todos os WebViews/navegadores Android após
 * a rotação física real (distinto de resize de janela), a barra de
 * endereço/teclado mudando `visualViewport` sem mudar `matchMedia`, e o app
 * voltar de background já na orientação errada sem um evento de mudança.
 *
 * `syncOrientationState()` é idempotente: pode ser chamada por qualquer
 * gatilho (resize, orientationchange, visibilitychange/resume, ou o próprio
 * matchMedia) e sempre deriva o estado ATUAL da viewport comparando
 * innerWidth/innerHeight diretamente — não depende de nenhum evento
 * específico ter dado certo.
 */
export interface OrientationCallbacks {
  onPortrait: () => void;
  onLandscape: () => void;
}

function isPortrait(): boolean {
  // innerWidth/innerHeight refletem a orientação FÍSICA atual de forma
  // confiável em qualquer navegador — ao contrário de screen.orientation
  // (pode não existir) ou matchMedia sozinho (pode não re-disparar).
  return window.innerHeight > window.innerWidth;
}

export function initOrientationController(callbacks: OrientationCallbacks): () => void {
  let lastState: 'portrait' | 'landscape' | null = null;

  const syncOrientationState = (): void => {
    const portrait = isPortrait();
    const next = portrait ? 'portrait' : 'landscape';
    if (next === lastState) return; // idempotente: nada a fazer se não mudou
    lastState = next;
    if (portrait) callbacks.onPortrait();
    else callbacks.onLandscape();
  };

  // Força a primeira avaliação real (lastState começa null).
  syncOrientationState();

  window.addEventListener('resize', syncOrientationState);
  window.addEventListener('orientationchange', syncOrientationState);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncOrientationState();
  });
  if ('visualViewport' in window && window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncOrientationState);
  }
  if ('screen' in window && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', syncOrientationState);
  }
  // matchMedia como mais uma fonte redundante — não a única, mas ajuda em
  // navegadores onde resize não dispara exatamente no frame da rotação.
  const portraitQuery = window.matchMedia('(orientation: portrait)');
  const mqHandler = (): void => syncOrientationState();
  portraitQuery.addEventListener('change', mqHandler);

  return () => {
    window.removeEventListener('resize', syncOrientationState);
    window.removeEventListener('orientationchange', syncOrientationState);
    portraitQuery.removeEventListener('change', mqHandler);
  };
}
