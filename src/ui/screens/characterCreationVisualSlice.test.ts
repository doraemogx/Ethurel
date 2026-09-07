import { describe, it, expect } from 'vitest';
import { ANCESTRIES } from '@/data/ancestries';
import { CLASSES } from '@/data/classes';
import { playerPortraitChoicesFor, visualProfile, PLAYER_PORTRAIT_CHOICES } from '@/characters/visualRegistry';
import { SLICE_CLASS_ID, ANCESTRY_ICON, ANCESTRY_ACCENT, ATTR_EXPLAIN } from '@/ui/screens/CharacterCreationScreen';

/**
 * Fase 3 (Vertical Slice Visual) — cobertura de lógica pura para as regras
 * que a UI redesenhada depende (não é validação visual: a aprovação visual
 * é do usuário, testando no Android real, não deste arquivo).
 */
describe('Fase 3 — regra "nunca a mesma arte para os dois gêneros" (playerPortraitChoicesFor)', () => {
  it('masculino e feminino retornam listas disjuntas e não-vazias', () => {
    const masc = playerPortraitChoicesFor('masculino');
    const fem = playerPortraitChoicesFor('feminino');
    expect(masc.length).toBeGreaterThan(0);
    expect(fem.length).toBeGreaterThan(0);
    for (const id of masc) expect(fem).not.toContain(id);
  });

  it('toda opção retornada tem retrato e corpo inteiro reais (nenhum id fantasma)', () => {
    for (const gender of ['masculino', 'feminino'] as const) {
      for (const id of playerPortraitChoicesFor(gender)) {
        const profile = visualProfile(id);
        expect(profile?.portrait).toBeTruthy();
        expect(profile?.fullBody).toBeTruthy();
        expect(profile?.presentation).toBe(gender);
      }
    }
  });

  it('"outro" não tem arte catalogada própria — cai honestamente para todas as opções, sem inventar id novo', () => {
    expect(playerPortraitChoicesFor('outro')).toEqual(PLAYER_PORTRAIT_CHOICES);
  });

  it('null (nenhuma apresentação escolhida ainda) também não filtra', () => {
    expect(playerPortraitChoicesFor(null)).toEqual(PLAYER_PORTRAIT_CHOICES);
  });
});

describe('Fase 3 — passo Classe restrito a uma classe completa', () => {
  it('SLICE_CLASS_ID aponta para uma classe que realmente existe em CLASSES', () => {
    expect(CLASSES.some((c) => c.id === SLICE_CLASS_ID)).toBe(true);
  });

  it('é Portador de Cinza (decisão explícita do usuário: "preferencialmente Portador de Cinza")', () => {
    expect(SLICE_CLASS_ID).toBe('portador-de-cinza');
  });
});

describe('Fase 3 — emblema por ancestralidade (sem arte de personagem por ancestralidade)', () => {
  it('toda ancestralidade canônica tem ícone e cor de destaque mapeados', () => {
    for (const a of ANCESTRIES) {
      expect(ANCESTRY_ICON[a.id]).toBeTruthy();
      expect(ANCESTRY_ACCENT[a.id]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('Fase 3 — explicação de atributos (não presumir que o jogador sabe o que cada um faz)', () => {
  it('as 4 explicações existem e são textos não-triviais', () => {
    for (const key of ['vigor', 'reflexo', 'mente', 'presenca'] as const) {
      expect(ATTR_EXPLAIN[key].length).toBeGreaterThan(20);
    }
  });
});
