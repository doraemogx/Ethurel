import { describe, it, expect } from 'vitest';
import { composeVisualExperience } from '@/ui/visual/VisualExperienceEngine';

describe('VisualExperienceEngine', () => {
  it('sem condição especial, vinheta é none', () => {
    const c = composeVisualExperience({ ambientProfile: 'village', arcaneZone: 'controle' });
    expect(c.vignette).toBe('none');
  });

  it('justHurt tem prioridade sobre low-hp e poisoned', () => {
    const c = composeVisualExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.2, poisoned: true, justHurt: true });
    expect(c.vignette).toBe('hurt');
  });

  it('poisoned tem prioridade sobre low-hp quando não há justHurt', () => {
    const c = composeVisualExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.2, poisoned: true });
    expect(c.vignette).toBe('poison');
  });

  it('HP baixo (<=30%) sem outras condições vira vinheta low-hp, distinta de poison/hurt', () => {
    const c = composeVisualExperience({ ambientProfile: 'forest', arcaneZone: 'controle', hpRatio: 0.25 });
    expect(c.vignette).toBe('low-hp');
  });

  it('a arte do local sempre domina; a classe só empresta a cor de partícula quando informada', () => {
    const withoutClass = composeVisualExperience({ ambientProfile: 'cave', arcaneZone: 'controle' });
    const withClass = composeVisualExperience({ ambientProfile: 'cave', arcaneZone: 'controle', classId: 'portador-de-cinza' });
    expect(withoutClass.art.gradient).toBe(withClass.art.gradient);
    expect(withClass.art.particleColor).not.toBe(withoutClass.art.particleColor);
  });

  it('overlay Arcano reage à zona (Ruptura é sempre mais intenso que Controle)', () => {
    const controle = composeVisualExperience({ ambientProfile: 'fissure', arcaneZone: 'controle' });
    const ruptura = composeVisualExperience({ ambientProfile: 'fissure', arcaneZone: 'ruptura' });
    expect(ruptura.arcaneOverlay.opacity).toBeGreaterThan(controle.arcaneOverlay.opacity);
  });
});
