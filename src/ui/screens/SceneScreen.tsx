import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { D20Check } from '@/ui/components/D20Check';
import { sceneArtFor, arcaneOverlayFor } from '@/ui/visual/sceneArt';
import { arcaneZone } from '@/arcane/zone';
import { LOCATIONS } from '@/data/locations';
import { CLASSES } from '@/data/classes';
import { ENEMIES } from '@/data/enemies';
import { FIRST_CHAPTER_SCENES, type SceneId } from '@/content/firstChapterScenes';
import {
  QUEST_ID,
  DIALOGUE_OFFER,
  DIALOGUE_OBJECTIVE_COMPLETE,
  DIALOGUE_COMPLETED_REPORT,
  DIALOGUE_COMPLETED_KEEP,
  WORLD_FLAG_REPORTED,
  WORLD_FLAG_KEPT,
  QUEST_BONUS_XP,
} from '@/content/firstChapterQuest';
import type { DialogueNode } from '@/dialogue/types';
import { setQuestState } from '@/quest/QuestState';
import { resolveWorldEvent, type WorldEvent as SocialEvent } from '@/social/indole';
import { appendWorldEvent } from '@/domain/worldEvents';
import { useGame } from '@/app/GameContext';
import { CombatScreen } from '@/ui/screens/CombatScreen';

type Attribute = 'vigor' | 'reflexo' | 'mente' | 'presenca';

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

const CLEARING_FLAVOR: Record<string, string> = {
  'approach-root': 'Você aproxima a mão da raiz rompida. Ela pulsa devagar, como se reconhecesse o calor que corre em você.',
  'recognize-deformation': 'Você reconhece esta deformação — o ar dobra do mesmo jeito que dobrava perto de casa.',
  'recall-house-fall': 'Isto lembra os registros que sua Casa guardava antes de cair. A mesma assinatura, o mesmo silêncio ao redor.',
  'recognize-culto-marks': 'Você reconhece um padrão nos esporos — símbolos que o Culto do Selo chamaria de aviso, não de acidente.',
  'read-the-bones': 'Você lança um olhar aos ossos que carrega. Eles não dizem nada. E isso, por si só, já diz algo.',
};

/**
 * Loop central do primeiro capítulo (spec §2/§55): cena curta → ação
 * contextual → sistema de RPG → consequência → nova cena. A narrativa em si
 * é roteirizada (src/content/firstChapterScenes.ts) — a IA aqui só
 * dramatizaria flavor opcional; o motor determinístico decide tudo.
 */
export function SceneScreen() {
  const { save, updateAndPersist } = useGame();
  const character = save.character!;
  const classDef = CLASSES.find((c) => c.id === character.classId)!;

  const sceneId = save.narrative.currentSceneId as SceneId;
  const scene = FIRST_CHAPTER_SCENES[sceneId];
  const location = LOCATIONS.find((l) => l.id === scene.locationId)!;

  const [activeDialogue, setActiveDialogue] = useState<ActiveDialogue | null>(null);
  const [pendingCheck, setPendingCheck] = useState<PendingCheck | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [combatEnemyId, setCombatEnemyId] = useState<string | null>(null);

  if (combatEnemyId) {
    const enemy = ENEMIES.find((e) => e.id === combatEnemyId)!;
    return (
      <CombatScreen
        character={character}
        classDef={classDef}
        enemy={enemy}
        onFinished={({ victory, player }) => {
          updateAndPersist((draft) => {
            const c = draft.character!;
            c.hp = victory ? Math.max(1, player.hp) : Math.max(1, Math.round(c.maxHp * 0.4));
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
            draft.narrative.currentSceneId = 'return';
            draft.currentLocationId = 'varreth';
          });
          setCombatEnemyId(null);
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

  function handleAction(actionId: string) {
    setFlavor(null);

    if (sceneId === 'intro' && actionId === 'talk-tolven') {
      setActiveDialogue({
        node: DIALOGUE_OFFER,
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
          setFlavor(
            success
              ? 'Você nota pegadas fora do padrão perto do poço — seguem na direção da clareira leste.'
              : 'Nada além do movimento comum de uma manhã fria chama sua atenção.'
          );
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
      setFlavor(text);
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
    const normalized = text.toLowerCase();
    if (/\b(examinar|observar|investigar|olhar)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'mente', dc: 12, onResolved: (success) => { setFlavor(success ? 'Você percebe algo que passaria despercebido.' : 'Nada de novo, dessa vez.'); setPendingCheck(null); } });
    } else if (/\b(escutar|ouvir)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'presenca', dc: 12, onResolved: (success) => { setFlavor(success ? 'Um som fora do lugar chama sua atenção.' : 'Só o vento.'); setPendingCheck(null); } });
    } else if (/\b(forçar|quebrar|empurrar|levantar|escalar|correr)\b/.test(normalized)) {
      setPendingCheck({ label: text, attribute: 'vigor', dc: 12, onResolved: (success) => { setFlavor(success ? 'Você consegue, com esforço.' : 'Não dessa vez — o corpo cobra o preço da tentativa.'); setPendingCheck(null); } });
    } else if (normalized.length > 240) {
      setFlavor('Isso é ambicioso demais para agora — tente algo mais direto.');
    } else {
      setFlavor(`Você tenta: "${text}". Nada muda de forma perceptível, mas a tentativa fica registrada.`);
    }
  }

  const zone = arcaneZone(character.tension);
  const eligibleActions = scene.actions.filter(
    (a) => (!a.requiresClassId || a.requiresClassId === character.classId) && (!a.requiresOriginId || a.requiresOriginId === character.originId)
  );

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor(location.ambientProfile)} arcaneOverlay={arcaneOverlayFor(zone)} />
      <div className="screen__content">
        <p className="topbar" style={{ marginBottom: 6 }}>
          <span>{location.name}</span>
        </p>

        <div className="dialogue-box" style={{ marginBottom: 14 }}>
          <div className="dialogue-box__body">
            <p className="dialogue-box__text">{scene.narration}</p>
            {flavor && (
              <p className="dialogue-box__text" style={{ marginTop: 8, fontStyle: 'italic', color: 'var(--text-dim)', fontSize: 13 }}>
                {flavor}
              </p>
            )}
          </div>
        </div>

        {activeDialogue && (
          <div className="dialogue-box" style={{ marginBottom: 14 }}>
            <Portrait name={activeDialogue.node.lines[activeDialogue.index].speakerName} size={44} />
            <div className="dialogue-box__body">
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

        {!activeDialogue && !pendingCheck && (
          <div className="stack">
            {eligibleActions.map((a) => (
              <MysticButton key={a.id} variant="action" originLabel={a.unlockedBy} onClick={() => handleAction(a.id)}>
                {a.label}
              </MysticButton>
            ))}
          </div>
        )}

        {!activeDialogue && !pendingCheck && (
          <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', gap: 8 }}>
            <input
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitFreeAction()}
              placeholder="Outra ação..."
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
            <MysticButton variant="ghost" onClick={submitFreeAction}>
              Ir
            </MysticButton>
          </div>
        )}
      </div>
    </div>
  );
}
