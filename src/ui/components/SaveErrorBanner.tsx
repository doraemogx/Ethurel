import { useEffect, useState } from 'react';
import { subscribeSaveFailure, type SaveFailureEvent } from '@/save/saveFailureBus';

/**
 * Feedback visível de falha de gravação (Fase 2 §11) — antes, uma falha de
 * `saveStore.save()` (quota excedida, modo privado, storage bloqueado) só
 * gerava `console.warn`; o jogador continuava jogando sem saber que nada
 * estava sendo salvo. Montado uma vez na raiz do app (`App.tsx`), fora do
 * `GameProvider` de propósito — falhas podem acontecer também na criação de
 * personagem, antes do provider existir.
 */
export function SaveErrorBanner() {
  const [failure, setFailure] = useState<SaveFailureEvent | null>(null);

  useEffect(() => subscribeSaveFailure(setFailure), []);

  if (!failure) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--danger)',
        color: '#fff',
        fontSize: 12,
        padding: '8px 14px',
        textAlign: 'center',
        lineHeight: 1.4,
      }}
    >
      Não foi possível salvar o progresso — verifique o espaço de armazenamento do dispositivo ou se o navegador está em modo privado. O jogo continua, mas o progresso pode se perder ao fechar.
    </div>
  );
}
