import type { InterpretedAction, NarrativeContext, NarrativeProvider, NarrativeRequest, NarrativeResponse } from '@/ai/NarrativeProvider';
import { validateNarrativeResponse } from '@/ai/responseSchema';

/**
 * Provider remoto — arquitetura pronta, NÃO ativado por padrão nesta build.
 *
 * REGRA DE SEGURANÇA (spec §7, inegociável): nenhuma chave de API de
 * provedor de IA (Anthropic/OpenAI/etc.) é colocada neste cliente, no
 * bundle, no repo, no localStorage ou em query string. Este provider NUNCA
 * chama a API de um provedor de IA diretamente do navegador — ele só fala
 * com um PROXY/backend próprio (`VITE_NARRATIVE_PROXY_URL`), que é quem
 * guardaria a chave do lado do servidor. Construir e hospedar esse backend
 * está fora do escopo desta sessão (sem infraestrutura de servidor
 * disponível neste ambiente) — o que existe aqui é o contrato/cliente,
 * pronto para apontar para um proxy real quando ele existir.
 *
 * Sem `VITE_NARRATIVE_PROXY_URL` configurada, `isAvailable` é `false` e o
 * app usa `LocalNarrativeProvider` — nunca trava, nunca mostra erro técnico
 * feio (spec §63: mostrar "Narrativa offline" no lugar).
 */
export class RemoteNarrativeProvider implements NarrativeProvider {
  private readonly proxyUrl: string | null;

  constructor(proxyUrl: string | null = import.meta.env.VITE_NARRATIVE_PROXY_URL ?? null) {
    this.proxyUrl = proxyUrl || null;
  }

  get isAvailable(): boolean {
    return this.proxyUrl !== null;
  }

  async requestNarration(request: NarrativeRequest): Promise<NarrativeResponse> {
    if (!this.proxyUrl) throw new Error('RemoteNarrativeProvider sem proxy configurado.');
    const res = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'narration', request }),
    });
    if (!res.ok) throw new Error(`Proxy de narrativa respondeu ${res.status}`);
    const json = await res.json();
    const validated = validateNarrativeResponse(json);
    if (!validated) throw new Error('Resposta da IA fora do contrato esperado.');
    return validated;
  }

  async interpretFreeText(text: string, context: NarrativeContext): Promise<InterpretedAction> {
    if (!this.proxyUrl) throw new Error('RemoteNarrativeProvider sem proxy configurado.');
    const res = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'interpret', text, context }),
    });
    if (!res.ok) throw new Error(`Proxy de narrativa respondeu ${res.status}`);
    return (await res.json()) as InterpretedAction;
  }
}
