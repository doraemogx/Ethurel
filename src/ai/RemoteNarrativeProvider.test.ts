import { describe, it, expect } from 'vitest';
import { RemoteNarrativeProvider } from '@/ai/RemoteNarrativeProvider';

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
