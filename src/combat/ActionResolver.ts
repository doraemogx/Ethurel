import type { Condition, Effect, TargetRef, TriggerEvent } from '@/effects/types';
import { arcaneZone } from '@/arcane/zone';
import {
  applyDamage,
  applyHeal,
  hasMark,
  hasStatus,
  statBonus,
  type CombatantState,
} from '@/combat/Combatant';

export interface ResolveContext {
  caster: CombatantState;
  opponent: CombatantState;
  /** Multiplicador de ganho de Tensão da classe do lançador (ex.: `tensionMult`
   * em `ClassDefinition`) — 1 para quem não tem (inimigos). */
  tensionMult: number;
  /** Passivas de quem está agindo — disparadas pelos triggers relevantes
   * durante a resolução (onTensionGain/onOffensiveAction). */
  casterPassives: Effect[];
  log: (message: string) => void;
}

function resolveTarget(ref: TargetRef, ctx: ResolveContext): CombatantState {
  // 'ally'/'allAllies' são extensibilidade futura (sem party nesta slice) —
  // nunca deveriam ser alcançados pelos dados usados aqui; caem em 'self'
  // como fallback seguro em vez de travar o combate.
  if (ref === 'target') return ctx.opponent;
  return ctx.caster;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function evalCondition(cond: Condition, ctx: ResolveContext): boolean {
  switch (cond.type) {
    case 'HasStatus':
      return hasStatus(resolveTarget(cond.target, ctx), cond.status);
    case 'HasMark':
      return hasMark(resolveTarget(cond.target, ctx), cond.tag);
    case 'IsFirstActionInCombat':
      return !ctx.caster.actedOnce;
    case 'HpBelowPercent': {
      const t = resolveTarget(cond.target, ctx);
      return (t.hp / t.maxHp) * 100 < cond.percent;
    }
    case 'TensionZoneIs':
      return arcaneZone(ctx.caster.tension) === cond.zone;
    case 'IndoleAtLeast':
    case 'IndoleBelow':
      // Índole não é modelada por combatente nesta slice de combate (é
      // estado do jogador, não do "duelo") — condição nunca satisfeita aqui
      // em vez de lançar; nenhuma habilidade usada nesta build depende disso.
      return false;
    case 'And':
      return cond.conditions.every((c) => evalCondition(c, ctx));
    case 'Or':
      return cond.conditions.some((c) => evalCondition(c, ctx));
    case 'Not':
      return !evalCondition(cond.condition, ctx);
  }
}

function addTension(target: CombatantState, rawAmount: number, ctx: ResolveContext): void {
  if (rawAmount <= 0) {
    target.tension = clamp(target.tension + rawAmount, 0, 100);
    return;
  }
  const scaled = target === ctx.caster ? Math.round(rawAmount * ctx.tensionMult) : rawAmount;
  target.tension = clamp(target.tension + scaled, 0, 100);
  if (target === ctx.caster) {
    fireTrigger('onTensionGain', ctx);
  }
}

export function runEffects(effects: Effect[], ctx: ResolveContext): void {
  for (const effect of effects) runEffect(effect, ctx);
}

function runEffect(effect: Effect, ctx: ResolveContext): void {
  switch (effect.type) {
    case 'Damage': {
      const target = resolveTarget(effect.target, ctx);
      if (effect.target === 'self') {
        const dealt = applyDamage(target, effect.amount);
        ctx.log(`${target.name} sofre ${dealt} de dano.`);
        return;
      }
      const atkBonus = statBonus(ctx.caster, 'atk');
      const mitigation = clamp(statBonus(target, 'mitigation'), 0, 80);
      const raw = (effect.amount + atkBonus - target.baseDef) * (1 - mitigation / 100);
      const finalAmount = Math.max(1, Math.round(raw));
      let dealt = finalAmount;
      if (target.shield > 0) {
        const absorbed = Math.min(target.shield, dealt);
        target.shield -= absorbed;
        dealt -= absorbed;
      }
      const realDealt = applyDamage(target, dealt);
      ctx.log(`${ctx.caster.name} causa ${finalAmount} de dano em ${target.name}${target.shield > 0 || realDealt < finalAmount ? ' (parte absorvida por escudo)' : ''}.`);
      return;
    }
    case 'Heal': {
      const target = resolveTarget(effect.target, ctx);
      const healed = applyHeal(target, effect.amount);
      ctx.log(`${target.name} recupera ${healed} de vida.`);
      return;
    }
    case 'Shield': {
      const target = resolveTarget(effect.target, ctx);
      target.shield += effect.amount;
      ctx.log(`${target.name} ganha um escudo de ${effect.amount}.`);
      return;
    }
    case 'ApplyStatus': {
      const target = resolveTarget(effect.target, ctx);
      const turnsLeft = effect.duration.kind === 'turns' ? effect.duration.value : effect.duration.kind === 'instant' ? 0 : null;
      if (turnsLeft !== 0) target.statuses.push({ id: effect.status, category: effect.category, turnsLeft });
      return;
    }
    case 'RemoveStatus': {
      const target = resolveTarget(effect.target, ctx);
      target.statuses = target.statuses.filter((s) => s.id !== effect.status);
      return;
    }
    case 'RemoveStatusByCategory': {
      const target = resolveTarget(effect.target, ctx);
      target.statuses = target.statuses.filter((s) => s.category !== effect.category);
      return;
    }
    case 'ModifyStat': {
      const target = resolveTarget(effect.target, ctx);
      const turnsLeft = effect.duration.kind === 'turns' ? effect.duration.value : effect.duration.kind === 'instant' ? 0 : null;
      if (effect.stacking?.onReapply === 'refresh') {
        target.statMods = target.statMods.filter((m) => m.stat !== effect.stat);
      }
      const existingCount = target.statMods.filter((m) => m.stat === effect.stat).length;
      const max = effect.stacking?.max ?? Infinity;
      if (existingCount < max) target.statMods.push({ stat: effect.stat, delta: effect.delta, turnsLeft });
      return;
    }
    case 'ModifyTension': {
      const target = resolveTarget(effect.target, ctx);
      addTension(target, effect.amount, ctx);
      return;
    }
    case 'MarkTarget': {
      const target = resolveTarget(effect.target, ctx);
      target.marks.add(effect.tag);
      return;
    }
    case 'ConditionalEffect': {
      if (evalCondition(effect.condition, ctx)) runEffects(effect.then, ctx);
      else if (effect.else) runEffects(effect.else, ctx);
      return;
    }
    case 'Trigger': {
      // Alcançado só se um efeito de habilidade (não passiva) contiver um
      // Trigger aninhado — não usado pelos dados atuais; executa incondicional.
      runEffects(effect.effects, ctx);
      return;
    }
    case 'RandomEffect': {
      const totalWeight = effect.outcomes.reduce((s, o) => s + o.weight, 0);
      let roll = Math.random() * totalWeight;
      for (const outcome of effect.outcomes) {
        roll -= outcome.weight;
        if (roll <= 0) {
          runEffects(outcome.effects, ctx);
          return;
        }
      }
      return;
    }
  }
}

export function fireTrigger(event: TriggerEvent, ctx: ResolveContext): void {
  for (const passive of ctx.casterPassives) {
    if (passive.type === 'Trigger' && passive.event === event) runEffects(passive.effects, ctx);
  }
}

/** Aplica `ability.tensionGain` (campo próprio da habilidade, além de
 * qualquer `ModifyTension` dentro de `effects`) — dispara onTensionGain. */
export function applyAbilityTensionGain(amount: number, ctx: ResolveContext): void {
  if (amount === 0) return;
  addTension(ctx.caster, amount, ctx);
}
