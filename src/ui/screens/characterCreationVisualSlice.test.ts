import { describe, it, expect } from 'vitest';
import { ANCESTRIES } from '@/data/ancestries';
import { CLASSES } from '@/data/classes';
import { playerPortraitChoicesFor, visualProfile, PLAYER_PORTRAIT_CHOICES } from '@/characters/visualRegistry';
import { ANCESTRY_ACCENT, ATTR_EXPLAIN } from '@/ui/screens/CharacterCreationScreen';
import { classShowcaseProfile } from '@/characters/visualRegistry';

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

describe('Rodada de Recuperação §G/§H — as 8 classes são selecionáveis, cada uma com vitrine própria', () => {
  it('toda classe tem uma vitrine visual mapeada com retrato real', () => {
    for (const c of CLASSES) {
      const showcase = classShowcaseProfile(c.id);
      expect(showcase?.portrait).toBeTruthy();
    }
  });

  it('nenhuma classe compartilha a mesma vitrine com outra classe (cada uma comunica sua própria identidade)', () => {
    const portraits = CLASSES.map((c) => classShowcaseProfile(c.id)?.portrait);
    expect(new Set(portraits).size).toBe(CLASSES.length);
  });
});

describe('Rodada de Recuperação §E — emblema SVG por ancestralidade (sem arte de personagem por ancestralidade)', () => {
  it('toda ancestralidade canônica tem cor de destaque mapeada (o emblema em si é SVG original, ver AncestryEmblem.tsx)', () => {
    for (const a of ANCESTRIES) {
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
