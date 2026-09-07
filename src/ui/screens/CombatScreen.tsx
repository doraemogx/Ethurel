import { useEffect, useRef, useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { StatusBar } from '@/ui/components/StatusBar';
import { sceneArtFor, arcaneOverlayFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneZone } from '@/arcane/zone';
import { createPlayerCombatant, createEnemyCombatant, type CombatantState } from '@/combat/Combatant';
import { createBattleState, type BattleState } from '@/combat/BattleState';
import { TurnManager, type BattleEvent, type PlayerAction } from '@/combat/TurnManager';
import type { ClassDefinition } from '@/classes/types';
import type { Enemy } from '@/combat/types';
import type { CharacterModel } from '@/characters/types';

export interface CombatScreenProps {
  character: CharacterModel;
  classDef: ClassDefinition;
  enemy: Enemy;
  onFinished: (result: { victory: boolean; player: CombatantState }) => void;
}

/**
 * Combate por turnos separado da narrativa (spec §40) — reaproveita
 * TurnManager/ActionResolver/Combatant sem alteração; a única
 * responsabilidade daqui é traduzir `BattleEvent[]` em reação visual (flash
 * no alvo atingido, cor por tipo) sem virar planilha (spec §42).
 */
export function CombatScreen({ character, classDef, enemy, onFinished }: CombatScreenProps) {
  const theme = getClassTheme(character.classId);
  const stateRef = useRef<BattleState | undefined>(undefined);
  if (!stateRef.current) {
    stateRef.current = createBattleState(
      createPlayerCombatant({
        name: character.name,
        vigor: character.attrs.vigor,
        hp: character.hp,
        maxHp: character.maxHp,
        arcaneFocus: character.arcaneFocus,
        arcaneMax: character.arcaneMax,
        tension: character.tension,
      }),
      createEnemyCombatant(enemy.id, enemy.name, enemy.stats.hp, enemy.stats.atk, enemy.stats.def)
    );
  }
  const managerRef = useRef<TurnManager | undefined>(undefined);
  if (!managerRef.current) managerRef.current = new TurnManager(stateRef.current, classDef.passives, classDef.tensionMult);

  const [, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ targetId: string; kind: 'damage' | 'heal' | 'tension' } | null>(null);
  const [resolved, setResolved] = useState(false);

  const state = stateRef.current;

  useEffect(() => {
    const events = managerRef.current!.runCombatStartTriggers();
    applyEvents(events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyEvents(events: BattleEvent[]): void {
    for (const ev of events) {
      if (ev.kind === 'message') setLog((prev) => [...prev.slice(-3), ev.text]);
      if (ev.kind === 'damage') {
        setFlash({ targetId: ev.targetId, kind: 'damage' });
        window.setTimeout(() => setFlash(null), 380);
      }
      if (ev.kind === 'heal') {
        setFlash({ targetId: ev.targetId, kind: 'heal' });
        window.setTimeout(() => setFlash(null), 380);
      }
    }
    setTick((t) => t + 1);
  }

  const act = (action: PlayerAction) => {
    if (resolved) return;
    const events = managerRef.current!.runRound(action);
    applyEvents(events);
    if (state.phase === 'victory' || state.phase === 'defeat') {
      setResolved(true);
      window.setTimeout(() => onFinished({ victory: state.phase === 'victory', player: state.player }), 1200);
    }
  };

  const zone = arcaneZone(state.player.tension);
  const overlay = arcaneOverlayFor(zone);
  const art = sceneArtFor('fissure');

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...art, particleColor: theme.accent }} arcaneOverlay={overlay} />
      <div className="screen__content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <CombatSide name={enemy.name} flashed={flash?.targetId === state.enemy.id ? flash.kind : null}>
            <StatusBar label="HP" value={state.enemy.hp} max={state.enemy.maxHp} color="var(--danger)" />
          </CombatSide>
        </div>

        <div style={{ flex: 1 }} />

        <div className="dialogue-box" style={{ marginBottom: 10 }}>
          <div className="dialogue-box__body">
            {log.slice(-3).map((line, i) => (
              <p key={i} className="dialogue-box__text" style={{ fontSize: 13, opacity: 0.55 + i * 0.2 }}>
                {line}
              </p>
            ))}
            {log.length === 0 && <p className="dialogue-box__text">O combate começa.</p>}
          </div>
        </div>

        <CombatSide name={character.name} flashed={flash?.targetId === state.player.id ? flash.kind : null}>
          <Portrait name={character.name} size={44} />
          <div style={{ flex: 1 }}>
            <StatusBar label="HP" value={state.player.hp} max={state.player.maxHp} color="var(--danger)" />
            <StatusBar label="Foco" value={state.player.arcaneFocus} max={state.player.arcaneMax} color={theme.accent} />
            <StatusBar label="Tensão" value={state.player.tension} max={100} color="var(--gold)" />
          </div>
        </CombatSide>

        {state.phase === 'player-select' && !resolved && (
          <div className="stack" style={{ marginTop: 10 }}>
            <MysticButton variant="action" onClick={() => act({ type: 'basicAttack' })}>
              Atacar
            </MysticButton>
            {classDef.abilities.map((ability) => (
              <MysticButton
                key={ability.id}
                variant="action"
                disabled={state.player.arcaneFocus < ability.cost}
                onClick={() => act({ type: 'ability', ability })}
              >
                <strong>{ability.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>Foco {ability.cost}</span>
              </MysticButton>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <MysticButton variant="ghost" style={{ flex: 1 }} onClick={() => act({ type: 'defend' })}>
                Defender
              </MysticButton>
              <MysticButton variant="ghost" style={{ flex: 1 }} onClick={() => act({ type: 'flee' })}>
                Fugir
              </MysticButton>
            </div>
          </div>
        )}

        {state.phase === 'victory' && <p style={{ textAlign: 'center', color: theme.accentSoft }}>Vitória.</p>}
        {state.phase === 'defeat' && <p style={{ textAlign: 'center', color: 'var(--danger)' }}>Você caiu.</p>}
      </div>
    </div>
  );
}

function CombatSide({ name, flashed, children }: { name: string; flashed: 'damage' | 'heal' | 'tension' | null; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '6px 8px',
        borderRadius: 10,
        transition: 'background-color 0.15s ease',
        background: flashed === 'damage' ? 'rgba(217,102,122,0.25)' : flashed === 'heal' ? 'rgba(143,209,152,0.2)' : 'transparent',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 2 }}>{name}</div>
        {children}
      </div>
    </div>
  );
}
