import { useState, type ReactNode } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { ClassDetailCard } from '@/ui/components/ClassDetailCard';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { ANCESTRIES, findAncestry, findVariant } from '@/data/ancestries';
import { PLAYER_PORTRAIT_CHOICES, visualProfile } from '@/characters/visualRegistry';
import { PRINCIPLES, DESIRES, FEARS, LIMITS, type CreationOption } from '@/data/characterCreationOptions';
import { computeMaxHp, computeMaxFocus } from '@/domain/dice';
import {
  ATTR_POINT_BUDGET,
  emptyAdjustments,
  pointsSpent,
  canIncrease,
  increase,
  decrease,
  applyAdjustments,
  type AttrAdjustments,
} from '@/domain/attributeDistribution';
import { createCharacterModel } from '@/domain/characterFactory';
import { upsertKnowledge } from '@/domain/knowledge';
import { loadSlot, forceSave, type SaveSlotId } from '@/save/gameSave';
import type { Gender } from '@/characters/types';
import type { Attrs } from '@/classes/types';

export interface CharacterCreationScreenProps {
  slot: SaveSlotId;
  onBack: () => void;
  onDone: () => void;
}

type Step =
  | 'ancestralidade'
  | 'variante'
  | 'aparencia'
  | 'classe'
  | 'atributos'
  | 'origem'
  | 'principio'
  | 'desejo'
  | 'medo'
  | 'limite'
  | 'identidade-arcana'
  | 'revisao';

const STEPS: Step[] = ['ancestralidade', 'variante', 'aparencia', 'classe', 'atributos', 'origem', 'principio', 'desejo', 'medo', 'limite', 'identidade-arcana', 'revisao'];

const GENDER_LABEL: Record<Gender, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };
const ATTR_LABEL: Record<keyof Attrs, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };

/**
 * Criação de personagem — fluxo de 12 passos (Phase 3 §6-§11): Ancestralidade
 * → Variante → Aparência → Classe → Atributos → Origem → Princípio → Desejo →
 * Medo → Limite → Identidade Arcana → Revisão. Regra absoluta: SELECIONAR !=
 * CONFIRMAR — tocar numa opção só a destaca para leitura (`SelectConfirmStep`
 * abaixo), nunca avança sozinho; sempre há Voltar, e o passo lembra a última
 * escolha ao ser revisitado.
 */
export function CharacterCreationScreen({ slot, onBack, onDone }: CharacterCreationScreenProps) {
  const [step, setStep] = useState<Step>('ancestralidade');

  const [ancestryId, setAncestryId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [name, setName] = useState('');
  const [portraitId, setPortraitId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [classIndex, setClassIndex] = useState(0);
  const [attrAdjustments, setAttrAdjustments] = useState<AttrAdjustments>(emptyAdjustments());
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
  const goNextStep = () => setStep(STEPS[stepIndex + 1]);

  const ancestry = findAncestry(ancestryId ?? undefined);
  const variant = findVariant(ancestry, variantId ?? undefined);
  const origin = ORIGINS.find((o) => o.id === originId);
  const selectedClassDef = classId ? CLASSES.find((c) => c.id === classId) : undefined;

  // Preset MOSTRADO no passo Atributos (classe + ancestralidade) — a origem
  // ainda não foi escolhida nesse ponto do fluxo (§6: Atributos vem antes de
  // Origem), então seu bônus não entra aqui, só depois, na Revisão.
  const classPreset: Attrs = selectedClassDef
    ? {
        vigor: selectedClassDef.baseAttrs.vigor + (ancestry?.attrBonus.vigor ?? 0),
        reflexo: selectedClassDef.baseAttrs.reflexo + (ancestry?.attrBonus.reflexo ?? 0),
        mente: selectedClassDef.baseAttrs.mente + (ancestry?.attrBonus.mente ?? 0),
        presenca: selectedClassDef.baseAttrs.presenca + (ancestry?.attrBonus.presenca ?? 0),
      }
    : { vigor: 0, reflexo: 0, mente: 0, presenca: 0 };
  // baseAttrs que de fato vai para createCharacterModel: classe crua + a
  // distribuição do jogador, SEM ancestralidade/origem — a factory aplica as
  // duas (fonte única de verdade, ver characterFactory.ts), evitando contar
  // o bônus de ancestralidade duas vezes.
  const rawBaseAttrs: Attrs = selectedClassDef ? applyAdjustments(selectedClassDef.baseAttrs, attrAdjustments) : { vigor: 0, reflexo: 0, mente: 0, presenca: 0 };
  // Preview mostrado ao jogador (passo Atributos e Revisão) — classe + ancestralidade + distribuição.
  const previewAttrs = applyAdjustments(classPreset, attrAdjustments);
  // Números finais REAIS da Revisão — inclui também o bônus de Origem, já escolhida nesse ponto.
  const finalAttrs: Attrs = origin
    ? {
        vigor: previewAttrs.vigor + (origin.attrBonus.vigor ?? 0),
        reflexo: previewAttrs.reflexo + (origin.attrBonus.reflexo ?? 0),
        mente: previewAttrs.mente + (origin.attrBonus.mente ?? 0),
        presenca: previewAttrs.presenca + (origin.attrBonus.presenca ?? 0),
      }
    : previewAttrs;

  const finish = () => {
    const save = loadSlot(slot);
    save.character = createCharacterModel({
      name,
      gender: gender ?? 'outro',
      ancestryId: ancestry?.id,
      ancestryVariantId: variant?.id,
      portraitProfileId: portraitId ?? undefined,
      classId: classId!,
      originId: originId!,
      baseAttrs: rawBaseAttrs,
      principle: principle ?? undefined,
      desire: desire ?? undefined,
      fear: fear ?? undefined,
      limit: limit ?? undefined,
    });
    save.currentLocationId = 'varreth';
    if (ancestry?.startingKnowledgeId === 'musgo-antigo-costumes') {
      save.knowledge = upsertKnowledge(save.knowledge, {
        id: 'musgo-antigo-costumes',
        category: 'codice',
        title: 'Costumes do Povo do Musgo Antigo',
        summary: 'Quem nasce na Borda dos Musgos carrega marcas discretas na pele que respondem à Arcane orgânica da região — sinal de gerações vivendo dentro da própria floresta, não perto dela.',
        state: 'confirmed',
        tags: ['ancestralidade', 'borda-musgos'],
      });
    }
    forceSave(slot, save);
    onDone();
  };

  return (
    <div className="screen">
      <SceneBackdrop
        art={{ ...art, particleColor: theme.accent, particleMotif: classId ? theme.particleMotif : art.particleMotif }}
        arcaneOverlay={{ opacity: 0.08, hueShift: 0 }}
        backgroundImage="/assets/img/backgrounds/varreth-market.webp"
      />
      <div className="screen__content">
        <div className="topbar" style={{ marginBottom: 4 }}>
          <span>Criação de Personagem</span>
          <span>{stepIndex + 1}/{STEPS.length}</span>
        </div>

        {step === 'ancestralidade' && (
          <SelectConfirmStep
            title="Qual sua ancestralidade?"
            items={ANCESTRIES}
            initialSelectedId={ancestryId}
            getLabel={(a) => (
              <>
                <strong>{a.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{a.tagline}</div>
              </>
            )}
            getDetail={(a) => (
              <>
                <p style={{ margin: '0 0 6px' }}>{a.description}</p>
                <p style={{ margin: '0 0 4px', color: 'var(--text-dim)' }}><strong>Aparência:</strong> {a.appearanceNote}</p>
                <p style={{ margin: 0, color: 'var(--text-dim)' }}><strong>Entre quem vive perto:</strong> {a.npcRecognitionHook}</p>
              </>
            )}
            confirmLabel={(a) => `Confirmar ${a.name}`}
            onConfirm={(a) => {
              setAncestryId(a.id);
              if (variantId && !findVariant(a, variantId)) setVariantId(null);
              goNextStep();
            }}
            onBack={goBackStep}
          />
        )}

        {step === 'variante' && ancestry && (
          <SelectConfirmStep
            title={`Qual variante de ${ancestry.name}?`}
            items={ancestry.variants}
            initialSelectedId={variantId}
            getLabel={(v) => <strong>{v.name}</strong>}
            getDetail={(v) => (
              <>
                <p style={{ margin: '0 0 6px' }}>{v.description}</p>
                <p style={{ margin: 0, color: 'var(--text-dim)' }}>{v.flavorNote}</p>
              </>
            )}
            confirmLabel={(v) => `Confirmar ${v.name}`}
            onConfirm={(v) => { setVariantId(v.id); goNextStep(); }}
            onBack={goBackStep}
          />
        )}

        {step === 'aparencia' && (
          <>
            <h2 style={{ fontWeight: 400, textAlign: 'center' }}>Quem você é?</h2>
            <div style={{ overflowY: 'auto', flex: 1, marginTop: 10 }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', margin: '0 0 6px' }}>Apresentação</p>
              <div className="stack" style={{ marginBottom: 14 }}>
                {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                  <MysticButton key={g} variant="action" className={gender === g ? 'mystic-btn--selected' : ''} onClick={() => setGender(g)}>
                    {GENDER_LABEL[g]}
                  </MysticButton>
                ))}
              </div>

              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', margin: '0 0 6px' }}>Nome</p>
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
                  marginBottom: 14,
                }}
              />

              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', margin: '0 0 6px' }}>Retrato</p>
              <div className="portrait-choice-grid">
                {PLAYER_PORTRAIT_CHOICES.map((pid) => {
                  const profile = visualProfile(pid);
                  return (
                    <div
                      key={pid}
                      className={`portrait-choice ${portraitId === pid ? 'portrait-choice--selected' : ''}`}
                      onClick={() => setPortraitId(pid)}
                    >
                      {profile?.portrait && <img src={profile.portrait} alt="" loading="lazy" decoding="async" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <MysticButton variant="primary" disabled={!name.trim() || !gender || !portraitId} onClick={goNextStep}>
                Continuar
              </MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}

        {step === 'classe' && (
          <>
            <div className="class-carousel-nav">
              <MysticButton variant="ghost" style={{ padding: '6px 14px' }} onClick={() => setClassIndex((i) => (i - 1 + CLASSES.length) % CLASSES.length)}>‹</MysticButton>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Escolha sua classe</span>
              <MysticButton variant="ghost" style={{ padding: '6px 14px' }} onClick={() => setClassIndex((i) => (i + 1) % CLASSES.length)}>›</MysticButton>
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
              <MysticButton variant="primary" onClick={() => { setClassId(CLASSES[classIndex].id); setAttrAdjustments(emptyAdjustments()); goNextStep(); }}>
                Escolher {CLASSES[classIndex].name}
              </MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}

        {step === 'atributos' && selectedClassDef && (
          <>
            <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '0 0 2px' }}>Distribua seus atributos</h2>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', margin: '0 0 8px' }}>
              Pontos restantes: {ATTR_POINT_BUDGET - pointsSpent(attrAdjustments)}/{ATTR_POINT_BUDGET} · preset de {selectedClassDef.name}{ancestry ? ` + ${ancestry.name}` : ''}
            </p>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(Object.keys(ATTR_LABEL) as (keyof Attrs)[]).map((attr) => (
                <div key={attr} className="attr-row">
                  <span className="attr-row__label">{ATTR_LABEL[attr]}</span>
                  {attrAdjustments[attr] > 0 && <span className="attr-row__bonus">+{attrAdjustments[attr]}</span>}
                  <button className="attr-stepper-btn" disabled={attrAdjustments[attr] <= 0} onClick={() => setAttrAdjustments(decrease(attrAdjustments, attr))}>−</button>
                  <span className="attr-row__value">{classPreset[attr] + attrAdjustments[attr]}</span>
                  <button className="attr-stepper-btn" disabled={!canIncrease(attrAdjustments, attr)} onClick={() => setAttrAdjustments(increase(attrAdjustments, attr))}>+</button>
                </div>
              ))}
              <div className="creation-detail-panel" style={{ marginTop: 12 }}>
                <p style={{ margin: '0 0 4px' }}>Vigor define HP máximo; Mente define Foco Arcano máximo — os dois têm consequência imediata:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="status-chip">HP {computeMaxHp(finalAttrs.vigor)}</span>
                  <span className="status-chip">Foco {computeMaxFocus(finalAttrs.mente)}</span>
                </div>
              </div>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <MysticButton variant="ghost" disabled={pointsSpent(attrAdjustments) === 0} onClick={() => setAttrAdjustments(emptyAdjustments())}>
                Redefinir para o recomendado
              </MysticButton>
              <MysticButton variant="primary" onClick={goNextStep}>Continuar</MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}

        {step === 'origem' && (
          <SelectConfirmStep
            title="Qual a sua origem?"
            items={ORIGINS}
            initialSelectedId={originId}
            getLabel={(o) => (
              <>
                <strong>{o.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{o.description}</div>
              </>
            )}
            getDetail={(o) => <p style={{ margin: 0 }}>{o.hook} Item inicial: {o.startingItem}.</p>}
            confirmLabel={(o) => `Confirmar ${o.name}`}
            onConfirm={(o) => { setOriginId(o.id); goNextStep(); }}
            onBack={goBackStep}
          />
        )}

        {step === 'principio' && (
          <SelectConfirmStep
            title="Qual princípio guia você?"
            items={PRINCIPLES}
            initialSelectedId={principle?.id ?? null}
            getLabel={(o) => o.text}
            confirmLabel={() => 'Confirmar'}
            onConfirm={(o) => { setPrinciple(o); goNextStep(); }}
            onBack={goBackStep}
          />
        )}
        {step === 'desejo' && (
          <SelectConfirmStep
            title="O que você deseja, mais do que tudo?"
            items={DESIRES}
            initialSelectedId={desire?.id ?? null}
            getLabel={(o) => o.text}
            confirmLabel={() => 'Confirmar'}
            onConfirm={(o) => { setDesire(o); goNextStep(); }}
            onBack={goBackStep}
          />
        )}
        {step === 'medo' && (
          <SelectConfirmStep
            title="O que você teme?"
            items={FEARS}
            initialSelectedId={fear?.id ?? null}
            getLabel={(o) => o.text}
            confirmLabel={() => 'Confirmar'}
            onConfirm={(o) => { setFear(o); goNextStep(); }}
            onBack={goBackStep}
          />
        )}
        {step === 'limite' && (
          <SelectConfirmStep
            title="O que você jura nunca fazer?"
            items={LIMITS}
            initialSelectedId={limit?.id ?? null}
            getLabel={(o) => o.text}
            confirmLabel={() => 'Confirmar'}
            onConfirm={(o) => { setLimit(o); goNextStep(); }}
            onBack={goBackStep}
          />
        )}

        {step === 'identidade-arcana' && selectedClassDef && (
          <div className="stack--center stack" style={{ flex: 1, justifyContent: 'center' }}>
            <ArcaneSigil identity={arcaneIdentityForClass(selectedClassDef.id)} zone="controle" size={72} />
            <h2 style={{ fontWeight: 400, margin: '10px 0 2px' }}>{arcaneIdentityForClass(selectedClassDef.id).label}</h2>
            <p style={{ maxWidth: 320, textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Todo personagem carrega uma assinatura Arcane própria, ligada à classe — não é uma escolha separada, é como o mundo reconhece {name || 'você'} em Controle,
              Saturação ou Ruptura. Discreta agora; vai ficar mais visível conforme a Tensão sobe.
            </p>
            <div className="stack" style={{ width: '100%', maxWidth: 300, marginTop: 16 }}>
              <MysticButton variant="primary" onClick={goNextStep}>Continuar</MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </div>
        )}

        {step === 'revisao' && selectedClassDef && (
          <>
            <div className="stack--center stack" style={{ flex: 'none' }}>
              <ArcaneSigil identity={arcaneIdentityForClass(selectedClassDef.id)} zone="controle" size={52} />
              <h2 style={{ fontWeight: 400, margin: '4px 0 0' }}>{name}</h2>
              <p style={{ margin: 0, fontSize: 12, color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
                {gender && GENDER_LABEL[gender]} · {ancestry?.name}{variant ? ` (${variant.name})` : ''} · {selectedClassDef.name} · {origin?.name}
              </p>
            </div>
            <div className="stack" style={{ flex: 1, overflowY: 'auto', marginTop: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="status-chip">HP {computeMaxHp(finalAttrs.vigor)}</span>
                <span className="status-chip">Foco {computeMaxFocus(finalAttrs.mente)}</span>
                <span className="status-chip">Sigilo: {arcaneIdentityForClass(selectedClassDef.id).label}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {(Object.keys(ATTR_LABEL) as (keyof Attrs)[]).map((a) => (
                  <span key={a} className="status-chip">{ATTR_LABEL[a]} {finalAttrs[a]}</span>
                ))}
              </div>
              <p style={{ margin: '6px 0 0' }}><strong>Princípio:</strong> {principle?.text}</p>
              <p style={{ margin: 0 }}><strong>Desejo:</strong> {desire?.text}</p>
              <p style={{ margin: 0 }}><strong>Medo:</strong> {fear?.text}</p>
              <p style={{ margin: 0 }}><strong>Limite:</strong> {limit?.text}</p>
              {variant && <p style={{ margin: '6px 0 0', color: 'var(--text-dim)' }}>{variant.flavorNote}</p>}
              <p style={{ margin: '6px 0 0', color: 'var(--text-dim)' }}>{origin?.description} Item inicial: {origin?.startingItem}.</p>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <MysticButton variant="primary" onClick={finish}>Entrar em Ethurel</MysticButton>
              <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Padrão reutilizável para todo passo "escolher 1 de uma lista" (Phase 3 §6):
 * tocar num item só o destaca (`previewId`, estado local); a leitura do
 * detalhe fica visível; só o botão explícito confirma e avança. Reabrir o
 * passo (Voltar e ir de novo) reaproveita `initialSelectedId`, então a
 * escolha anterior não se perde.
 */
function SelectConfirmStep<T extends { id: string }>({
  title,
  items,
  initialSelectedId,
  getLabel,
  getDetail,
  confirmLabel,
  onConfirm,
  onBack,
}: {
  title: string;
  items: T[];
  initialSelectedId?: string | null;
  getLabel: (item: T) => ReactNode;
  getDetail?: (item: T) => ReactNode;
  confirmLabel: (item: T) => string;
  onConfirm: (item: T) => void;
  onBack: () => void;
}) {
  const [previewId, setPreviewId] = useState<string | null>(initialSelectedId ?? null);
  const preview = items.find((i) => i.id === previewId) ?? null;

  return (
    <>
      <h2 style={{ fontWeight: 400, textAlign: 'center' }}>{title}</h2>
      <div className="stack" style={{ marginTop: 12, overflowY: 'auto', flex: 1 }}>
        {items.map((item) => (
          <MysticButton
            key={item.id}
            variant="action"
            className={item.id === previewId ? 'mystic-btn--selected' : ''}
            onClick={() => setPreviewId(item.id)}
          >
            {getLabel(item)}
          </MysticButton>
        ))}
      </div>
      {preview && getDetail && <div className="creation-detail-panel">{getDetail(preview)}</div>}
      <div className="stack" style={{ marginTop: 8 }}>
        <MysticButton variant="primary" disabled={!preview} onClick={() => preview && onConfirm(preview)}>
          {preview ? confirmLabel(preview) : 'Selecione uma opção'}
        </MysticButton>
        <MysticButton variant="ghost" onClick={onBack}>Voltar</MysticButton>
      </div>
    </>
  );
}
