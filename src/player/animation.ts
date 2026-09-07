/**
 * Arquitetura de animação do personagem — data-driven: popular este mapa é
 * o único trabalho para adicionar um novo estado, nunca reescrever o
 * PlayerController. Ver docs/design/05-DIRECAO-DE-ARTE.md §3 (VFX) para o
 * pipeline visual de combate (Fase de combate desta entrega).
 *
 * 'walkLeft'/'walkRight' substituem o antigo 'walkSide'+flip do ciclo
 * anterior — o spritesheet real (Mighty Pack, ver src/player/sprite.ts) tem
 * frames verdadeiros para as 4 direções, então usamos os frames reais em
 * vez de espelhar um único lado (mais fiel à arte original, que pode ter
 * detalhes assimétricos).
 *
 * `attack`/`cast`/`hurt`/`death` não são populados aqui (o sprite de mundo
 * não precisa deles — a representação do jogador em combate usa um
 * personagem diferente, ver src/combat/), mas o tipo continua existindo
 * para qualquer consumidor futuro que precise checar presença.
 */
export type AnimationState =
  | 'idle'
  | 'walkDown'
  | 'walkUp'
  | 'walkLeft'
  | 'walkRight'
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
