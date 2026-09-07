/**
 * FailureOutcome (Fase 2 §46) — derrota em combate nunca "cura para 40% e
 * segue em silêncio": tem uma descrição narrativa real e uma flag que a
 * cena seguinte lê para reagir (ver SceneScreen, cena 'return'). Só uma
 * consequência implementada nesta fatia (spec: "implementar pelo menos uma
 * consequência narrativa coerente" é suficiente aqui — game over/captura/
 * resgate ficam para quando houver mais conteúdo de combate).
 */
export type FailureOutcomeKind = 'narrative-injury';

export interface FailureOutcome {
  kind: FailureOutcomeKind;
  /** Fração do HP máximo com que o personagem sai do combate. */
  hpFactor: number;
  flag: string;
  narrativeText: string;
}

export const COMBAT_DEFEAT_OUTCOME: FailureOutcome = {
  kind: 'narrative-injury',
  hpFactor: 0.4,
  flag: 'chegou-ferido-do-limo',
  narrativeText:
    'Você não venceu — o Limo da Fissura recuou primeiro, mas só depois de deixar sua marca. Você volta a Varreth ferido, com o gosto de derrota mais amargo do que o do sangue.',
};
