import { describe, it, expect } from 'vitest';
import { VISUAL_PROFILES, PLAYER_PORTRAIT_CHOICES, visualProfile, resolveExpressionImage } from '@/characters/visualRegistry';

describe('CharacterVisualProfile registry / sistema de expressões (Phase 3 §8-9)', () => {
  it('visualProfile resolve por id e é undefined-safe', () => {
    expect(visualProfile(undefined)).toBeUndefined();
    expect(visualProfile('id-que-nao-existe')).toBeUndefined();
    expect(visualProfile('npc-tolven')).toBeDefined();
  });

  it('resolveExpressionImage usa a expressão pedida quando existe', () => {
    const profile = visualProfile('npc-tolven')!;
    expect(resolveExpressionImage(profile, 'angry')).toBe(profile.expressions!.angry);
  });

  it('cai para neutral quando a expressão pedida não existe no perfil (nunca quebra, nunca troca de personagem)', () => {
    const profile = visualProfile('npc-oracle')!; // só tem 'neutral'
    expect(resolveExpressionImage(profile, 'surprised')).toBe(profile.expressions!.neutral);
  });

  it('sem expressão pedida, usa neutral como padrão', () => {
    const profile = visualProfile('npc-tolven')!;
    expect(resolveExpressionImage(profile, undefined)).toBe(profile.expressions!.neutral);
  });

  it('perfil ausente devolve undefined (o componente Portrait cai para a silhueta padrão)', () => {
    expect(resolveExpressionImage(undefined, 'happy')).toBeUndefined();
  });

  it('nunca mistura o retrato de um personagem com o de outro — cada perfil só referencia seus próprios arquivos', () => {
    for (const [id, profile] of Object.entries(VISUAL_PROFILES)) {
      expect(profile.id).toBe(id);
      const slug = id.replace(/^(npc|player)-/, '');
      for (const src of Object.values(profile.expressions ?? {})) {
        expect(src).toContain(slug);
      }
    }
  });

  it('as 4 opções de retrato do jogador existem de fato no registro', () => {
    expect(PLAYER_PORTRAIT_CHOICES.length).toBe(4);
    for (const id of PLAYER_PORTRAIT_CHOICES) {
      expect(visualProfile(id)).toBeDefined();
    }
  });
});
