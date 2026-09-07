import type { NarrativeContext, NarrativeProvider, NarrativeRequest, NarrativeResponse } from '@/ai/NarrativeProvider';
import { LocalNarrativeProvider } from '@/ai/LocalNarrativeProvider';
import { RemoteNarrativeProvider } from '@/ai/RemoteNarrativeProvider';

export type NarrativeConnectionState = 'local' | 'remote';

/**
 * Ponto único de acesso à narrativa — tenta o provider remoto (se
 * configurado) e cai para o local em qualquer falha, sem nunca travar o
 * jogo nem mostrar erro técnico (spec §63). `connectionState` alimenta o
 * indicador "Conectado / Narrativa offline" da UI.
 */
export class NarrativeEngine {
  private readonly local = new LocalNarrativeProvider();
  private readonly remote: NarrativeProvider;

  constructor(remote: NarrativeProvider = new RemoteNarrativeProvider()) {
    this.remote = remote;
  }

  get connectionState(): NarrativeConnectionState {
    return this.remote.isAvailable ? 'remote' : 'local';
  }

  async requestNarration(request: NarrativeRequest): Promise<NarrativeResponse> {
    if (this.remote.isAvailable) {
      try {
        return await this.remote.requestNarration(request);
      } catch {
        // cai para local silenciosamente — spec §63.
      }
    }
    return this.local.requestNarration(request);
  }

  async interpretFreeText(text: string, context: NarrativeContext) {
    if (this.remote.isAvailable) {
      try {
        return await this.remote.interpretFreeText(text, context);
      } catch {
        // cai para local.
      }
    }
    return this.local.interpretFreeText(text, context);
  }
}

export const narrativeEngine = new NarrativeEngine();
