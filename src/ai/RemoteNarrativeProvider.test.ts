import { describe, it, expect, vi, afterEach } from 'vitest';
import { RemoteNarrativeProvider } from '@/ai/RemoteNarrativeProvider';

const VALID_NARRATIVE_RESPONSE = { narration: 'Você chega em Varreth.', mood: 'neutral', suggestedActions: [], requestedChecks: [] };
const VALID_INTERPRETED_ACTION = { kind: 'possible', reason: 'Você faz o que descreveu.' };

describe('RemoteNarrativeProvider — honestidade de disponibilidade (spec §17/§27)', () => {
  it('sem proxy configurado, isAvailable é false (o app deve cair para LocalNarrativeProvider)', () => {
    const provider = new RemoteNarrativeProvider(null);
    expect(provider.isAvailable).toBe(false);
  });

  it('com proxy configurado, isAvailable passa a true (não é uma chave de API — é só uma URL de backend próprio)', () => {
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    expect(provider.isAvailable).toBe(true);
  });

  it('sem proxy, chamar requestNarration/interpretFreeText rejeita em vez de fingir sucesso', async () => {
    const provider = new RemoteNarrativeProvider(null);
    await expect(
      provider.requestNarration({ kind: 'scene', context: {} as never })
    ).rejects.toThrow();
    await expect(provider.interpretFreeText('teste', {} as never)).rejects.toThrow();
  });
});

describe('RemoteNarrativeProvider — validação, retry e timeout (Fase 2 §10)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('resposta válida do proxy passa pela validação e chega normalmente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => VALID_NARRATIVE_RESPONSE }));
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    const result = await provider.requestNarration({ kind: 'scene', context: {} as never });
    expect(result.narration).toBe('Você chega em Varreth.');
  });

  it('interpretFreeText valida a resposta — payload fora do contrato rejeita em vez de repassar cegamente (achado da auditoria)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ nao_e_o_formato_esperado: true }) }));
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    await expect(provider.interpretFreeText('empurro Tolven', {} as never)).rejects.toThrow();
  });

  it('interpretFreeText aceita e valida um intent estruturado (Narrative Action Contract) na resposta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ kind: 'requires_check', requestedCheck: { attribute: 'vigor', reason: 'x' }, intent: { intent: 'physical_interaction', requiresCheck: true } }),
      })
    );
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    const result = await provider.interpretFreeText('empurro Tolven', {} as never);
    expect(result.intent?.intent).toBe('physical_interaction');
  });

  it('resposta 500 é retentada uma vez e sucede na segunda tentativa', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => VALID_INTERPRETED_ACTION });
    vi.stubGlobal('fetch', fetchMock);
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    const result = await provider.interpretFreeText('teste', {} as never);
    expect(result.kind).toBe('possible');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resposta 400 NÃO é retentada — erro de payload não vira válido tentando de novo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    vi.stubGlobal('fetch', fetchMock);
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    await expect(provider.interpretFreeText('teste', {} as never)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falha de rede (fetch rejeita) é retentada dentro do limite e depois desiste', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Network request failed'));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new RemoteNarrativeProvider('https://example.com/proxy');
    await expect(provider.interpretFreeText('teste', {} as never)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2); // 1 tentativa original + 1 retry
  });
});
