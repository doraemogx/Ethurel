/**
 * Arquitetura de animação do personagem — data-driven, para que adicionar
 * attack/cast/hurt/death mais tarde seja popular este mapa, não reescrever o
 * PlayerController. Ver docs/design/05-DIRECAO-DE-ARTE.md §3 (VFX) para o
 * pipeline visual que ataques usarão quando o combate existir (Fase 5+).
 *
 * Nenhum estado além de idle/walk* é populado nesta build — os packs com
 * licença confirmada (Kenney) não têm personagem animado com direções, e o
 * pack que teria attack/cast/hurt/death (LPC) não teve a licença confirmada
 * pelo material recebido (ver CREDITS.md). `attack`/`cast`/`hurt`/`death`
 * ficam com tipo válido mas **não registrados** — código que os consome
 * precisa checar presença, nunca assumir que existem.
 */
export type AnimationState =
  | 'idle'
  | 'walkDown'
  | 'walkUp'
  | 'walkSide'
  | 'attack'
  | 'cast'
  | 'hurt'
  | 'death';

export interface AnimationClip {
  /** Índices de frame na textura do personagem, na ordem de reprodução. */
  frames: number[];
  frameDurationMs: number;
  loop: boolean;
}

export type CharacterAnimationSet = Partial<Record<AnimationState, AnimationClip>>;

export function getClip(set: CharacterAnimationSet, state: AnimationState): AnimationClip | undefined {
  return set[state];
}
