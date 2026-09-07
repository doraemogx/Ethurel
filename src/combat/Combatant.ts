import type { StatKey, StatusCategory } from '@/effects/types';

/**
 * Modelo de combatente para o motor de turnos desta entrega. Fórmulas de
 * dano/mitigação aqui são HIPÓTESE DE TRABALHO explícita — mesmo status dos
 * números de habilidade em `src/data/classes.ts` (gate de balanceamento
 * formal antes de conteúdo de combate mais amplo). O necessário agora é um
 * combate REAL e determinístico, não a fórmula final.
 */
export interface StatModifier {
  stat: StatKey;
  delta: number;
  /** null = até o fim do combate. */
  turnsLeft: number | null;
}

export interface AppliedStatus {
  id: string;
  category: StatusCategory;
  turnsLeft: number | null;
}

export interface CombatantState {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  /** Ataque físico base — hipótese: 3 + vigor/2 para o jogador; fixo para inimigos. */
  baseAtk: number;
  baseDef: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
  marks: Set<string>;
  statuses: AppliedStatus[];
  statMods: StatModifier[];
  shield: number;
  /** true depois da primeira ação ofensiva no combate — usado por
   * `Condition{type:'IsFirstActionInCombat'}` (ex.: Lâmina Silenciosa). */
  actedOnce: boolean;
  alive: boolean;
}

export function statBonus(c: CombatantState, stat: StatKey): number {
  return c.statMods.filter((m) => m.stat === stat).reduce((sum, m) => sum + m.delta, 0);
}

export function hasMark(c: CombatantState, tag: string): boolean {
  return c.marks.has(tag);
}

export function hasStatus(c: CombatantState, status: string): boolean {
  return c.statuses.some((s) => s.id === status);
}

/** Avança durações de status/modificadores por 1 turno DESTE combatente,
 * removendo o que expirou. Chamado no início de cada turno dele. */
export function tickDurations(c: CombatantState): void {
  c.statuses = c.statuses.filter((s) => {
    if (s.turnsLeft === null) return true;
    s.turnsLeft -= 1;
    return s.turnsLeft > 0;
  });
  c.statMods = c.statMods.filter((m) => {
    if (m.turnsLeft === null) return true;
    m.turnsLeft -= 1;
    return m.turnsLeft > 0;
  });
}

export function applyDamage(target: CombatantState, amount: number): number {
  const real = Math.max(0, amount);
  target.hp = Math.max(0, target.hp - real);
  if (target.hp === 0) target.alive = false;
  return real;
}

export function applyHeal(target: CombatantState, amount: number): number {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + Math.max(0, amount));
  return target.hp - before;
}

export interface PlayerCombatantInput {
  name: string;
  vigor: number;
  hp: number;
  maxHp: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
}

/** Ataque físico base: hipótese de trabalho `3 + floor(vigor/2)` — mesmo
 * status de "hipótese pendente de spec de balanceamento" das habilidades. */
export function playerBaseAtk(vigor: number): number {
  return 3 + Math.floor(vigor / 2);
}

export function createPlayerCombatant(input: PlayerCombatantInput): CombatantState {
  return {
    id: 'player',
    name: input.name,
    isPlayer: true,
    hp: input.hp,
    maxHp: input.maxHp,
    baseAtk: playerBaseAtk(input.vigor),
    baseDef: Math.floor(input.vigor / 2),
    arcaneFocus: input.arcaneFocus,
    arcaneMax: input.arcaneMax,
    tension: input.tension,
    marks: new Set(),
    statuses: [],
    statMods: [],
    shield: 0,
    actedOnce: false,
    alive: input.hp > 0,
  };
}

export function createEnemyCombatant(id: string, name: string, hp: number, atk: number, def: number): CombatantState {
  return {
    id,
    name,
    isPlayer: false,
    hp,
    maxHp: hp,
    baseAtk: atk,
    baseDef: def,
    arcaneFocus: 0,
    arcaneMax: 0,
    tension: 0,
    marks: new Set(),
    statuses: [],
    statMods: [],
    shield: 0,
    actedOnce: false,
    alive: hp > 0,
  };
}
