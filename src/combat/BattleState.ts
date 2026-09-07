import type { CombatantState } from '@/combat/Combatant';

export type BattlePhase = 'player-select' | 'resolving' | 'victory' | 'defeat';

export interface BattleState {
  player: CombatantState;
  enemy: CombatantState;
  round: number;
  phase: BattlePhase;
  log: string[];
}

export function createBattleState(player: CombatantState, enemy: CombatantState): BattleState {
  return { player, enemy, round: 1, phase: 'player-select', log: [] };
}
