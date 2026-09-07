import { describe, it, expect } from 'vitest';
import { migrate004To005 } from '@/save/migrations/004_to_005';
import { createEmptySaveV4 } from '@/save/schema';
import { createCharacterModel } from '@/domain/characterFactory';

describe('migrate004To005', () => {
  it('preserva personagem, quests e eventos de mundo sem alteração', () => {
    const v4 = createEmptySaveV4();
    v4.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    v4.quests['raiz-sussurrou'] = 'active';
    v4.discoveredLocations = ['varreth', 'borda-musgos'];

    const v5 = migrate004To005(v4);

    expect(v5.schemaVersion).toBe(5);
    expect(v5.character?.name).toBe('Aldric');
    expect(v5.quests['raiz-sussurrou']).toBe('active');
    expect(v5.discoveredLocations).toEqual(['varreth', 'borda-musgos']);
  });

  it('adiciona os campos novos vazios, nunca perde dado silenciosamente', () => {
    const v5 = migrate004To005(createEmptySaveV4());
    expect(v5.echoes).toEqual([]);
    expect(v5.knowledge).toEqual([]);
    expect(v5.npcTrust).toEqual({});
  });

  it('deriva locationStates a partir de discoveredLocations (tudo visitado, é o melhor palpite honesto)', () => {
    const v4 = createEmptySaveV4();
    v4.discoveredLocations = ['varreth', 'estrada-velha'];
    const v5 = migrate004To005(v4);
    expect(v5.locationStates.varreth).toBe('visitado');
    expect(v5.locationStates['estrada-velha']).toBe('visitado');
    expect(v5.locationStates.fronteira).toBeUndefined();
  });
});
