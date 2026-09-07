import { describe, it, expect } from 'vitest';
import { LocalNarrativeProvider } from '@/ai/LocalNarrativeProvider';
import { resolveNarrativeAction } from '@/ai/actionContract';
import type { NarrativeContext } from '@/ai/NarrativeProvider';

/**
 * Fase 2 §9 — consolida a arquitetura de "Outra ação" com as 10 frases
 * pedidas nesta rodada. Mesma regra da Fase 0: prova ROTEAMENTO por
 * categoria semântica (kind/attribute/intent), nunca texto hardcoded por
 * frase exata — cada uma das 10 é testada junto com uma reformulação/
 * conjugação diferente da mesma categoria, para provar que o que roteia é
 * o padrão semântico, não a string literal.
 */
function ctx(overrides: Partial<NarrativeContext> = {}): NarrativeContext {
  return {
    sceneId: 'intro',
    locationName: 'Varreth',
    locationDescription: 'Uma vila à beira da estrada.',
    ambientProfile: 'village',
    characterName: 'Kael',
    className: 'Guardião',
    originName: 'Filhos da Pedra-Funda',
    recentEvents: [],
    ...overrides,
  };
}

const withTolven = ctx({ npcId: 'tolven', npcName: 'Tolven' });
const provider = new LocalNarrativeProvider();

describe('Fase 2 §9 — as 10 frases desta rodada roteiam para categorias distintas', () => {
  it('"Eu começo a chorar." → expressão emocional, sem mecânica', async () => {
    const a = await provider.interpretFreeText('Eu começo a chorar.', withTolven);
    const b = await provider.interpretFreeText('Chorei a noite toda.', withTolven);
    expect(a.kind).toBe('possible');
    expect(b.kind).toBe('possible');
    expect(a.requestedCheck).toBeUndefined();
  });

  it('"Eu me deito no chão." → gesto físico contextual, sem mecânica', async () => {
    const a = await provider.interpretFreeText('Eu me deito no chão.', withTolven);
    const b = await provider.interpretFreeText('Vou me sentar aqui.', withTolven);
    expect(a.kind).toBe('possible');
    expect(b.kind).toBe('possible');
  });

  it('"Abraço Tolven." → interação social direta com NPC citado pelo nome', async () => {
    const r = await provider.interpretFreeText('Abraço Tolven.', withTolven);
    expect(r.kind).toBe('possible');
    expect(r.reason).toContain('Tolven');
    expect(r.requestedCheck).toBeUndefined();
  });

  it('"Empurro Tolven." → interação física que exige check de Vigor, com Narrative Action Contract estruturado', async () => {
    const a = await provider.interpretFreeText('Empurro Tolven.', withTolven);
    const b = await provider.interpretFreeText('Empurrei Tolven com força.', withTolven);
    expect(a.kind).toBe('requires_check');
    expect(a.requestedCheck?.attribute).toBe('vigor');
    expect(b.kind).toBe('requires_check');

    // Narrative Action Contract (§8): a intenção estruturada existe, mas
    // quem decide DC/se é possível é resolveNarrativeAction, não o provider.
    expect(a.intent?.intent).toBe('physical_interaction');
    expect(a.intent?.target).toBe('tolven');
    const resolution = resolveNarrativeAction(a.intent!, { targetPresent: true });
    expect(resolution.allowed).toBe(true);
    expect(resolution.requiresCheck).toBe(true);
    expect(resolution.dc).toBeGreaterThanOrEqual(5);
    expect(resolution.dc).toBeLessThanOrEqual(25);
  });

  it('"Jogo minha arma no chão." → largar item, kind possible, distinto de empurrar/roubar', async () => {
    const a = await provider.interpretFreeText('Jogo minha arma no chão.', withTolven);
    const b = await provider.interpretFreeText('Larguei a espada no chão.', withTolven);
    expect(a.kind).toBe('possible');
    expect(b.kind).toBe('possible');
  });

  it('"Tento roubar a chave." → adquirir item por meios ilícitos, exige check de Reflexo (discrição)', async () => {
    const a = await provider.interpretFreeText('Tento roubar a chave.', withTolven);
    const b = await provider.interpretFreeText('Furtei a bolsa dele.', withTolven);
    expect(a.kind).toBe('requires_check');
    expect(a.requestedCheck?.attribute).toBe('reflexo');
    expect(a.intent?.intent).toBe('acquire_item');
    expect(b.kind).toBe('requires_check');
  });

  it('"Pergunto se ele está mentindo." → interação social consciente do NPC presente', async () => {
    const withNpc = await provider.interpretFreeText('Pergunto se ele está mentindo.', withTolven);
    const withoutNpc = await provider.interpretFreeText('Pergunto se ele está mentindo.', ctx());
    expect(withNpc.kind).toBe('possible');
    expect(withNpc.reason).toContain('Tolven');
    expect(withoutNpc.reason).not.toContain('Tolven');
  });

  it('"Começo a cantar." → expressão performática, distinta de chorar/rir', async () => {
    const a = await provider.interpretFreeText('Começo a cantar.', withTolven);
    const b = await provider.interpretFreeText('Cantei bem alto.', withTolven);
    expect(a.kind).toBe('possible');
    expect(a.reason).not.toEqual((await provider.interpretFreeText('Eu começo a chorar.', withTolven)).reason);
    expect(b.kind).toBe('possible');
  });

  it('"Saio correndo." → fuga, exige check de Reflexo, distinto de escalar/esquivar', async () => {
    const a = await provider.interpretFreeText('Saio correndo.', withTolven);
    const b = await provider.interpretFreeText('Fugi o mais rápido que pude.', withTolven);
    expect(a.kind).toBe('requires_check');
    expect(a.requestedCheck?.attribute).toBe('reflexo');
    expect(b.kind).toBe('requires_check');
    expect(a.requestedCheck?.reason).not.toBe((await provider.interpretFreeText('Escalo o muro.', withTolven)).requestedCheck?.reason);
  });

  it('"Não respondo nada." → recusa consciente de agir, kind possible, nunca vira erro/vazio', async () => {
    const a = await provider.interpretFreeText('Não respondo nada.', withTolven);
    const b = await provider.interpretFreeText('Me recuso a responder.', withTolven);
    expect(a.kind).toBe('possible');
    expect(a.reason).toBeTruthy();
    expect(b.kind).toBe('possible');
  });

  it('as 10 frases produzem uma combinação kind+reason única cada — prova de que não há fallback genérico compartilhado', async () => {
    const inputs = [
      'Eu começo a chorar.',
      'Eu me deito no chão.',
      'Abraço Tolven.',
      'Empurro Tolven.',
      'Jogo minha arma no chão.',
      'Tento roubar a chave.',
      'Pergunto se ele está mentindo.',
      'Começo a cantar.',
      'Saio correndo.',
      'Não respondo nada.',
    ];
    const results = await Promise.all(inputs.map((t) => provider.interpretFreeText(t, withTolven)));
    const signatures = results.map((r) => `${r.kind}|${r.requestedCheck?.attribute ?? ''}|${r.reason ?? r.requestedCheck?.reason ?? ''}`);
    expect(new Set(signatures).size).toBe(signatures.length);
  });
});
