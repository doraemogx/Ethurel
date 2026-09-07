import { describe, it, expect, beforeEach } from 'vitest';
import { loadSlot, forceSave } from '@/save/gameSave';
import { setQuestState } from '@/quest/QuestState';
import { resolveWorldEvent, type IndoleState, type ReputationState } from '@/social/indole';
import { createCharacterModel } from '@/domain/characterFactory';
import { WorldEventLog } from '@/domain/worldEvents';

describe('Persistência: quest/reputação/índole/worldEvents sobrevivem ao reload', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('progresso de quest, Índole, Reputação e WorldEventLog persistem depois de um reload simulado', () => {
    const save = loadSlot('slot1');
    save.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    setQuestState(save, 'raiz-sussurrou', 'objective_complete');

    const social = resolveWorldEvent(
      { indole: save.character.indole as IndoleState, reputation: save.character.reputation as ReputationState },
      {
        id: 'raiz-sussurrou:reportou',
        indoleDelta: [{ trait: 'honra', delta: 3 }],
        reputationDelta: [{ entity: 'varreth', delta: 5 }],
        witnesses: 'public',
      }
    );
    save.character.indole = social.indole;
    save.character.reputation = social.reputation;
    setQuestState(save, 'raiz-sussurrou', 'completed');

    const log = new WorldEventLog(save.worldEvents);
    log.record({ actor: 'player', action: 'reportou a descoberta', location: 'varreth', witnesses: ['tolven'], result: 'reputação com Varreth aumentou', tags: ['raiz-sussurrou'] });
    save.worldEvents = log.toJSON();

    forceSave('slot1', save);

    const reloaded = loadSlot('slot1');
    expect(reloaded.quests['raiz-sussurrou']).toBe('completed');
    expect(reloaded.character?.indole.honra).toBe(3);
    expect(reloaded.character?.reputation.varreth).toBe(5);
    expect(reloaded.worldEvents.length).toBe(1);
    expect(reloaded.worldEvents[0].tags).toContain('raiz-sussurrou');
  });
});
