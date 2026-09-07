import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { loadSettings, saveSettings } from '@/save/settingsStore';
import { audioManager } from '@/audio/AudioManager';
import type { GameSettings } from '@/save/schema';

export interface SettingsScreenProps {
  onBack: () => void;
}

/** Configurações globais (spec §48): música, SFX, velocidade de texto,
 * reduzir movimento — importante porque a UI tem efeitos de tela (spec §14). */
export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  const update = (patch: Partial<GameSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.reduceMotion !== undefined) document.documentElement.classList.toggle('reduce-motion', patch.reduceMotion);
    if (patch.masterVolume !== undefined) audioManager.setMasterVolume(patch.masterVolume);
    if (patch.musicOn !== undefined) audioManager.setMusicOn(patch.musicOn);
    if (patch.ambienceOn !== undefined) audioManager.setAmbienceOn(patch.ambienceOn);
    if (patch.sfxOn !== undefined) audioManager.setSfxOn(patch.sfxOn);
  };

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('archive')} reduceMotion={settings.reduceMotion} />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center' }}>Configurações</h2>
        <div className="stack" style={{ marginTop: 20 }}>
          <div className="slot-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Volume mestre</span>
              <span className="status-chip">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.masterVolume * 100)}
              onChange={(e) => update({ masterVolume: Number(e.target.value) / 100 })}
              style={{ width: '100%' }}
            />
          </div>
          <SettingRow label="Música" checked={settings.musicOn} onChange={(v) => update({ musicOn: v })} />
          <SettingRow label="Ambiência" checked={settings.ambienceOn} onChange={(v) => update({ ambienceOn: v })} />
          <SettingRow label="Efeitos sonoros" checked={settings.sfxOn} onChange={(v) => update({ sfxOn: v })} />
          <SettingRow label="Reduzir movimento" checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
          <div className="slot-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span>Texto</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <MysticButton
                variant={settings.textSpeed === 'instant' ? 'primary' : 'ghost'}
                style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}
                onClick={() => update({ textSpeed: 'instant' })}
              >
                Instantâneo
              </MysticButton>
              <MysticButton
                variant={settings.textSpeed === 'fast' ? 'primary' : 'ghost'}
                style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}
                onClick={() => update({ textSpeed: 'fast' })}
              >
                Rápido
              </MysticButton>
              <MysticButton
                variant={settings.textSpeed === 'cinematic' ? 'primary' : 'ghost'}
                style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}
                onClick={() => update({ textSpeed: 'cinematic' })}
              >
                Cinematográfico
              </MysticButton>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <MysticButton variant="ghost" onClick={onBack}>
            Voltar
          </MysticButton>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className="slot-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className="status-chip">{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
}
