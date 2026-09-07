/**
 * Camada d20 de Ethurel — sistema próprio, não importa classes/spells de D&D.
 * Ver docs/design/07-NOVO-FORMATO-NARRATIVO.md §"Regras d20" para a
 * justificativa de design.
 *
 * CONVENÇÃO DE MODIFICADOR (documentada aqui por ser a única fonte de
 * verdade): Vigor/Reflexo/Mente/Presença já são números pequenos e diretos
 * (tipicamente 2–6 na criação, ver `src/data/classes.ts` `baseAttrs`) — não
 * é a escala 8–18 de D&D, então NÃO se converte com `(score-10)/2`. O
 * atributo bruto É o modificador somado ao d20. Isso já é consistente com o
 * resto do código (ex.: `playerBaseAtk = 3 + floor(vigor/2)` em
 * `src/combat/Combatant.ts` usa o mesmo atributo bruto pequeno).
 *
 * Fórmulas já aprovadas e preservadas sem alteração:
 *   HP = 16 + Vigor*4
 *   Foco = 10 + Mente*4
 */
export const HP_BASE = 16;
export const HP_PER_VIGOR = 4;
export const FOCUS_BASE = 10;
export const FOCUS_PER_MENTE = 4;

export function computeMaxHp(vigor: number): number {
  return HP_BASE + vigor * HP_PER_VIGOR;
}

export function computeMaxFocus(mente: number): number {
  return FOCUS_BASE + mente * FOCUS_PER_MENTE;
}

export type AdvantageState = 'normal' | 'advantage' | 'disadvantage';

export interface D20RollResult {
  /** Cada d20 realmente rolado (1 dado em modo normal, 2 em vantagem/desvantagem). */
  rawRolls: number[];
  /** O d20 escolhido (maior em vantagem, menor em desvantagem). */
  chosenRoll: number;
  modifier: number;
  total: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  advantageState: AdvantageState;
}

export interface D20CheckResult extends D20RollResult {
  dc: number;
  success: boolean;
}

/** Injetável para testes determinísticos — nunca usar Math.random() direto
 * fora daqui, para que toda rolagem do jogo passe por um único ponto. */
export type RandomSource = () => number;

const defaultRandom: RandomSource = Math.random;

function rollOneD20(random: RandomSource): number {
  return Math.floor(random() * 20) + 1;
}

/** Rola 1d20 (ou 2 em vantagem/desvantagem) e aplica o modificador — não
 * decide sucesso/falha sozinho (isso depende de uma DC, ver `checkD20`). */
export function rollD20(
  modifier: number,
  advantageState: AdvantageState = 'normal',
  random: RandomSource = defaultRandom
): D20RollResult {
  const rawRolls = advantageState === 'normal' ? [rollOneD20(random)] : [rollOneD20(random), rollOneD20(random)];
  const chosenRoll =
    advantageState === 'advantage'
      ? Math.max(...rawRolls)
      : advantageState === 'disadvantage'
        ? Math.min(...rawRolls)
        : rawRolls[0];

  return {
    rawRolls,
    chosenRoll,
    modifier,
    total: chosenRoll + modifier,
    isCriticalSuccess: chosenRoll === 20,
    isCriticalFailure: chosenRoll === 1,
    advantageState,
  };
}

/** Teste de atributo/perícia contra uma DC. Crítico (natural 20) sempre
 * sucede; falha crítica (natural 1) sempre falha — mesmo contra DCs
 * extremas — convenção padrão de sistemas d20, documentada aqui. */
export function checkD20(
  modifier: number,
  dc: number,
  advantageState: AdvantageState = 'normal',
  random: RandomSource = defaultRandom
): D20CheckResult {
  const roll = rollD20(modifier, advantageState, random);
  const success = roll.isCriticalSuccess ? true : roll.isCriticalFailure ? false : roll.total >= dc;
  return { ...roll, dc, success };
}

export interface OpposedCheckResult {
  attacker: D20RollResult;
  defender: D20RollResult;
  attackerWins: boolean;
}

/** Teste oposto (ex.: furtividade vs. percepção). Empate favorece o
 * defensor — convenção documentada, não um detalhe escondido. */
export function opposedCheckD20(
  attackerModifier: number,
  defenderModifier: number,
  attackerAdvantage: AdvantageState = 'normal',
  defenderAdvantage: AdvantageState = 'normal',
  random: RandomSource = defaultRandom
): OpposedCheckResult {
  const attacker = rollD20(attackerModifier, attackerAdvantage, random);
  const defender = rollD20(defenderModifier, defenderAdvantage, random);
  return { attacker, defender, attackerWins: attacker.total > defender.total };
}
