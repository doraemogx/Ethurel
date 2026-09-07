import type { InterpretedAction, NarrativeContext, NarrativeProvider, NarrativeRequest, NarrativeResponse } from '@/ai/NarrativeProvider';
import { validateNarrativeResponse, validateInterpretedAction } from '@/ai/responseSchema';

/**
 * Provider remoto — cliente pronto para um backend real; arquitetura do
 * backend em si documentada em `docs/architecture/remote-narrative-backend.md`
 * (Fase 2 §10). Este arquivo NÃO contém — e nunca deve conter — nenhuma
 * chave de API de provedor de IA (Anthropic/OpenAI/etc). Ele só fala com um
 * PROXY/backend próprio (`VITE_NARRATIVE_PROXY_URL`), que guarda a chave do
 * lado do servidor. O código do proxy (Cloudflare Worker, pronto para
 * deploy) está em `server/narrative-proxy/` — não deployado por esta
 * sessão, por não haver credencial real disponível aqui (ver o documento de
 * arquitetura para o que falta fazer para ativar).
 *
 * Sem `VITE_NARRATIVE_PROXY_URL` configurada, `isAvailable` é `false` e o
 * app usa `LocalNarrativeProvider` — nunca trava, nunca mostra erro técnico
 * feio (spec §63: mostrar "Narrativa offline" no lugar).
 */

const TIMEOUT_MS = 12_000;
const MAX_RETRIES = 1;
const RETRY_BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Erros de rede/5xx são retentáveis (podem ser transitórios); 4xx não é —
 * um payload inválido não vira válido tentando de novo. */
function isRetryableStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

/** Marca um erro como definitivo (ex.: 4xx) para o loop de retry não o
 * tratar como falha transitória de rede. */
class NonRetryableError extends Error {}

export class RemoteNarrativeProvider implements NarrativeProvider {
  private readonly proxyUrl: string | null;

  constructor(proxyUrl: string | null = import.meta.env.VITE_NARRATIVE_PROXY_URL ?? null) {
    this.proxyUrl = proxyUrl || null;
  }

  get isAvailable(): boolean {
    return this.proxyUrl !== null;
  }

  private async postWithRetry(body: unknown): Promise<unknown> {
    if (!this.proxyUrl) throw new Error('RemoteNarrativeProvider sem proxy configurado.');
    const url = this.proxyUrl;

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutHandle);

        if (!res.ok) {
          if (!isRetryableStatus(res.status)) {
            throw new NonRetryableError(`Proxy de narrativa respondeu ${res.status}`);
          }
          throw new Error(`Proxy de narrativa respondeu ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        clearTimeout(timeoutHandle);
        if (err instanceof NonRetryableError) throw err;
        lastError = err;
        // AbortError (timeout) e falha de rede/5xx são retentáveis, na mesma janela de tentativas.
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Falha desconhecida ao chamar o proxy de narrativa.');
  }

  async requestNarration(request: NarrativeRequest): Promise<NarrativeResponse> {
    const json = await this.postWithRetry({ type: 'narration', request });
    const validated = validateNarrativeResponse(json);
    if (!validated) throw new Error('Resposta da IA fora do contrato esperado.');
    return validated;
  }

  async interpretFreeText(text: string, context: NarrativeContext): Promise<InterpretedAction> {
    const json = await this.postWithRetry({ type: 'interpret', text, context });
    const validated = validateInterpretedAction(json);
    if (!validated) throw new Error('Resposta da IA fora do contrato esperado.');
    return validated;
  }
}
