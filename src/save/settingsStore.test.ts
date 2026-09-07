import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings } from '@/save/settingsStore';
import { defaultSettings } from '@/save/schema';

describe('settingsStore — compatibilidade do AudioDirector (Phase 3 §16)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sem nada salvo, devolve os defaults completos (com masterVolume/ambienceOn novos)', () => {
    const s = loadSettings();
    expect(s).toEqual(defaultSettings());
  });

  it('configurações salvas ANTES da Phase 3 (sem masterVolume/ambienceOn) recebem os novos campos via merge, nunca undefined', () => {
    localStorage.setItem('ethurel::settings', JSON.stringify({ musicOn: false, sfxOn: true, textSpeed: 'cinematic', reduceMotion: true }));
    const s = loadSettings();
    expect(s.musicOn).toBe(false); // preserva o que já existia
    expect(s.textSpeed).toBe('cinematic');
    expect(s.masterVolume).toBe(defaultSettings().masterVolume); // novo campo, veio do default
    expect(s.ambienceOn).toBe(defaultSettings().ambienceOn);
  });

  it('saveSettings/loadSettings preservam masterVolume/ambienceOn corretamente', () => {
    const next = { ...defaultSettings(), masterVolume: 0.3, ambienceOn: false };
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
  });
});
