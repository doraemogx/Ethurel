import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { ClassDetailCard } from '@/ui/components/ClassDetailCard';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { PRINCIPLES, DESIRES, FEARS, LIMITS, type CreationOption } from '@/data/characterCreationOptions';
import { computeMaxHp, computeMaxFocus } from '@/domain/dice';
import { createCharacterModel } from '@/domain/characterFactory';
import { loadSlot, forceSave, type SaveSlotId } from '@/save/gameSave';
import type { Gender } from '@/characters/types';

export interface CharacterCreationScreenProps {
  slot: SaveSlotId;
  onBack: () => void;
  onDone: () => void;
}

type Step = 'identity' | 'name' | 'class' | 'origin' | 'principle' | 'desire' | 'fear' | 'limit' | 'review';
const STEPS: Step[] = ['identity', 'name', 'class', 'origin', 'principle', 'desire', 'fear', 'limit', 'review'];

const GENDER_LABEL: Record<Gender, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };

/**
 * Criação de personagem (Fase 2 §8-9/§16): cada passo ocupa sua própria
 * experiência, nunca um formulário — recupera Princípio/Desejo/Medo/Limite
 * do Artifact antigo (docs/design/11-LEGACY-RECOVERY.md), removidos na
 * primeira reconstrução por engano de escopo.
 */
export function CharacterCreationScreen({ slot, onBack, onDone }: CharacterCreationScreenProps) {
  const [step, setStep] = useState<Step>('identity');
  const [gender, setGender] = useState<Gender>('masculino');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [classIndex, setClassIndex] = useState(0);
  const [originId, setOriginId] = useState<string | null>(null);
  const [principle, setPrinciple] = useState<CreationOption | null>(null);
  const [desire, setDesire] = useState<CreationOption | null>(null);
  const [fear, setFear] = useState<CreationOption | null>(null);
  const [limit, setLimit] = useState<CreationOption | null>(null);

  const theme = getClassTheme(classId ?? undefined);
  const art = sceneArtFor('village');
  const stepIndex = STEPS.indexOf(step);

  const goBackStep = () => {
    if (stepIndex === 0) onBack();
    else setStep(STEPS[stepIndex - 1]);
  };

  const finish = () => {
    const save = loadSlot(slot);
    save.character = createCharacterModel({
      name,
      gender,
      classId: classId!,
      originId: originId!,
      principle: principle ?? undefined,
      desire: desire ?? undefined,
      fear: fear ?? undefined,
      limit: limit ?? undefined,
    });
    save.currentLocationId = 'varreth';
    forceSave(slot, save);
    onDone();
  };

  const origin = ORIGINS.find((o) => o.id === originId);
  const selectedClassDef = classId ? CLASSES.find((c) => c.id === classId) : undefined;

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...art, particleColor: theme.accent }} arcaneOverlay={{ opacity: 0.08, hueShift: 0 }} />
      <div className="screen__content">
        <div className="topbar" style={{ marginBottom: 4 }}>
          <span>Criação de Personagem</span>
          <span>{stepIndex + 1}/{STEPS.length}</span>
        </div>

        {step === 'identity' && (
          <div className="stack--center stack">
            <h2 style={{ fontWeight: 400 }}>Quem você é?</h2>
            <div className="stack" style={{ width: '100%', maxWidth: 300 }}>
              {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                <MysticButton key={g} variant="primary" onClick={() => { setGender(g); setStep('name'); }}>
                  {GENDER_LABEL[g]}
                </MysticButton>
              ))}
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
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </div>
        )}

        {step === 'class' && (
          <>
            <div className="class-carousel-nav">
              <MysticButton
                variant="ghost"
                style={{ padding: '6px 14px' }}
                onClick={() => setClassIndex((i) => (i - 1 + CLASSES.length) % CLASSES.length)}
              >
                ‹
              </MysticButton>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Escolha sua classe</span>
              <MysticButton
                variant="ghost"
                style={{ padding: '6px 14px' }}
                onClick={() => setClassIndex((i) => (i + 1) % CLASSES.length)}
              >
                ›
              </MysticButton>
            </div>
            <div className="class-carousel-dots">
              {CLASSES.map((c, i) => (
                <span key={c.id} className={`class-carousel-dot ${i === classIndex ? 'class-carousel-dot--active' : ''}`} />
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginTop: 10 }}>
              <ClassDetailCard classDef={CLASSES[classIndex]} />
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <MysticButton variant="primary" onClick={() => { setClassId(CLASSES[classIndex].id); setStep('origin'); }}>
                Escolher {CLASSES[classIndex].name}
              </MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}

        {step === 'origin' && (
          <>
            <h2 style={{ fontWeight: 400, textAlign: 'center' }}>Qual a sua origem?</h2>
            <div className="stack" style={{ marginTop: 12, overflowY: 'auto', flex: 1 }}>
              {ORIGINS.map((o) => (
                <MysticButton key={o.id} variant="action" onClick={() => { setOriginId(o.id); setStep('principle'); }}>
                  <strong>{o.name}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{o.description}</div>
                </MysticButton>
              ))}
            </div>
            <MysticButton variant="ghost" onClick={goBackStep} style={{ marginTop: 8 }}>Voltar</MysticButton>
          </>
        )}

        {step === 'principle' && (
          <OptionStep
            title="Qual princípio guia você?"
            options={PRINCIPLES}
            onPick={(o) => { setPrinciple(o); setStep('desire'); }}
            onBack={goBackStep}
          />
        )}
        {step === 'desire' && (
          <OptionStep
            title="O que você deseja, mais do que tudo?"
            options={DESIRES}
            onPick={(o) => { setDesire(o); setStep('fear'); }}
            onBack={goBackStep}
          />
        )}
        {step === 'fear' && (
          <OptionStep
            title="O que você teme?"
            options={FEARS}
            onPick={(o) => { setFear(o); setStep('limit'); }}
            onBack={goBackStep}
          />
        )}
        {step === 'limit' && (
          <OptionStep
            title="O que você jura nunca fazer?"
            options={LIMITS}
            onPick={(o) => { setLimit(o); setStep('review'); }}
            onBack={goBackStep}
          />
        )}

        {step === 'review' && selectedClassDef && (
          <>
            <div className="stack--center stack" style={{ flex: 'none' }}>
              <ArcaneSigil identity={arcaneIdentityForClass(selectedClassDef.id)} zone="controle" size={52} />
              <h2 style={{ fontWeight: 400, margin: '4px 0 0' }}>{name}</h2>
              <p style={{ margin: 0, fontSize: 12, color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {GENDER_LABEL[gender]} · {selectedClassDef.name} · {origin?.name}
              </p>
            </div>
            <div className="stack" style={{ flex: 1, overflowY: 'auto', marginTop: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="status-chip">HP {computeMaxHp(selectedClassDef.baseAttrs.vigor)}</span>
                <span className="status-chip">Foco {computeMaxFocus(selectedClassDef.baseAttrs.mente)}</span>
                <span className="status-chip">Sigilo: {arcaneIdentityForClass(selectedClassDef.id).label}</span>
              </div>
              <p style={{ margin: '6px 0 0' }}><strong>Princípio:</strong> {principle?.text}</p>
              <p style={{ margin: 0 }}><strong>Desejo:</strong> {desire?.text}</p>
              <p style={{ margin: 0 }}><strong>Medo:</strong> {fear?.text}</p>
              <p style={{ margin: 0 }}><strong>Limite:</strong> {limit?.text}</p>
              <p style={{ margin: '6px 0 0', color: 'var(--text-dim)' }}>{origin?.description} Item inicial: {origin?.startingItem}.</p>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <MysticButton variant="primary" onClick={finish}>
                Entrar em Ethurel
              </MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OptionStep({ title, options, onPick, onBack }: { title: string; options: CreationOption[]; onPick: (o: CreationOption) => void; onBack: () => void }) {
  return (
    <>
      <h2 style={{ fontWeight: 400, textAlign: 'center' }}>{title}</h2>
      <div className="stack" style={{ marginTop: 12, overflowY: 'auto', flex: 1 }}>
        {options.map((o) => (
          <MysticButton key={o.id} variant="action" onClick={() => onPick(o)}>
            {o.text}
          </MysticButton>
        ))}
      </div>
      <MysticButton variant="ghost" onClick={onBack} style={{ marginTop: 8 }}>Voltar</MysticButton>
    </>
  );
}
