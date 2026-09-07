/**
 * Fail Forward (Fase 2 §22, recuperado do handoff: "falha sempre muda algo,
 * nunca é tente de novo"). `TestRepeatability` decide o que acontece depois
 * de uma falha — código decide, nunca a IA. Vocabulário completo definido
 * aqui; aplicado nos testes reais do primeiro capítulo em `SceneScreen`.
 */
export type TestRepeatability = 'repeatable' | 'lockedAfterFailure' | 'oneShot' | 'changedAfterFailure';

export interface TestSpec {
  id: string;
  repeatability: TestRepeatability;
  /** Mostrado só quando `repeatability` é 'changedAfterFailure' e o teste já falhou uma vez. */
  changedPromptOnRetry?: string;
}

export function canRetryTest(spec: TestSpec, alreadyFailedIds: string[]): boolean {
  const hasFailed = alreadyFailedIds.includes(spec.id);
  if (!hasFailed) return true;
  if (spec.repeatability === 'repeatable') return true;
  if (spec.repeatability === 'changedAfterFailure') return true;
  return false; // lockedAfterFailure, oneShot
}
