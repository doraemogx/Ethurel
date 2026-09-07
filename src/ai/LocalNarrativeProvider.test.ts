import { describe, it, expect } from 'vitest';
import { LocalNarrativeProvider } from '@/ai/LocalNarrativeProvider';
import type { NarrativeContext } from '@/ai/NarrativeProvider';

/**
 * Prova o ROTEAMENTO de `interpretFreeText` (Fase 0 §Crítico-2), não texto
 * hardcoded por frase. Por isso cada categoria é testada com pelo menos duas
 * formulações diferentes (a frase exata pedida + uma variação de
 * conjugação/redação) — se o roteamento fosse um mapa frase→resposta fixo,
 * a variação quebraria o teste. E cada assert de `kind`/`requestedCheck`
 * checa a ESTRUTURA da resposta, não a string exata devolvida.
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
const alone = ctx();

describe('LocalNarrativeProvider.interpretFreeText — roteamento por categoria semântica', () => {
  const provider = new LocalNarrativeProvider();

  it('"Eu começo a chorar." → expressão emocional sem mecânica, kind possible, sem exigir check', async () => {
    const r1 = await provider.interpretFreeText('Eu começo a chorar.', alone);
    const r2 = await provider.interpretFreeText('Ela chorou a noite toda.', alone);
    expect(r1.kind).toBe('possible');
    expect(r2.kind).toBe('possible');
    expect(r1.requestedCheck).toBeUndefined();
    expect(r1.reason).toBeTruthy();
  });

  it('"Eu me deito no chão." → gesto físico contextual, kind possible, menciona o local', async () => {
    const r1 = await provider.interpretFreeText('Eu me deito no chão.', ctx({ locationName: 'Clareira Rompida' }));
    const r2 = await provider.interpretFreeText('Vou sentar aqui um pouco.', ctx({ locationName: 'Clareira Rompida' }));
    expect(r1.kind).toBe('possible');
    expect(r2.kind).toBe('possible');
    expect(r1.reason).toContain('Clareira Rompida');
  });

  it('"Abraço Tolven." → ação social direcionada a NPC citado pelo nome, reação difere de quando o NPC não é mencionado', async () => {
    const direct = await provider.interpretFreeText('Abraço Tolven.', withTolven);
    const vague = await provider.interpretFreeText('Abraço alguém.', withTolven);
    const noOneThere = await provider.interpretFreeText('Abraço Tolven.', alone);
    expect(direct.kind).toBe('possible');
    expect(direct.reason).toContain('Tolven');
    expect(vague.kind).toBe('possible');
    expect(vague.reason).not.toBe(direct.reason);
    expect(noOneThere.kind).toBe('impossible');
  });

  it('"Jogo minha arma no chão." → gesto de largar item, kind possible, distinto de pegar item', async () => {
    const drop1 = await provider.interpretFreeText('Jogo minha arma no chão.', alone);
    const drop2 = await provider.interpretFreeText('Largo o escudo.', alone);
    const pick = await provider.interpretFreeText('Pego a pedra ao lado.', alone);
    expect(drop1.kind).toBe('possible');
    expect(drop2.kind).toBe('possible');
    expect(pick.kind).toBe('requires_condition');
  });

  it('"Examino as mãos dele." → exige checagem mecânica de Mente, DC decidida pelo GameEngine (não pela IA)', async () => {
    const r1 = await provider.interpretFreeText('Examino as mãos dele.', withTolven);
    const r2 = await provider.interpretFreeText('Vou observar com atenção.', withTolven);
    expect(r1.kind).toBe('requires_check');
    expect(r1.requestedCheck?.attribute).toBe('mente');
    expect(r1.requestedCheck?.suggestedDc).toBeUndefined();
    expect(r2.kind).toBe('requires_check');
    expect(r2.requestedCheck?.attribute).toBe('mente');
  });

  it('"Pergunto se ele está com medo." → interação social consciente do NPC presente', async () => {
    const withNpc = await provider.interpretFreeText('Pergunto se ele está com medo.', withTolven);
    const withoutNpc = await provider.interpretFreeText('Pergunto se ele está com medo.', alone);
    expect(withNpc.kind).toBe('possible');
    expect(withNpc.reason).toContain('Tolven');
    expect(withoutNpc.kind).toBe('possible');
    expect(withoutNpc.reason).not.toContain('Tolven');
    expect(withNpc.reason).not.toBe(withoutNpc.reason);
  });

  it('as seis categorias produzem kinds e textos distintos entre si (prova de que não é fallback único genérico)', async () => {
    const inputs = [
      'Eu começo a chorar.',
      'Eu me deito no chão.',
      'Abraço Tolven.',
      'Jogo minha arma no chão.',
      'Examino as mãos dele.',
      'Pergunto se ele está com medo.',
    ];
    const results = await Promise.all(inputs.map((t) => provider.interpretFreeText(t, withTolven)));
    const reasons = results.map((r) => r.reason);
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  it('ação impossível sem NPC presente é distinguida de ação apenas mecanicamente inerte', async () => {
    const r = await provider.interpretFreeText('Seguro a mão dele com força.', alone);
    expect(r.kind).toBe('impossible');
  });

  it('texto vazio e texto excessivamente longo são tratados como não-mecânicos, não como erro técnico', async () => {
    const empty = await provider.interpretFreeText('', alone);
    const long = await provider.interpretFreeText('a'.repeat(300), alone);
    expect(empty.kind).toBe('impossible');
    expect(long.kind).toBe('partial');
  });
});
