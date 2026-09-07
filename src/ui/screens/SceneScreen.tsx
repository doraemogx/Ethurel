import { useEffect, useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { D20Check } from '@/ui/components/D20Check';
import { Typewriter } from '@/ui/components/Typewriter';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { composeVisualExperience } from '@/ui/visual/VisualExperienceEngine';
import { arcaneZone } from '@/arcane/zone';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { LOCATIONS } from '@/data/locations';
import { CLASSES } from '@/data/classes';
import { ENEMIES } from '@/data/enemies';
import { FIRST_CHAPTER_SCENES, type SceneId, type ContextualAction } from '@/content/firstChapterScenes';
import {
  QUEST_ID,
  NPC_NAME,
  DIALOGUE_OFFER,
  DIALOGUE_OBJECTIVE_COMPLETE,
  DIALOGUE_COMPLETED_REPORT,
  DIALOGUE_COMPLETED_KEEP,
  WORLD_FLAG_REPORTED,
  WORLD_FLAG_KEPT,
  QUEST_BONUS_XP,
} from '@/content/firstChapterQuest';
import type { DialogueLine, DialogueNode } from '@/dialogue/types';
import { setQuestState } from '@/quest/QuestState';
import { resolveWorldEvent, type WorldEvent as SocialEvent } from '@/social/indole';
import { relationshipLabel } from '@/social/relationship';
import { appendWorldEvent } from '@/domain/worldEvents';
import { resolveInsightForScene, type PassiveInsight } from '@/domain/passiveInsights';
import { ECHO_FIRST_ANOMALY, instantiateEcho } from '@/domain/echoes';
import { COMBAT_DEFEAT_OUTCOME } from '@/domain/failureOutcome';
import { upsertKnowledge } from '@/domain/knowledge';
import { loadSettings } from '@/save/settingsStore';
import { useGame } from '@/app/GameContext';
import { CombatScreen } from '@/ui/screens/CombatScreen';

type Attribute = 'vigor' | 'reflexo' | 'mente' | 'presenca';
const ATTR_TAG: Record<Attribute, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };

interface ActiveDialogue {
  node: DialogueNode;
  index: number;
  onDone?: () => void;
  onChoice?: (choiceId: string) => void;
}

interface PendingCheck {
  label: string;
  attribute: Attribute;
  dc: number;
  onResolved: (success: boolean) => void;
}

interface StageNote {
  kind: 'narrator' | 'attribute' | 'arcane';
  tag?: string;
  text: string;
}

const CLEARING_FLAVOR: Record<string, string> = {
  'approach-root': 'Você aproxima a mão da raiz rompida. Ela pulsa devagar, como se reconhecesse o calor que corre em você.',
  'read-the-fold': 'Você segue os fios da ruptura com os olhos — não é um rompimento aleatório, é um padrão que se dobra sobre si mesmo.',
  'read-the-age': 'Você lê a deformação como leria uma pegada: isto está ativo há dias, não horas — e ainda está crescendo.',
  'watch-from-shadow': 'Você fica na sombra da linha de árvores por um momento antes de se aproximar. Nada se move além do que já se movia.',
  'ask-the-moss': 'Você toca o musgo com a ponta dos dedos. Ele responde — devagar, mas responde — na direção da pedra rachada.',
  'recognize-deformation': 'Você reconhece esta deformação — o ar dobra do mesmo jeito que dobrava perto de casa.',
  'recall-house-fall': 'Isto lembra os registros que sua Casa guardava antes de cair. A mesma assinatura, o mesmo silêncio ao redor.',
  'recognize-culto-marks': 'Você reconhece um padrão nos esporos — símbolos que o Culto do Selo chamaria de aviso, não de acidente.',
  'read-the-bones': 'Você lança um olhar aos ossos que carrega. Eles não dizem nada. E isso, por si só, já diz algo.',
  'recall-the-page': 'Você reconhece esta dobra — é o mesmo padrão da página que carrega, escondida, desde o Arquivo Vertido.',
};

const CLEARING_TAG_KIND: Record<string, 'class' | 'origin'> = {
  'approach-root': 'class',
  'read-the-fold': 'class',
  'read-the-age': 'class',
  'watch-from-shadow': 'class',
  'ask-the-moss': 'class',
  'recognize-deformation': 'origin',
  'recall-house-fall': 'origin',
  'recognize-culto-marks': 'origin',
  'read-the-bones': 'origin',
  'recall-the-page': 'origin',
};

/**
 * Loop central do primeiro capítulo (spec §2/§55, reencenado na Fase 2
 * §55): cena curta → encenação (narrador digitado, insight passivo,
 * diálogo com portrait) → ação contextual com tag de origem → sistema de
 * RPG (d20, fail forward) → consequência → nova cena.
 */
export function SceneScreen() {
  const { save, updateAndPersist } = useGame();
  const character = save.character!;
  const classDef = CLASSES.find((c) => c.id === character.classId)!;
  const settings = loadSettings();

  const sceneId = save.narrative.currentSceneId as SceneId;
  const scene = FIRST_CHAPTER_SCENES[sceneId];
  const location = LOCATIONS.find((l) => l.id === scene.locationId)!;

  const [activeDialogue, setActiveDialogue] = useState<ActiveDialogue | null>(null);
  const [pendingCheck, setPendingCheck] = useState<PendingCheck | null>(null);
  const [note, setNote] = useState<StageNote | null>(null);
  const [freeText, setFreeText] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [combatEnemyId, setCombatEnemyId] = useState<string | null>(null);
  const [textDone, setTextDone] = useState(settings.textSpeed === 'instant');
  const [insight, setInsight] = useState<PassiveInsight | null>(null);
  const [echoReveal, setEchoReveal] = useState<{ title: string; description: string } | null>(null);
  const [justHurt, setJustHurt] = useState(false);

  useEffect(() => {
    setTextDone(settings.textSpeed === 'instant');
    setNote(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => {
    if (!textDone) return;
    const seenIds = save.narrative.flags.filter((f) => f.startsWith('insight-seen:')).map((f) => f.slice('insight-seen:'.length));
    const found = resolveInsightForScene(sceneId, character.attrs, seenIds);
    if (found) {
      setInsight(found);
      updateAndPersist((draft) => {
        draft.narrative.flags.push(`insight-seen:${found.id}`);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textDone, sceneId]);

  useEffect(() => {
    if (!justHurt) return;
    const t = setTimeout(() => setJustHurt(false), 900);
    return () => clearTimeout(t);
  }, [justHurt]);

  useEffect(() => {
    if (!textDone || sceneId !== 'return') return;
    const hasInjury = save.narrative.flags.includes(COMBAT_DEFEAT_OUTCOME.flag);
    const alreadyShown = save.narrative.flags.includes('injury-note-shown');
    if (!hasInjury || alreadyShown) return;
    setNote({ kind: 'narrator', text: COMBAT_DEFEAT_OUTCOME.narrativeText });
    updateAndPersist((draft) => {
      draft.narrative.flags.push('injury-note-shown');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textDone, sceneId]);

  if (echoReveal) {
    return (
      <div className="screen">
        <SceneBackdrop art={{ gradient: 'radial-gradient(120% 90% at 50% 20%, #241a3d 0%, #120f24 55%, #0b0a16 100%)', particleColor: '#c9b6f0', particleMotif: 'sigil' }} />
        <div className="screen__content stack--center">
          <div className="echo-reveal">
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-soft)', margin: '0 0 8px' }}>Um Eco permanece</p>
            <h3 style={{ margin: '0 0 8px', fontWeight: 400 }}>{echoReveal.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>{echoReveal.description}</p>
            <MysticButton variant="primary" onClick={() => setEchoReveal(null)}>Continuar</MysticButton>
          </div>
        </div>
      </div>
    );
  }

  if (combatEnemyId) {
    const enemy = ENEMIES.find((e) => e.id === combatEnemyId)!;
    return (
      <CombatScreen
        character={character}
        classDef={classDef}
        enemy={enemy}
        onFinished={({ victory, player }) => {
          const isFirstEcho = !save.echoes.some((e) => e.id === ECHO_FIRST_ANOMALY.id);
          updateAndPersist((draft) => {
            const c = draft.character!;
            c.hp = victory ? Math.max(1, player.hp) : Math.max(1, Math.round(c.maxHp * COMBAT_DEFEAT_OUTCOME.hpFactor));
            c.tension = player.tension;
            if (victory) c.xp += enemy.xp;
            draft.worldEvents = appendWorldEvent(draft.worldEvents, {
              actor: c.name,
              action: victory ? 'derrotou o Limo da Fissura' : 'recuou do Limo da Fissura, ferido',
              location: location.id,
              witnesses: [],
              result: victory ? 'vitória' : 'recuo',
              tags: ['combate', 'raiz-sussurrou'],
            });
            draft.knowledge = upsertKnowledge(draft.knowledge, {
              id: 'criatura-limo-da-fissura',
              category: 'criaturas',
              title: enemy.name,
              summary: 'Uma anomalia orgânica de Arcane instável, encontrada perto da clareira leste. Reage com agressividade a aproximação.',
              state: 'confirmed',
              tags: ['raiz-sussurrou'],
            });
            if (isFirstEcho) draft.echoes = [...draft.echoes, instantiateEcho(ECHO_FIRST_ANOMALY, 'awakening')];
            if (!victory) draft.narrative.flags.push(COMBAT_DEFEAT_OUTCOME.flag);
            draft.narrative.currentSceneId = 'return';
            draft.currentLocationId = 'varreth';
            draft.locationStates['varreth'] = 'visitado';
          });
          setCombatEnemyId(null);
          if (isFirstEcho) setEchoReveal({ title: ECHO_FIRST_ANOMALY.title, description: ECHO_FIRST_ANOMALY.description });
        }}
      />
    );
  }

  function applyIndoleReputation(event: SocialEvent) {
    updateAndPersist((draft) => {
      const c = draft.character!;
      const resolved = resolveWorldEvent({ indole: c.indole, reputation: c.reputation }, event);
      c.indole = resolved.indole;
      c.reputation = resolved.reputation;
    });
  }

  function greetingDialogue(): DialogueNode {
    const trust = save.npcTrust['tolven'] ?? 0;
    const label = relationshipLabel(trust);
    const extra: DialogueLine[] = [];
    if (label === 'Desconfiado') extra.push({ speakerId: 'tolven', speakerName: NPC_NAME, text: 'Tolven mede você com os olhos antes de dizer qualquer coisa — sem pressa nenhuma para confiar.' });
    if (label === 'Receptivo' || label === 'Próximo') extra.push({ speakerId: 'tolven', speakerName: NPC_NAME, text: 'Tolven já parecia esperar por você.' });
    return extra.length ? { ...DIALOGUE_OFFER, lines: [...extra, ...DIALOGUE_OFFER.lines] } : DIALOGUE_OFFER;
  }

  function handleAction(actionId: string) {
    setNote(null);

    if (sceneId === 'intro' && actionId === 'talk-tolven') {
      setActiveDialogue({
        node: greetingDialogue(),
        index: 0,
        onDone: () => {
          updateAndPersist((draft) => {
            const c = draft.character!;
            setQuestState(draft, QUEST_ID, 'active');
            draft.worldEvents = appendWorldEvent(draft.worldEvents, {
              actor: c.name,
              action: 'aceitou o pedido de Tolven',
              target: 'tolven',
              location: 'varreth',
              witnesses: ['tolven'],
              result: 'Uma raiz rompeu perto da clareira leste; nada cresce direito por perto.',
              tags: ['quest', 'raiz-sussurrou'],
            });
            draft.discoveredLocations = Array.from(new Set([...draft.discoveredLocations, 'borda-musgos']));
            draft.locationStates['borda-musgos'] = 'visitado';
            draft.narrative.currentSceneId = 'toward-clearing';
            draft.currentLocationId = 'borda-musgos';
          });
          setActiveDialogue(null);
        },
      });
      return;
    }

    if (sceneId === 'intro' && actionId === 'observe-square') {
      setPendingCheck({
        label: 'Observar a praça com atenção',
        attribute: 'mente',
        dc: 12,
        onResolved: (success) => {
          setNote({
            kind: 'attribute',
            tag: 'Mente',
            text: success
              ? 'Você nota pegadas fora do padrão perto do poço — seguem na direção da clareira leste.'
              : 'Nada além do movimento comum de uma manhã fria chama sua atenção.',
          });
          if (!success) {
            updateAndPersist((draft) => {
              draft.narrative.flags.push('observe-square-failed');
            });
          }
          setPendingCheck(null);
        },
      });
      return;
    }

    if (sceneId === 'toward-clearing' && actionId === 'continue-forward') {
      updateAndPersist((draft) => {
        draft.narrative.currentSceneId = 'clearing-check';
      });
      return;
    }

    if (sceneId === 'toward-clearing' && CLEARING_FLAVOR[actionId]) {
      const text = CLEARING_FLAVOR[actionId];
      setNote({ kind: 'arcane', text });
      updateAndPersist((draft) => {
        draft.worldEvents = appendWorldEvent(draft.worldEvents, {
          actor: draft.character!.name,
          action: actionId,
          location: location.id,
          witnesses: [],
          result: text,
          tags: ['exploracao', 'raiz-sussurrou'],
        });
      });
      return;
    }

    if (sceneId === 'clearing-check' && actionId === 'engage') {
      setCombatEnemyId('limo-da-fissura');
      return;
    }

    if (sceneId === 'return' && actionId === 'talk-tolven-return') {
      setActiveDialogue({
        node: DIALOGUE_OBJECTIVE_COMPLETE,
        index: 0,
        onChoice: (choiceId) => {
          const isReport = choiceId === 'report';
          updateAndPersist((draft) => {
            const c = draft.character!;
            setQuestState(draft, QUEST_ID, 'completed');
            c.xp += QUEST_BONUS_XP;
            draft.narrative.flags.push(isReport ? WORLD_FLAG_REPORTED : WORLD_FLAG_KEPT);
            draft.npcTrust['tolven'] = (draft.npcTrust['tolven'] ?? 0) + (isReport ? 4 : -2);
            draft.worldEvents = appendWorldEvent(draft.worldEvents, {
              actor: c.name,
              action: isReport ? 'entregou a raiz arcana para ser lacrada' : 'guardou a raiz arcana para si',
              target: 'tolven',
              location: 'varreth',
              witnesses: isReport ? ['tolven'] : [],
              result: isReport ? 'Varreth fica mais seguro; Tolven agradece publicamente.' : 'Só Tolven sabe — e não parece à vontade com isso.',
              tags: ['quest', 'raiz-sussurrou'],
            });
          });
          applyIndoleReputation(
            isReport
              ? {
                  id: 'raiz-sussurrou:report',
                  indoleDelta: [
                    { trait: 'honra', delta: 6 },
                    { trait: 'compaixao', delta: 4 },
                  ],
                  reputationDelta: [{ entity: 'varreth', delta: 10 }],
                  witnesses: 'public',
                }
              : {
                  id: 'raiz-sussurrou:keep',
                  indoleDelta: [
                    { trait: 'pragmatismo', delta: 5 },
                    { trait: 'egoismo', delta: 4 },
                  ],
                  witnesses: 'none',
                }
          );
          updateAndPersist((draft) => {
            draft.narrative.currentSceneId = 'epilogue';
          });
          setActiveDialogue({
            node: isReport ? DIALOGUE_COMPLETED_REPORT : DIALOGUE_COMPLETED_KEEP,
            index: 0,
            onDone: () => setActiveDialogue(null),
          });
        },
      });
      return;
    }
  }

  function submitFreeAction() {
    const text = freeText.trim();
    if (!text) return;
    setFreeText('');
    setComposerOpen(false);
    const normalized = text.toLowerCase();
    if (/\b(examinar|observar|investigar|olhar)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'mente', dc: 12, onResolved: (success) => { setNote({ kind: 'attribute', tag: 'Mente', text: success ? 'Você percebe algo que passaria despercebido.' : 'Nada de novo, dessa vez.' }); setPendingCheck(null); } });
    } else if (/\b(escutar|ouvir)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'presenca', dc: 12, onResolved: (success) => { setNote({ kind: 'attribute', tag: 'Presença', text: success ? 'Um som fora do lugar chama sua atenção.' : 'Só o vento.' }); setPendingCheck(null); } });
    } else if (/\b(forçar|quebrar|empurrar|levantar|escalar|correr)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'vigor', dc: 12, onResolved: (success) => { setNote({ kind: 'attribute', tag: 'Vigor', text: success ? 'Você consegue, com esforço.' : 'Não dessa vez — o corpo cobra o preço da tentativa.' }); setPendingCheck(null); } });
    } else if (normalized.length > 240) {
      setNote({ kind: 'narrator', text: 'Isso é ambicioso demais para agora — tente algo mais direto.' });
    } else {
      setNote({ kind: 'narrator', text: `Você tenta: "${text}". Nada muda de forma perceptível, mas a tentativa fica registrada.` });
    }
  }

  const zone = arcaneZone(character.tension);
  const identity = arcaneIdentityForClass(character.classId);
  const composition = composeVisualExperience({
    ambientProfile: location.ambientProfile,
    arcaneZone: zone,
    hpRatio: character.hp / character.maxHp,
    justHurt,
    reduceMotion: settings.reduceMotion,
  });

  const eligibleActions = scene.actions.filter(
    (a: ContextualAction) =>
      (!a.requiresClassId || a.requiresClassId === character.classId) &&
      (!a.requiresOriginId || a.requiresOriginId === character.originId)
  );

  return (
    <div className="screen">
      <SceneBackdrop art={composition.art} arcaneOverlay={composition.arcaneOverlay} reduceMotion={settings.reduceMotion} />
      {composition.vignette !== 'none' && <div className={`vignette--${composition.vignette}`} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />}

      <div className="screen__content">
        <p className="topbar" style={{ marginBottom: 6 }}>
          <span>{location.name}</span>
          <ArcaneSigil identity={identity} zone={zone} size={22} />
        </p>

        <div className="stage-box stage-box--narrator">
          <Typewriter text={scene.narration} speed={settings.textSpeed} reduceMotion={settings.reduceMotion} onDone={() => setTextDone(true)} className="dialogue-box__text" />
        </div>

        {textDone && insight && (
          <div className="stage-box stage-box--attribute">
            <span className="action-tag action-tag--attribute">◈ {ATTR_TAG[insight.attribute]}</span>
            <p style={{ margin: '4px 0 0', fontSize: 14 }}>{insight.text}</p>
          </div>
        )}

        {textDone && note && (
          <div className={`stage-box stage-box--${note.kind}`}>
            {note.tag && <span className="action-tag action-tag--attribute">◈ {note.tag}</span>}
            <p style={{ margin: note.tag ? '4px 0 0' : 0, fontSize: 14 }}>{note.text}</p>
          </div>
        )}

        {activeDialogue && (
          <div className="stage-box stage-box--npc">
            <Portrait name={activeDialogue.node.lines[activeDialogue.index].speakerName} accent={composition.accent} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="dialogue-box__name">{activeDialogue.node.lines[activeDialogue.index].speakerName}</p>
              <p className="dialogue-box__text">{activeDialogue.node.lines[activeDialogue.index].text}</p>
              {activeDialogue.index < activeDialogue.node.lines.length - 1 ? (
                <p className="continue-hint" onClick={() => setActiveDialogue({ ...activeDialogue, index: activeDialogue.index + 1 })}>
                  Toque para continuar ▸
                </p>
              ) : activeDialogue.node.choices ? (
                <div className="stack" style={{ marginTop: 10 }}>
                  {activeDialogue.node.choices.map((c) => (
                    <MysticButton key={c.id} variant="action" onClick={() => activeDialogue.onChoice?.(c.id)}>
                      {c.text}
                    </MysticButton>
                  ))}
                </div>
              ) : (
                <p className="continue-hint" onClick={() => activeDialogue.onDone?.()}>
                  Continuar ▸
                </p>
              )}
            </div>
          </div>
        )}

        {!activeDialogue && pendingCheck && (
          <D20Check
            label={pendingCheck.label}
            attribute={pendingCheck.attribute}
            modifier={character.attrs[pendingCheck.attribute]}
            dc={pendingCheck.dc}
            onResolved={(r) => pendingCheck.onResolved(r.success)}
          />
        )}

        {textDone && !activeDialogue && !pendingCheck && (
          <div className="stack">
            {eligibleActions.map((a) => (
              <MysticButton
                key={a.id}
                variant="action"
                originLabel={a.unlockedBy}
                tagKind={a.requiresAttribute ? 'attribute' : CLEARING_TAG_KIND[a.id]}
                onClick={() => handleAction(a.id)}
              >
                {a.label}
              </MysticButton>
            ))}
          </div>
        )}

        {textDone && !activeDialogue && !pendingCheck && (
          <div style={{ marginTop: 'auto', paddingTop: 14 }}>
            <MysticButton variant="ghost" onClick={() => setComposerOpen(true)}>
              Fazer outra coisa…
            </MysticButton>
          </div>
        )}
      </div>

      {composerOpen && (
        <div className="composer-sheet">
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outra ação</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitFreeAction()}
              placeholder="O que você faz?"
              style={{
                flex: 1,
                background: 'rgba(18,15,36,0.7)',
                border: '1px solid rgba(216,211,230,0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'var(--text)',
                fontSize: 14,
              }}
            />
            <MysticButton variant="primary" onClick={submitFreeAction}>Ir</MysticButton>
          </div>
          <MysticButton variant="ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setComposerOpen(false)}>
            Cancelar
          </MysticButton>
        </div>
      )}
    </div>
  );
}
