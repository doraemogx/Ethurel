import { useState, type ReactNode } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { ClassDetailCard } from '@/ui/components/ClassDetailCard';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { CreationStage } from '@/ui/components/CreationStage';
import { ItemIcon } from '@/ui/components/ItemIcon';
import type { ItemIcon as ItemIconMotif } from '@/items/types';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { IMG } from '@/ui/assetPath';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { ANCESTRIES, findAncestry, findVariant, type AncestryDefinition } from '@/data/ancestries';
import { playerPortraitChoicesFor, visualProfile } from '@/characters/visualRegistry';
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

// Fase 3 (Vertical Slice Visual, "Classe"): o slice mostra só UMA classe
// completa. As outras 7 continuam existindo em src/data/classes.ts (usadas
// por Personagens de Origem e no jogo já em curso) — só o passo de CRIAÇÃO
// as esconde nesta prévia, por decisão explícita do escopo desta fase.
export const SLICE_CLASS_ID = 'portador-de-cinza';

const GENDER_LABEL: Record<Gender, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };
const ATTR_LABEL: Record<keyof Attrs, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };
export const ATTR_EXPLAIN: Record<keyof Attrs, string> = {
  vigor: 'Corpo, resistência e fôlego — define seu HP máximo e o quanto você aguenta golpe físico direto.',
  reflexo: 'Velocidade, reação e precisão — pesa em esquiva, iniciativa e ataques que dependem de agilidade.',
  mente: 'Raciocínio e controle interno — define seu Foco Arcano máximo e o quanto você lê padrões, riscos e mentiras.',
  presenca: 'Como você ocupa espaço diante dos outros — pesa em persuasão, intimidação e percepção social; não é "carisma bonzinho", é peso.',
};

// Fase 3 (Vertical Slice Visual, passo Ancestralidade/Variante): nenhuma
// ancestralidade tem arte de personagem própria (ver ASSET_AUDIT.md — os
// packs cobrem retratos genéricos de viajante, não 4 corpos por
// ancestralidade). Em vez de fingir uma diferença visual que não existe, o
// passo usa o mesmo vocabulário de ícone/motivo já usado por classe/item
// (ash/thread/trail/shadow/stone/moss/sigil/bone, ver ItemIcon.tsx) como
// emblema — real, reaproveitado, mas propositalmente não uma silhueta de
// personagem (documentado no relatório da fase como lacuna de asset).
export const ANCESTRY_ICON: Record<string, ItemIconMotif> = {
  'pedra-funda': 'stone',
  'musgo-antigo': 'moss',
  'errantes-da-estrada': 'trail',
  'marcados-do-selo': 'sigil',
};
export const ANCESTRY_ACCENT: Record<string, string> = {
  'pedra-funda': '#a9997a',
  'musgo-antigo': '#6fae7a',
  'errantes-da-estrada': '#b9834f',
  'marcados-do-selo': '#8a97a3',
};

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
        backgroundImage={`${IMG}/backgrounds/varreth-market.webp`}
      />
      <div className="screen__content">
        <div className="topbar" style={{ marginBottom: 4 }}>
          <span>Criação de Personagem</span>
          <span>{stepIndex + 1}/{STEPS.length}</span>
        </div>

        {step === 'ancestralidade' && (
          <AncestryPicker
            selectedId={ancestryId}
            stepLabel={`${stepIndex + 1} de ${STEPS.length} · Ancestralidade`}
            onConfirm={(a) => {
              setAncestryId(a.id);
              if (variantId && !findVariant(a, variantId)) setVariantId(null);
              goNextStep();
            }}
            onBack={goBackStep}
          />
        )}

        {step === 'variante' && ancestry && (
          <VariantPicker
            ancestry={ancestry}
            selectedId={variantId}
            stepLabel={`${stepIndex + 1} de ${STEPS.length} · Variante`}
            onConfirm={(v) => { setVariantId(v.id); goNextStep(); }}
            onBack={goBackStep}
          />
        )}

        {step === 'aparencia' && (() => {
          const stageAccent = ancestry ? ANCESTRY_ACCENT[ancestry.id] : theme.accent;
          const stageIcon = ancestry ? ANCESTRY_ICON[ancestry.id] : 'sigil';
          const chosenProfile = portraitId ? visualProfile(portraitId) : undefined;
          const filteredChoices = playerPortraitChoicesFor(gender);
          return (
            <CreationStage
              eyebrow={`${stepIndex + 1} de ${STEPS.length} · Masculino/Feminino & Aparência`}
              title={name.trim() || 'Quem você é?'}
              subtitle={gender ? GENDER_LABEL[gender] : 'Escolha uma apresentação para revelar seu personagem'}
              mainAccent={stageAccent}
              main={
                chosenProfile?.fullBody ? (
                  <img src={chosenProfile.fullBody} alt="" />
                ) : (
                  <ItemIcon motif={stageIcon} size={132} color={stageAccent} />
                )
              }
              secondary={
                <div className="stack" style={{ gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', margin: '0 0 6px' }}>Nome</p>
                    <input
                      autoFocus
                      value={name}
                      maxLength={24}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do personagem"
                      style={{
                        background: 'rgba(28,22,16,0.75)',
                        border: '1px solid rgba(217,208,189,0.28)',
                        borderRadius: 10,
                        padding: '11px 16px',
                        color: 'var(--text)',
                        fontSize: 16,
                        textAlign: 'center',
                        width: '100%',
                      }}
                    />
                  </div>
                  {gender === 'outro' && (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
                      Ainda não existe arte própria para essa apresentação nesta prévia — mostrando as 4 opções de retrato disponíveis, sem filtrar.
                    </p>
                  )}
                </div>
              }
              controls={
                <>
                  <p style={{ margin: '0 0 4px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: 'center' }}>Apresentação</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                      <MysticButton
                        key={g}
                        variant="action"
                        className={gender === g ? 'mystic-btn--selected' : ''}
                        style={{ flex: 1, textAlign: 'center' }}
                        onClick={() => {
                          setGender(g);
                          const stillValid = portraitId && playerPortraitChoicesFor(g).includes(portraitId);
                          if (!stillValid) setPortraitId(null);
                        }}
                      >
                        {GENDER_LABEL[g]}
                      </MysticButton>
                    ))}
                  </div>

                  {gender && (
                    <>
                      <p style={{ margin: '10px 0 4px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: 'center' }}>Retrato</p>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {filteredChoices.map((pid) => {
                          const profile = visualProfile(pid);
                          return (
                            <div
                              key={pid}
                              className={`portrait-choice ${portraitId === pid ? 'portrait-choice--selected' : ''}`}
                              style={{ width: 76, height: 76 }}
                              onClick={() => setPortraitId(pid)}
                            >
                              {profile?.portrait && <img src={profile.portrait} alt="" loading="lazy" decoding="async" />}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <MysticButton variant="primary" disabled={!name.trim() || !gender || !portraitId} onClick={goNextStep} style={{ marginTop: 10 }}>
                    Continuar
                  </MysticButton>
                  <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
                </>
              }
            />
          );
        })()}

        {step === 'classe' && (() => {
          const previewClass = CLASSES.find((c) => c.id === SLICE_CLASS_ID)!;
          const previewTheme = getClassTheme(previewClass.id);
          const chosenProfile = portraitId ? visualProfile(portraitId) : undefined;
          return (
            <CreationStage
              eyebrow={`${stepIndex + 1} de ${STEPS.length} · Classe`}
              title="Sua Classe"
              subtitle="Nesta prévia, apenas uma classe está pronta para jogar — as outras 7 chegam depois da aprovação visual."
              mainAccent={previewTheme.accent}
              main={
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {chosenProfile?.fullBody ? (
                    <img src={chosenProfile.fullBody} alt="" />
                  ) : (
                    <ItemIcon motif="ash" size={132} color={previewTheme.accent} />
                  )}
                  {chosenProfile?.fullBody && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(180deg, ${previewTheme.glow} 0%, transparent 60%)`,
                        mixBlendMode: 'screen',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <div style={{ position: 'absolute', top: 4, right: 4 }}>
                    <ItemIcon motif="ash" size={40} color={previewTheme.accent} />
                  </div>
                </div>
              }
              secondary={<ClassDetailCard classDef={previewClass} />}
              controls={
                <>
                  <p style={{ margin: '0 0 6px', fontSize: 11.5, color: 'var(--text-dim)', textAlign: 'center' }}>
                    A classe muda a atmosfera ao redor de {name || 'você'} (cor, partículas, sigilo) — o figurino/equipamento ainda não tem arte própria por classe nesta prévia.
                  </p>
                  <MysticButton
                    variant="primary"
                    onClick={() => { setClassId(previewClass.id); setAttrAdjustments(emptyAdjustments()); goNextStep(); }}
                  >
                    Escolher {previewClass.name}
                  </MysticButton>
                  <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
                </>
              }
            />
          );
        })()}

        {step === 'atributos' && selectedClassDef && (() => {
          const chosenProfile = portraitId ? visualProfile(portraitId) : undefined;
          return (
            <CreationStage
              eyebrow={`${stepIndex + 1} de ${STEPS.length} · Atributos`}
              title="Distribua seus atributos"
              subtitle={`Pontos restantes: ${ATTR_POINT_BUDGET - pointsSpent(attrAdjustments)}/${ATTR_POINT_BUDGET} · preset de ${selectedClassDef.name}${ancestry ? ` + ${ancestry.name}` : ''}`}
              mainAccent={theme.accent}
              main={chosenProfile?.fullBody ? <img src={chosenProfile.fullBody} alt="" /> : <ItemIcon motif="ash" size={110} color={theme.accent} />}
              secondary={
                <div className="stack" style={{ gap: 2 }}>
                  {(Object.keys(ATTR_LABEL) as (keyof Attrs)[]).map((attr) => (
                    <div key={attr} style={{ paddingBottom: 6, marginBottom: 4, borderBottom: '1px solid rgba(217,208,189,0.08)' }}>
                      <div className="attr-row" style={{ padding: '2px 0', border: 'none' }}>
                        <span className="attr-row__label">{ATTR_LABEL[attr]}</span>
                        {attrAdjustments[attr] > 0 && <span className="attr-row__bonus">+{attrAdjustments[attr]}</span>}
                        <button className="attr-stepper-btn" disabled={attrAdjustments[attr] <= 0} onClick={() => setAttrAdjustments(decrease(attrAdjustments, attr))}>−</button>
                        <span className="attr-row__value">{classPreset[attr] + attrAdjustments[attr]}</span>
                        <button className="attr-stepper-btn" disabled={!canIncrease(attrAdjustments, attr)} onClick={() => setAttrAdjustments(increase(attrAdjustments, attr))}>+</button>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>{ATTR_EXPLAIN[attr]}</p>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    <span className="status-chip">HP {computeMaxHp(finalAttrs.vigor)}</span>
                    <span className="status-chip">Foco {computeMaxFocus(finalAttrs.mente)}</span>
                  </div>
                </div>
              }
              controls={
                <>
                  <MysticButton variant="ghost" disabled={pointsSpent(attrAdjustments) === 0} onClick={() => setAttrAdjustments(emptyAdjustments())}>
                    Redefinir para o recomendado
                  </MysticButton>
                  <MysticButton variant="primary" onClick={goNextStep}>Continuar</MysticButton>
                  <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
                </>
              }
            />
          );
        })()}

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

        {step === 'revisao' && selectedClassDef && (() => {
          const chosenProfile = portraitId ? visualProfile(portraitId) : undefined;
          return (
            <CreationStage
              eyebrow="Revisão"
              title={name}
              subtitle={`${gender ? GENDER_LABEL[gender] : ''} · ${ancestry?.name ?? ''}${variant ? ` (${variant.name})` : ''} · ${selectedClassDef.name}`}
              mainAccent={theme.accent}
              main={
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {chosenProfile?.fullBody ? <img src={chosenProfile.fullBody} alt="" /> : <ItemIcon motif="ash" size={132} color={theme.accent} />}
                  <div style={{ position: 'absolute', top: 4, right: 4 }}>
                    <ArcaneSigil identity={arcaneIdentityForClass(selectedClassDef.id)} zone="controle" size={40} />
                  </div>
                </div>
              }
              secondary={
                <div className="stack" style={{ gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="status-chip">HP {computeMaxHp(finalAttrs.vigor)}</span>
                    <span className="status-chip">Foco {computeMaxFocus(finalAttrs.mente)}</span>
                    <span className="status-chip">Sigilo: {arcaneIdentityForClass(selectedClassDef.id).label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(Object.keys(ATTR_LABEL) as (keyof Attrs)[]).map((a) => (
                      <span key={a} className="status-chip">{ATTR_LABEL[a]} {finalAttrs[a]}</span>
                    ))}
                  </div>
                  {variant && <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>{variant.flavorNote}</p>}
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
                    Origem: {origin?.name} · Princípio: {principle?.text} · Item inicial: {origin?.startingItem}.
                  </p>
                </div>
              }
              controls={
                <>
                  <MysticButton variant="primary" onClick={finish}>Entrar em Ethurel</MysticButton>
                  <MysticButton variant="ghost" onClick={goBackStep}>Voltar</MysticButton>
                </>
              }
            />
          );
        })()}
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

/**
 * Passo Ancestralidade (Fase 3 — Vertical Slice Visual): personagem ainda
 * não existe visualmente neste ponto do fluxo (retrato só é escolhido no
 * passo Aparência, depois), então a ÁREA PRINCIPAL usa o emblema/ícone da
 * ancestralidade em vez de forçar uma silhueta genérica. Toque num item do
 * trilho só troca a prévia (`previewId`); Confirmar avança de verdade.
 */
function AncestryPicker({
  selectedId,
  stepLabel,
  onConfirm,
  onBack,
}: {
  selectedId: string | null;
  stepLabel: string;
  onConfirm: (a: AncestryDefinition) => void;
  onBack: () => void;
}) {
  const [previewId, setPreviewId] = useState(selectedId ?? ANCESTRIES[0].id);
  const preview = findAncestry(previewId) ?? ANCESTRIES[0];
  const accent = ANCESTRY_ACCENT[preview.id];
  const icon = ANCESTRY_ICON[preview.id];

  return (
    <CreationStage
      eyebrow={stepLabel}
      title={preview.name}
      subtitle={preview.tagline}
      mainAccent={accent}
      main={<ItemIcon motif={icon} size={132} color={accent} />}
      secondary={
        <>
          <p style={{ margin: '0 0 8px' }}>{preview.description}</p>
          <p style={{ margin: '0 0 4px', color: 'var(--text-dim)' }}><strong style={{ color: 'var(--text)' }}>Aparência:</strong> {preview.appearanceNote}</p>
          <p style={{ margin: 0, color: 'var(--text-dim)' }}><strong style={{ color: 'var(--text)' }}>Entre quem vive perto:</strong> {preview.npcRecognitionHook}</p>
        </>
      }
      controls={
        <>
          <div className="option-rail">
            {ANCESTRIES.map((a) => (
              <button
                key={a.id}
                className={`option-rail__chip ${a.id === previewId ? 'option-rail__chip--selected' : ''}`}
                onClick={() => setPreviewId(a.id)}
              >
                {a.name}
              </button>
            ))}
          </div>
          <MysticButton variant="primary" onClick={() => onConfirm(preview)}>Confirmar {preview.name}</MysticButton>
          <MysticButton variant="ghost" onClick={onBack}>Voltar</MysticButton>
        </>
      }
    />
  );
}

/** Passo Variante — mesma linguagem visual da Ancestralidade (mesmo emblema:
 * a variante não muda a arte, só o texto — não existe suporte visual
 * diferenciado por variante, e fingir um seria contra a regra da fase). */
function VariantPicker({
  ancestry,
  selectedId,
  stepLabel,
  onConfirm,
  onBack,
}: {
  ancestry: AncestryDefinition;
  selectedId: string | null;
  stepLabel: string;
  onConfirm: (v: AncestryDefinition['variants'][number]) => void;
  onBack: () => void;
}) {
  const [previewId, setPreviewId] = useState(selectedId ?? ancestry.variants[0].id);
  const preview = ancestry.variants.find((v) => v.id === previewId) ?? ancestry.variants[0];
  const accent = ANCESTRY_ACCENT[ancestry.id];
  const icon = ANCESTRY_ICON[ancestry.id];

  return (
    <CreationStage
      eyebrow={stepLabel}
      title={preview.name}
      subtitle={`Variante de ${ancestry.name}`}
      mainAccent={accent}
      main={<ItemIcon motif={icon} size={132} color={accent} />}
      secondary={
        <>
          <p style={{ margin: '0 0 8px' }}>{preview.description}</p>
          <p style={{ margin: 0, color: 'var(--text-dim)' }}>{preview.flavorNote}</p>
        </>
      }
      controls={
        <>
          <div className="option-rail">
            {ancestry.variants.map((v) => (
              <button
                key={v.id}
                className={`option-rail__chip ${v.id === previewId ? 'option-rail__chip--selected' : ''}`}
                onClick={() => setPreviewId(v.id)}
              >
                {v.name}
              </button>
            ))}
          </div>
          <MysticButton variant="primary" onClick={() => onConfirm(preview)}>Confirmar {preview.name}</MysticButton>
          <MysticButton variant="ghost" onClick={onBack}>Voltar</MysticButton>
        </>
      }
    />
  );
}
