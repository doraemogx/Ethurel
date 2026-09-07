import { describe, it, expect } from 'vitest';
import { resolveNarrativeAction, type NarrativeActionIntent } from '@/ai/actionContract';

describe('resolveNarrativeAction — GameEngine é a única autoridade sobre o resultado', () => {
  it('exemplo do usuário: "Eu empurro Tolven e tento pegar a chave." vira intenção composta resolvida corretamente', () => {
    const intent: NarrativeActionIntent = {
      intent: 'physical_interaction',
      target: 'npc_tolven_marr',
      attempt: 'push',
      secondaryIntent: 'acquire_item',
      item: 'key_x',
      requiresCheck: true,
      suggestedAttribute: 'vigor',
    };
    const resolution = resolveNarrativeAction(intent, { targetPresent: true, availableItemIds: ['key_x'] });
    expect(resolution.allowed).toBe(true);
    expect(resolution.requiresCheck).toBe(true);
    expect(resolution.attribute).toBe('vigor');
    expect(resolution.dc).toBe(12); // default canônico, IA não sugeriu suggestedDc
  });

  it('nunca aceita suggestedDc fora da faixa plausível [5,25] — clampa', () => {
    const tooHigh = resolveNarrativeAction({ intent: 'physical_interaction', requiresCheck: true, suggestedDc: 999 });
    expect(tooHigh.dc).toBe(25);
    const tooLow = resolveNarrativeAction({ intent: 'physical_interaction', requiresCheck: true, suggestedDc: -50 });
    expect(tooLow.dc).toBe(5);
  });

  it('cai para DC 12 quando a IA não sugere nada', () => {
    const r = resolveNarrativeAction({ intent: 'physical_interaction', requiresCheck: true });
    expect(r.dc).toBe(12);
  });

  it('alvo ausente na cena bloqueia a ação ANTES de qualquer check — GameEngine valida, não a IA', () => {
    const r = resolveNarrativeAction({ intent: 'physical_interaction', target: 'npc_tolven_marr', requiresCheck: true }, { targetPresent: false });
    expect(r.allowed).toBe(false);
    expect(r.requiresCheck).toBe(false);
    expect(r.reason).toBeTruthy();
  });

  it('tentar adquirir item que não existe na cena é bloqueado, mesmo que a IA tenha "aceitado" a intenção', () => {
    const r = resolveNarrativeAction({ intent: 'acquire_item', item: 'espada-lendaria', requiresCheck: false }, { availableItemIds: ['pedra', 'graveto'] });
    expect(r.allowed).toBe(false);
  });

  it('ação sem check (ex.: expression/refusal) não gera DC nenhuma', () => {
    const r = resolveNarrativeAction({ intent: 'expression', requiresCheck: false });
    expect(r.allowed).toBe(true);
    expect(r.requiresCheck).toBe(false);
    expect(r.dc).toBeUndefined();
  });

  it('atributo default é vigor quando a IA não sugere nenhum e o check é necessário', () => {
    const r = resolveNarrativeAction({ intent: 'physical_interaction', requiresCheck: true });
    expect(r.attribute).toBe('vigor');
  });
});
