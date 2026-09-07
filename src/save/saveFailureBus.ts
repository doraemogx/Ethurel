/**
 * Feedback de falha de gravação (Fase 2 §11) — antes desta rodada, uma
 * falha de `saveStore.save()` (quota excedida, modo privado bloqueando
 * localStorage, storage desabilitado) só gerava `console.warn` dentro de
 * `SaveStore` — o jogador nunca ficava sabendo que o progresso não foi
 * salvo. Este módulo é um pub-sub mínimo (sem dependência de UI) que
 * `writeNow` (`src/save/gameSave.ts`) usa para notificar; qualquer
 * componente pode assinar sem acoplar `gameSave.ts` a React.
 */
export interface SaveFailureEvent {
  slot: string;
  timestamp: number;
}

type Listener = (event: SaveFailureEvent | null) => void;

const listeners = new Set<Listener>();

/** `event === null` significa "a última gravação teve sucesso, qualquer
 * aviso anterior pode ser limpo" — emitido depois de uma falha seguida de
 * sucesso, para a UI não ficar mostrando um erro já resolvido. */
export function emitSaveFailure(event: SaveFailureEvent | null): void {
  for (const listener of listeners) listener(event);
}

export function subscribeSaveFailure(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
