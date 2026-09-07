import { useEffect, useRef, useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { StatusBar } from '@/ui/components/StatusBar';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { sceneArtFor, arcaneOverlayFor } from '@/ui/visual/sceneArt';
import { IMG } from '@/ui/assetPath';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
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

type FlashKind = 'damage' | 'heal';
interface Flash {
  targetId: string;
  kind: FlashKind;
  amount?: number;
  big: boolean;
  seq: number;
}

const PLAYBACK_MS = 380;

/**
 * Combate por turnos separado da narrativa (Fase 2 §44-45) — reaproveita
 * TurnManager/ActionResolver/Combatant sem alteração nenhuma na lógica; a
 * única responsabilidade daqui é reproduzir `BattleEvent[]` como uma
 * sequência (wind-up → impacto → shake → número → reação), nunca aplicar
 * tudo de uma vez como planilha. "Crítico" aqui é um limiar de
 * apresentação (dano ≥ 35% do HP máx. do alvo), não uma mecânica nova — o
 * combate não usa d20, o realce visual só reage ao tamanho do golpe.
 */
export function CombatScreen({ character, classDef, enemy, onFinished }: CombatScreenProps) {
  const theme = getClassTheme(character.classId);
  const identity = arcaneIdentityForClass(character.classId);
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
  const [flash, setFlash] = useState<Flash | null>(null);
  const [resolved, setResolved] = useState(false);
  const [playingBack, setPlayingBack] = useState(false);
  const seqRef = useRef(0);

  const state = stateRef.current;

  useEffect(() => {
    const events = managerRef.current!.runCombatStartTriggers();
    playback(events, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function targetMaxHp(targetId: string): number {
    return targetId === state.player.id ? state.player.maxHp : state.enemy.maxHp;
  }

  /** Reproduz os eventos em sequência com pequenas pausas — a lógica já
   * decidiu tudo (TurnManager), isto só encena (spec §45). */
  function playback(events: BattleEvent[], onComplete: () => void): void {
    let i = 0;
    const step = () => {
      if (i >= events.length) {
        setTick((t) => t + 1);
        onComplete();
        return;
      }
      const ev = events[i];
      i += 1;
      if (ev.kind === 'message') setLog((prev) => [...prev.slice(-3), ev.text]);
      if (ev.kind === 'damage' || ev.kind === 'heal') {
        seqRef.current += 1;
        const big = ev.kind === 'damage' && ev.amount >= targetMaxHp(ev.targetId) * 0.35;
        setFlash({ targetId: ev.targetId, kind: ev.kind, amount: ev.amount, big, seq: seqRef.current });
      }
      setTick((t) => t + 1);
      window.setTimeout(step, PLAYBACK_MS);
    };
    step();
  }

  const act = (action: PlayerAction) => {
    if (resolved || playingBack) return;
    setPlayingBack(true);
    const events = managerRef.current!.runRound(action);
    playback(events, () => {
      setPlayingBack(false);
      if (state.phase === 'victory' || state.phase === 'defeat') {
        setResolved(true);
        window.setTimeout(() => onFinished({ victory: state.phase === 'victory', player: state.player }), 1000);
      }
    });
  };

  const zone = arcaneZone(state.player.tension);
  const overlay = arcaneOverlayFor(zone);
  const art = sceneArtFor('fissure');

  return (
    <div className="screen">
      {/* Este combate acontece na clareira leste de Borda dos Musgos, num ponto
          de distorção Arcana local — reaproveita o tratamento "lua de sangue"
          do mesmo fundo de Borda dos Musgos (spec §1/§12: mesma arte, tratamento
          diferente, em vez de exigir um asset exclusivo para o encontro). */}
      <SceneBackdrop art={{ ...art, particleColor: theme.accent, particleMotif: theme.particleMotif }} arcaneOverlay={overlay} backgroundImage={`${IMG}/backgrounds/borda-musgos-bloodmoon.webp`} />
      <div className="screen__content">
        <CombatSide name={enemy.name} flash={flash?.targetId === state.enemy.id ? flash : null}>
          <ArcaneSigil identity={{ classId: enemy.id, label: enemy.family, motif: enemy.arcaneAffinity === 'ruptura' ? 'sigil' : 'trail' }} zone={enemy.arcaneAffinity && enemy.arcaneAffinity !== 'nenhuma' ? enemy.arcaneAffinity : 'controle'} size={34} />
          <div style={{ flex: 1 }}>
            <StatusBar label="HP" value={state.enemy.hp} max={state.enemy.maxHp} color="var(--danger)" />
          </div>
        </CombatSide>

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

        <CombatSide name={character.name} flash={flash?.targetId === state.player.id ? flash : null}>
          <Portrait name={character.name} size={44} accent={theme.accent} imageUrl={character.visualProfile.portrait} />
          <div style={{ flex: 1 }}>
            <StatusBar label="HP" value={state.player.hp} max={state.player.maxHp} color="var(--danger)" />
            <StatusBar label="Foco" value={state.player.arcaneFocus} max={state.player.arcaneMax} color={theme.accent} />
            <StatusBar label="Tensão" value={state.player.tension} max={100} color="var(--gold)" />
          </div>
          <ArcaneSigil identity={identity} zone={zone} size={30} />
        </CombatSide>

        {state.phase === 'player-select' && !resolved && (
          <div className="stack" style={{ marginTop: 10 }}>
            <MysticButton variant="action" disabled={playingBack} onClick={() => act({ type: 'basicAttack' })}>
              Atacar
            </MysticButton>
            {classDef.abilities.map((ability) => (
              <MysticButton
                key={ability.id}
                variant="action"
                disabled={playingBack || state.player.arcaneFocus < ability.cost}
                onClick={() => act({ type: 'ability', ability })}
              >
                <strong>{ability.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>Foco {ability.cost}</span>
              </MysticButton>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <MysticButton variant="ghost" style={{ flex: 1 }} disabled={playingBack} onClick={() => act({ type: 'defend' })}>
                Defender
              </MysticButton>
              <MysticButton variant="ghost" style={{ flex: 1 }} disabled={playingBack} onClick={() => act({ type: 'flee' })}>
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

function CombatSide({ name, flash, children }: { name: string; flash: Flash | null; children: React.ReactNode }) {
  const shaking = flash?.kind === 'damage';
  return (
    <div
      className={shaking ? 'hit-shake' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '6px 8px',
        borderRadius: 10,
        position: 'relative',
        transition: 'background-color 0.15s ease',
        background: flash?.kind === 'damage' ? 'rgba(184,73,63,0.25)' : flash?.kind === 'heal' ? 'rgba(143,209,152,0.2)' : 'transparent',
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 2 }}>{name}</div>
        {children}
        {flash && flash.amount !== undefined && (
          <span
            key={flash.seq}
            className={`damage-number ${flash.big ? 'damage-number--crit' : ''} ${flash.kind === 'heal' ? 'damage-number--heal' : 'damage-number--hit'}`.trim()}
          >
            {flash.kind === 'heal' ? '+' : '-'}
            {flash.amount}
          </span>
        )}
      </div>
    </div>
  );
}
