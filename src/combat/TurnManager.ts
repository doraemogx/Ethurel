import type { Ability, Effect } from '@/effects/types';
import type { BattleState } from '@/combat/BattleState';
import { applyAbilityTensionGain, fireTrigger, runEffects, type ResolveContext } from '@/combat/ActionResolver';
import { tickDurations, type CombatantState } from '@/combat/Combatant';

export type BattleEvent =
  | { kind: 'message'; text: string }
  | { kind: 'attack'; casterId: string; targetId: string; ability?: string }
  | { kind: 'damage'; targetId: string; amount: number }
  | { kind: 'heal'; targetId: string; amount: number }
  | { kind: 'tension'; targetId: string; value: number }
  | { kind: 'death'; targetId: string }
  | { kind: 'victory' }
  | { kind: 'defeat' };

export type PlayerAction =
  | { type: 'basicAttack' }
  | { type: 'ability'; ability: Ability }
  | { type: 'defend' }
  | { type: 'flee' };

const BASIC_ATTACK_EFFECTS: Effect[] = [{ type: 'Damage', amount: 0, target: 'target' }];

function makeContext(
  caster: CombatantState,
  opponent: CombatantState,
  tensionMult: number,
  casterPassives: Effect[],
  log: string[]
): ResolveContext {
  return { caster, opponent, tensionMult, casterPassives, log: (m) => log.push(m) };
}

/**
 * Orquestra um round completo (ação do jogador + resposta do inimigo) e
 * devolve uma lista ORDENADA de eventos estruturados — a única fonte de
 * verdade para a animação (`CombatAnimationController`). A lógica decide
 * tudo aqui de forma síncrona e determinística ANTES de qualquer animação
 * rodar; a animação só reproduz o que já aconteceu (spec §17).
 */
export class TurnManager {
  constructor(
    private readonly state: BattleState,
    private readonly playerPassives: Effect[],
    private readonly playerTensionMult: number
  ) {}

  runCombatStartTriggers(): BattleEvent[] {
    const log: string[] = [];
    const ctxPlayer = makeContext(this.state.player, this.state.enemy, this.playerTensionMult, this.playerPassives, log);
    fireTrigger('onCombatStart', ctxPlayer);
    return log.map((text) => ({ kind: 'message', text }));
  }

  runRound(action: PlayerAction): BattleEvent[] {
    const events: BattleEvent[] = [];
    const { player, enemy } = this.state;

    this.runPlayerAction(action, events);
    if (!enemy.alive) {
      this.state.phase = 'victory';
      events.push({ kind: 'death', targetId: enemy.id }, { kind: 'victory' });
      return events;
    }

    if (action.type !== 'flee') {
      this.runEnemyAction(events);
      if (!player.alive) {
        this.state.phase = 'defeat';
        events.push({ kind: 'death', targetId: player.id }, { kind: 'defeat' });
        return events;
      }
    }

    tickDurations(player);
    tickDurations(enemy);
    this.state.round += 1;
    this.state.phase = 'player-select';
    return events;
  }

  private runPlayerAction(action: PlayerAction, events: BattleEvent[]): void {
    const { player, enemy } = this.state;
    const log: string[] = [];

    if (action.type === 'flee') {
      log.push(`${player.name} recua do combate.`);
      events.push({ kind: 'message', text: log[0] });
      return;
    }
    if (action.type === 'defend') {
      player.shield += 4;
      log.push(`${player.name} se defende, reduzindo o próximo golpe.`);
      events.push({ kind: 'message', text: log[0] });
      return;
    }

    const hpBefore = enemy.hp;
    const ctx = makeContext(player, enemy, this.playerTensionMult, this.playerPassives, log);

    if (action.type === 'basicAttack') {
      events.push({ kind: 'attack', casterId: player.id, targetId: enemy.id });
      runEffects(BASIC_ATTACK_EFFECTS.map((e) => (e.type === 'Damage' ? { ...e, amount: player.baseAtk } : e)), ctx);
    } else {
      const ability = action.ability;
      player.arcaneFocus = Math.max(0, player.arcaneFocus - ability.cost);
      events.push({ kind: 'attack', casterId: player.id, targetId: enemy.id, ability: ability.name });
      runEffects(ability.effects, ctx);
      applyAbilityTensionGain(ability.tensionGain, ctx);
      events.push({ kind: 'tension', targetId: player.id, value: player.tension });
    }

    fireTrigger('onOffensiveAction', ctx);
    player.actedOnce = true;

    const dealt = hpBefore - enemy.hp;
    if (dealt > 0) events.push({ kind: 'damage', targetId: enemy.id, amount: dealt });
    for (const text of log) events.push({ kind: 'message', text });
  }

  private runEnemyAction(events: BattleEvent[]): void {
    const { player, enemy } = this.state;
    const log: string[] = [];
    const ctx = makeContext(enemy, player, 1, [], log);
    const hpBefore = player.hp;

    events.push({ kind: 'attack', casterId: enemy.id, targetId: player.id });
    runEffects([{ type: 'Damage', amount: enemy.baseAtk, target: 'target' }], ctx);

    const dealt = hpBefore - player.hp;
    if (dealt > 0) events.push({ kind: 'damage', targetId: player.id, amount: dealt });
    for (const text of log) events.push({ kind: 'message', text });
  }
}
