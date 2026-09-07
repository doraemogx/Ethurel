import { describe, it, expect } from 'vitest';
import { composeExperience } from '@/ui/visual/ExperienceDirector';

describe('VisualExperienceEngine', () => {
  it('sem condição especial, vinheta é none', () => {
    const c = composeExperience({ ambientProfile: 'village', arcaneZone: 'controle' });
    expect(c.vignette).toBe('none');
  });

  it('justHurt tem prioridade sobre low-hp e poisoned', () => {
    const c = composeExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.2, poisoned: true, justHurt: true });
    expect(c.vignette).toBe('hurt');
  });

  it('poisoned tem prioridade sobre low-hp quando não há justHurt', () => {
    const c = composeExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.2, poisoned: true });
    expect(c.vignette).toBe('poison');
  });

  it('HP baixo (<=30%) sem outras condições vira vinheta low-hp, distinta de poison/hurt', () => {
    const c = composeExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.25 });
    expect(c.vignette).toBe('low-hp');
  });

  it('a arte do local sempre domina; a classe só empresta a cor de partícula quando informada', () => {
    const withoutClass = composeExperience({ ambientProfile: 'cave', arcaneZone: 'controle' });
    const withClass = composeExperience({ ambientProfile: 'cave', arcaneZone: 'controle', classId: 'portador-de-cinza' });
    expect(withoutClass.art.gradient).toBe(withClass.art.gradient);
    expect(withClass.art.particleColor).not.toBe(withoutClass.art.particleColor);
  });

  it('overlay Arcano reage à zona (Ruptura é sempre mais intenso que Controle)', () => {
    const controle = composeExperience({ ambientProfile: 'fissure', arcaneZone: 'controle' });
    const ruptura = composeExperience({ ambientProfile: 'fissure', arcaneZone: 'ruptura' });
    expect(ruptura.arcaneOverlay.opacity).toBeGreaterThan(controle.arcaneOverlay.opacity);
  });

  it('resolve fundo real quando o local tem arte curada (Phase 3 §15/§50)', () => {
    const c = composeExperience({ locationId: 'varreth', ambientProfile: 'village', arcaneZone: 'controle' });
    expect(c.backgroundImage).toContain('varreth-market');
  });

  it('sem local (ou local sem arte curada), backgroundImage fica ausente sem quebrar', () => {
    const semLocal = composeExperience({ ambientProfile: 'village', arcaneZone: 'controle' });
    expect(semLocal.backgroundImage).toBeUndefined();
    const semArte = composeExperience({ locationId: 'fronteira', ambientProfile: 'fissure', arcaneZone: 'controle' });
    expect(semArte.backgroundImage).toBeUndefined();
  });

  it('Saturação/Ruptura trocam para o tratamento Arcano do MESMO local, quando existe (§12: mesma arte, tratamento diferente)', () => {
    const controle = composeExperience({ locationId: 'borda-musgos', ambientProfile: 'forest', arcaneZone: 'controle' });
    const ruptura = composeExperience({ locationId: 'borda-musgos', ambientProfile: 'forest', arcaneZone: 'ruptura' });
    expect(controle.backgroundImage).toContain('borda-musgos-day');
    expect(ruptura.backgroundImage).toContain('borda-musgos-bloodmoon');
  });
});
