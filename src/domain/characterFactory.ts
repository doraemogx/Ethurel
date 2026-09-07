import type { CharacterModel, Gender, OriginCharacter } from '@/characters/types';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { computeMaxHp, computeMaxFocus } from '@/domain/dice';
import { applyIndoleDelta, createInitialIndole, createInitialReputation, type IndoleDelta } from '@/social/indole';
import { arcaneIdentityForClass } from '@/arcane/identity';
import type { Attrs } from '@/classes/types';
import type { CreationOption } from '@/data/characterCreationOptions';

export interface CreateCharacterInput {
  name: string;
  gender: Gender;
  classId: string;
  originId: string;
  /** Princípio/Desejo/Medo/Limite recuperados do handoff (spec Fase 2 §16) —
   * opcionais para não obrigar o fluxo de criação; quando presentes, o seed
   * de Índole de Princípio/Desejo é aplicado. */
  principle?: CreationOption;
  desire?: CreationOption;
  fear?: CreationOption;
  limit?: CreationOption;
}

function applyOriginBonus(base: Attrs, bonus: Partial<Attrs>): Attrs {
  return {
    vigor: base.vigor + (bonus.vigor ?? 0),
    reflexo: base.reflexo + (bonus.reflexo ?? 0),
    mente: base.mente + (bonus.mente ?? 0),
    presenca: base.presenca + (bonus.presenca ?? 0),
  };
}

export function createCharacterModel(input: CreateCharacterInput): CharacterModel {
  const classDef = CLASSES.find((c) => c.id === input.classId) ?? CLASSES[0];
  const origin = ORIGINS.find((o) => o.id === input.originId) ?? ORIGINS[0];
  const attrs = applyOriginBonus(classDef.baseAttrs, origin.attrBonus);
  const maxHp = computeMaxHp(attrs.vigor);
  const maxFocus = computeMaxFocus(attrs.mente);

  const seedDeltas: IndoleDelta[] = [...(input.principle?.indoleSeed ?? []), ...(input.desire?.indoleSeed ?? [])];

  return {
    name: input.name || 'Viajante',
    gender: input.gender,
    classId: classDef.id,
    originId: origin.id,
    attrs,
    hp: maxHp,
    maxHp,
    arcaneFocus: maxFocus,
    arcaneMax: maxFocus,
    tension: 0,
    marca: 0,
    indole: applyIndoleDelta(createInitialIndole(), seedDeltas),
    reputation: createInitialReputation(),
    gold: 0,
    xp: 0,
    level: 1,
    inventory: [...classDef.startingItems, ...(origin.startingItem ? [origin.startingItem] : [])],
    quests: [],
    location: 'varreth',
    visualProfile: { visualTheme: classDef.id },
    principle: input.principle?.text,
    desire: input.desire?.text,
    fear: input.fear?.text,
    limit: input.limit?.text,
    arcaneIdentityId: arcaneIdentityForClass(classDef.id).classId,
  };
}

/** Personagem de Origem — passado próprio, mas Índole ainda emerge do jogo:
 * `startingIndoleBias` é aplicado como uma pequena inclinação inicial (via
 * `applyIndoleDelta`, os mesmos deltas do resto do jogo), nunca um valor
 * fixo especial só para estes personagens. */
export function createCharacterFromOrigin(origin: OriginCharacter): CharacterModel {
  const base = createCharacterModel({ name: origin.name, gender: origin.gender, classId: origin.classId, originId: origin.originId });
  const biasDeltas = Object.entries(origin.startingIndoleBias).map(([trait, delta]) => ({
    trait: trait as keyof typeof base.indole,
    delta: delta ?? 0,
  }));
  return {
    ...base,
    indole: applyIndoleDelta(base.indole, biasDeltas),
    past: origin.background,
    desire: origin.personalGoal,
    fear: origin.fear,
    visualProfile: origin.visualProfile,
    originCharacterId: origin.id,
    arcaneIdentityId: arcaneIdentityForClass(origin.classId).classId,
  };
}
