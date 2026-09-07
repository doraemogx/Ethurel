import { describe, it, expect, beforeEach } from 'vitest';
import { loadOrCreateSave, forceSave } from '@/save/gameSave';
import { setQuestState } from '@/quest/QuestState';
import { createInitialIndole, createInitialReputation, resolveWorldEvent, type IndoleState, type ReputationState } from '@/social/indole';

describe('Persistência: quest/reputação/índole sobrevivem ao reload', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('progresso de quest, Índole e Reputação persistem depois de um reload simulado', () => {
    const save = loadOrCreateSave();
    save.indole = createInitialIndole();
    save.reputation = createInitialReputation();
    setQuestState(save, 'raiz-sussurrou', 'objective_complete');

    const social = resolveWorldEvent(
      { indole: save.indole as IndoleState, reputation: save.reputation as ReputationState },
      {
        id: 'raiz-sussurrou:reportou',
        indoleDelta: [{ trait: 'honra', delta: 3 }],
        reputationDelta: [{ entity: 'varreth', delta: 5 }],
        witnesses: 'public',
      }
    );
    save.indole = social.indole;
    save.reputation = social.reputation;
    setQuestState(save, 'raiz-sussurrou', 'completed');
    forceSave(save);

    // "Reload": nova leitura do zero.
    const reloaded = loadOrCreateSave();
    expect(reloaded.quests['raiz-sussurrou']).toBe('completed');
    expect(reloaded.indole.honra).toBe(3);
    expect(reloaded.reputation.varreth).toBe(5);
  });
});
