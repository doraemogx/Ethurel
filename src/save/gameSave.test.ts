import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSlot, listSlotSummaries, hasAnyContinuableSave, forceSave, scheduleSave, flushSave, deleteSlot } from '@/save/gameSave';
import { createSaveV1Fixture, createSaveV2Fixture, createSaveV3Fixture } from '@/save/testFixtures';
import { saveStore } from '@/save/SaveStore';
import { createCharacterModel } from '@/domain/characterFactory';

describe('gameSave (multi-slot, v5)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it('new game -> save -> reload -> continue: personagem e local sobrevivem', () => {
    const save = loadSlot('slot1');
    save.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    save.currentLocationId = 'estrada-velha';
    forceSave('slot1', save);

    expect(hasAnyContinuableSave()).toBe(true);

    const reloaded = loadSlot('slot1');
    expect(reloaded.character?.name).toBe('Aldric');
    expect(reloaded.currentLocationId).toBe('estrada-velha');
  });

  it('slots vazios não aparecem como continuáveis', () => {
    expect(hasAnyContinuableSave()).toBe(false);
    const summaries = listSlotSummaries();
    expect(summaries.every((s) => !s.occupied)).toBe(true);
  });

  it('3 slots são independentes entre si', () => {
    const s1 = loadSlot('slot1');
    s1.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    forceSave('slot1', s1);

    const s2 = loadSlot('slot2');
    expect(s2.character).toBeNull();

    const summaries = listSlotSummaries();
    expect(summaries.find((s) => s.slot === 'slot1')?.characterName).toBe('Aldric');
    expect(summaries.find((s) => s.slot === 'slot2')?.occupied).toBe(false);
  });

  it('deleteSlot remove o save do slot', () => {
    const s1 = loadSlot('slot1');
    s1.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    forceSave('slot1', s1);
    expect(hasAnyContinuableSave()).toBe(true);

    deleteSlot('slot1');
    expect(hasAnyContinuableSave()).toBe(false);
  });

  it('scheduleSave faz debounce e flushSave força a gravação pendente', () => {
    vi.useFakeTimers();
    const save = loadSlot('slot1');
    save.character = createCharacterModel({ name: 'Aldric', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    scheduleSave('slot1', save);

    expect(window.localStorage.getItem('ethurel::save_slot1')).toBeNull();

    flushSave('slot1', save);
    const raw = window.localStorage.getItem('ethurel::save_slot1');
    expect(JSON.parse(raw!).character.name).toBe('Aldric');
    vi.useRealTimers();
  });

  it('migra um save v1 legado (chave única) para v5', () => {
    saveStore.save('save_slot_1', createSaveV1Fixture());
    const migrated = loadSlot('slot1');
    expect(migrated.schemaVersion).toBe(5);
    expect(migrated.character).toBeNull();
  });

  it('migra um save v2 legado (posição top-down) para v5 — nasce como campanha nova', () => {
    saveStore.save('save_slot_1', createSaveV2Fixture({ mapId: 'varreth-arredores', x: 10, y: 20 }));
    const migrated = loadSlot('slot1');
    expect(migrated.schemaVersion).toBe(5);
    expect(migrated.character).toBeNull();
    expect(migrated.currentLocationId).toBe('varreth');
  });

  it('migra um save v3 legado (personagem top-down) para v5 — nasce como campanha nova, preservando createdAt', () => {
    const v3 = createSaveV3Fixture({
      name: 'Aldric',
      gender: 'homem', // CharacterSaveStateV3 legado — não confundir com o novo Gender ('masculino'/'feminino'/'outro')
      appearance: { skinTone: 'clara', hairStyle: 'curto', hairColor: 'castanho', sigilAccent: 'esmeralda' },
      classId: 'portador-de-cinza',
      originId: 'cinzas-longas',
      hp: 36,
      maxHp: 36,
      arcaneFocus: 19,
      arcaneMax: 19,
      tension: 0,
      marca: 0,
      xp: 0,
      level: 1,
    });
    saveStore.save('save_slot_1', v3);
    const migrated = loadSlot('slot1');
    expect(migrated.schemaVersion).toBe(5);
    expect(migrated.character).toBeNull(); // formatos incompatíveis, ver 003_to_004.ts
    expect(migrated.createdAt).toBe(v3.createdAt);
  });
});
