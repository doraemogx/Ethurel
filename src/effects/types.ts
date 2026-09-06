/**
 * Vocabulário de efeitos componíveis e data-driven — a base pela qual habilidades,
 * passivas de classe, itens e inimigos expressam comportamento sem código bespoke
 * por classe. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §3 para a especificação e
 * os exemplos das 8 classes.
 *
 * 'ally' e 'allAllies' existem só como extensibilidade futura (party/companions
 * não está no escopo atual) — nada na vertical slice usa esses valores.
 */
import type { ArcaneZone } from '@/arcane/zone';
import type { IndoleTrait } from '@/social/indole';

export type TargetRef = 'self' | 'target' | 'ally' | 'allAllies';

export type Duration =
  | { kind: 'instant' }
  | { kind: 'turns'; value: number }
  | { kind: 'untilCombatEnd' }
  | { kind: 'permanent' };

export interface StackingRule {
  max: number;
  onReapply: 'refresh' | 'add' | 'ignore';
}

export type Condition =
  | { type: 'HasStatus'; status: string; target: TargetRef }
  | { type: 'HasMark'; tag: string; target: TargetRef }
  | { type: 'IsFirstActionInCombat' }
  | { type: 'HpBelowPercent'; percent: number; target: TargetRef }
  | { type: 'TensionZoneIs'; zone: ArcaneZone }
  | { type: 'IndoleAtLeast'; trait: IndoleTrait; value: number }
  | { type: 'IndoleBelow'; trait: IndoleTrait; value: number }
  | { type: 'And'; conditions: Condition[] }
  | { type: 'Or'; conditions: Condition[] }
  | { type: 'Not'; condition: Condition };

export type StatKey = 'atk' | 'def' | 'mitigation' | 'accuracy' | 'evasion';

export type TriggerEvent = 'onHit' | 'onDamaged' | 'onTurnStart' | 'onCombatStart';

/**
 * Categoria de um status aplicado — existe para permitir remoção genérica por
 * categoria (ex.: "remova uma condição negativa", sem saber qual especificamente)
 * sem depender de string mágica nem de código específico por classe. Toda
 * `ApplyStatus` declara sua categoria; `RemoveStatusByCategory` a consome.
 */
export type StatusCategory = 'negative' | 'positive' | 'neutral';

export type Effect =
  | { type: 'Damage'; amount: number; target: TargetRef }
  | { type: 'Heal'; amount: number; target: TargetRef }
  | { type: 'Shield'; amount: number; duration: Duration; target: TargetRef }
  | {
      type: 'ApplyStatus';
      status: string;
      category: StatusCategory;
      duration: Duration;
      stacking?: StackingRule;
      target: TargetRef;
    }
  | { type: 'RemoveStatus'; status: string; target: TargetRef }
  | { type: 'RemoveStatusByCategory'; category: StatusCategory; target: TargetRef }
  | {
      type: 'ModifyStat';
      stat: StatKey;
      delta: number;
      duration: Duration;
      stacking?: StackingRule;
      target: TargetRef;
    }
  | { type: 'ModifyTension'; amount: number; target: TargetRef }
  | { type: 'MarkTarget'; tag: string; duration: Duration; target: TargetRef }
  | { type: 'ConditionalEffect'; condition: Condition; then: Effect[]; else?: Effect[] }
  | { type: 'Trigger'; event: TriggerEvent; effects: Effect[] }
  | { type: 'RandomEffect'; outcomes: { weight: number; effects: Effect[] }[] };

export type AbilityTier = 'controle' | 'saturacao' | 'ruptura';

export interface Ability {
  id: string;
  name: string;
  tier: AbilityTier;
  cost: number;
  tensionGain: number;
  effects: Effect[];
}
