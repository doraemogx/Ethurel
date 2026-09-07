import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { createCharacterModel } from '@/domain/characterFactory';
import { loadSlot, forceSave, type SaveSlotId } from '@/save/gameSave';
import type { Gender } from '@/characters/types';

export interface CharacterCreationScreenProps {
  slot: SaveSlotId;
  onBack: () => void;
  onDone: () => void;
}

type Step = 'gender' | 'name' | 'class' | 'origin';

export function CharacterCreationScreen({ slot, onBack, onDone }: CharacterCreationScreenProps) {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender>('homem');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);

  const theme = getClassTheme(classId ?? undefined);
  const art = sceneArtFor('village');

  const finish = (finalOriginId: string) => {
    const save = loadSlot(slot);
    save.character = createCharacterModel({ name, gender, classId: classId!, originId: finalOriginId });
    save.currentLocationId = 'varreth';
    forceSave(slot, save);
    onDone();
  };

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...art, particleColor: theme.accent }} arcaneOverlay={{ opacity: 0.08, hueShift: 0 }} />
      <div className="screen__content">
        {step === 'gender' && (
          <div className="stack--center stack">
            <h2 style={{ fontWeight: 400 }}>Quem você é?</h2>
            <div className="stack" style={{ width: '100%', maxWidth: 300 }}>
              <MysticButton variant="primary" onClick={() => { setGender('homem'); setStep('name'); }}>
                Homem
              </MysticButton>
              <MysticButton variant="primary" onClick={() => { setGender('mulher'); setStep('name'); }}>
                Mulher
              </MysticButton>
              <MysticButton variant="ghost" onClick={onBack}>Voltar</MysticButton>
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className="stack--center stack">
            <h2 style={{ fontWeight: 400 }}>Qual é o seu nome?</h2>
            <input
              autoFocus
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do personagem"
              style={{
                background: 'rgba(18,15,36,0.7)',
                border: '1px solid rgba(216,211,230,0.3)',
                borderRadius: 10,
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: 16,
                textAlign: 'center',
                width: '100%',
                maxWidth: 300,
              }}
            />
            <div className="stack" style={{ width: '100%', maxWidth: 300, marginTop: 12 }}>
              <MysticButton variant="primary" disabled={!name.trim()} onClick={() => setStep('class')}>
                Continuar
              </MysticButton>
              <MysticButton variant="ghost" onClick={() => setStep('gender')}>Voltar</MysticButton>
            </div>
          </div>
        )}

        {step === 'class' && (
          <>
            <h2 style={{ fontWeight: 400, textAlign: 'center' }}>Escolha sua classe</h2>
            <div className="stack" style={{ marginTop: 12 }}>
              {CLASSES.map((c) => (
                <MysticButton
                  key={c.id}
                  variant="action"
                  onClick={() => { setClassId(c.id); setStep('origin'); }}
                  style={{ borderColor: classId === c.id ? getClassTheme(c.id).accent : undefined }}
                >
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{c.tagline}</div>
                </MysticButton>
              ))}
              <MysticButton variant="ghost" onClick={() => setStep('name')}>Voltar</MysticButton>
            </div>
          </>
        )}

        {step === 'origin' && (
          <>
            <h2 style={{ fontWeight: 400, textAlign: 'center' }}>Qual a sua origem?</h2>
            <div className="stack" style={{ marginTop: 12 }}>
              {ORIGINS.map((o) => (
                <MysticButton key={o.id} variant="action" onClick={() => finish(o.id)}>
                  <strong>{o.name}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{o.description}</div>
                </MysticButton>
              ))}
              <MysticButton variant="ghost" onClick={() => setStep('class')}>Voltar</MysticButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
