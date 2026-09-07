/**
 * World State — Fase 2 §3. Formaliza a separação entre 4 camadas que antes
 * viviam misturadas conceitualmente:
 *
 * - **CANON** (`src/canon/*`): imutável, vem da Bíblia V7. Nunca é
 *   sobrescrito por save nenhum.
 * - **WORLD STATE** (este módulo): fatos mutáveis sobre entidades do mundo
 *   que persistem por CAMPANHA (não por personagem) — "isto aconteceu com
 *   esta entidade nesta campanha". Tem um default derivado do cânone (ex.:
 *   nenhuma entidade canônica é documentada como morta nas fontes lidas, então
 *   o default de `lifeState` é `'alive'`) até que algo na campanha o
 *   sobrescreva.
 * - **CAMPAIGN STATE** (`SaveDataV6` menos `character`): quests, flags
 *   narrativos, WorldEventLog, conhecimento descoberto, locais — já existiam
 *   antes desta Fase, só nomeados aqui explicitamente como a camada que são.
 * - **CHARACTER STATE** (`CharacterModel`, `save.character`): HP, XP, Índole,
 *   Reputação, Arcane, Marca, inventário — estado do personagem jogável.
 *
 * Exemplo do usuário: cânone diz que Tolven existe no início da cronologia
 * (nenhum registro de morte). Nesta campanha específica, `worldState`
 * registra `{ 'tolven-marr': { lifeState: 'dead' } }`. `resolveEntityLifeState`
 * consulta os dois e devolve 'dead' para ESTA campanha — sem alterar nada em
 * `src/canon/`, que continua dizendo que ele existe (é a fonte, não o estado
 * de uma campanha específica).
 */

export type EntityLifeState = 'alive' | 'dead' | 'missing' | 'unknown';

export interface WorldStateOverride {
  lifeState?: EntityLifeState;
  /** Local atual da entidade nesta campanha, se diferente do que o cânone/o jogo assume por padrão. */
  locationId?: string;
  /** Flags de estado livres, por campanha (ex.: `{ 'perdeu-confianca-de-varreth': true }`). */
  flags?: Record<string, boolean>;
}

export interface WorldState {
  /** Chave = canonicalId (`src/canon/entityRegistry.ts`) ou id de NPC do jogo — quem consulta decide qual espaço de id usar, mas precisa ser consistente com o que gravou. */
  entityOverrides: Record<string, WorldStateOverride>;
}

export function createEmptyWorldState(): WorldState {
  return { entityOverrides: {} };
}

const DEFAULT_LIFE_STATE: EntityLifeState = 'alive';

/** Resolve CANON (default) + WORLD STATE (override desta campanha) — nunca lê save.character nem quests, só o fato bruto sobre a entidade. */
export function resolveEntityLifeState(entityId: string, worldState: WorldState): EntityLifeState {
  return worldState.entityOverrides[entityId]?.lifeState ?? DEFAULT_LIFE_STATE;
}

export function resolveEntityLocation(entityId: string, worldState: WorldState, canonDefaultLocationId: string | undefined): string | undefined {
  return worldState.entityOverrides[entityId]?.locationId ?? canonDefaultLocationId;
}

export function hasWorldStateFlag(entityId: string, worldState: WorldState, flag: string): boolean {
  return worldState.entityOverrides[entityId]?.flags?.[flag] === true;
}

/** Atualiza (imutável) o override de uma entidade — nunca apaga overrides de outras entidades. */
export function setWorldStateOverride(worldState: WorldState, entityId: string, patch: WorldStateOverride): WorldState {
  const existing = worldState.entityOverrides[entityId] ?? {};
  return {
    entityOverrides: {
      ...worldState.entityOverrides,
      [entityId]: { ...existing, ...patch, flags: { ...existing.flags, ...patch.flags } },
    },
  };
}
