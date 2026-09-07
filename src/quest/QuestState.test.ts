import { describe, it, expect } from 'vitest';
import { getQuestState, setQuestState } from '@/quest/QuestState';
import { createEmptySaveV3 } from '@/save/schema';

describe('QuestState', () => {
  it('progride not_started -> active -> objective_complete -> completed', () => {
    const save = createEmptySaveV3();
    expect(getQuestState(save, 'raiz-sussurrou')).toBe('not_started');

    setQuestState(save, 'raiz-sussurrou', 'active');
    expect(getQuestState(save, 'raiz-sussurrou')).toBe('active');

    setQuestState(save, 'raiz-sussurrou', 'objective_complete');
    expect(getQuestState(save, 'raiz-sussurrou')).toBe('objective_complete');

    setQuestState(save, 'raiz-sussurrou', 'completed');
    expect(getQuestState(save, 'raiz-sussurrou')).toBe('completed');
  });

  it('quests distintas não interferem entre si', () => {
    const save = createEmptySaveV3();
    setQuestState(save, 'quest-a', 'active');
    expect(getQuestState(save, 'quest-b')).toBe('not_started');
  });
});
