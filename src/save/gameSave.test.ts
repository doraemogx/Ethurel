import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadOrCreateSave, hasContinuableSave, forceSave, scheduleSave, flushSave } from '@/save/gameSave';
import { createEmptySaveV1V2Fixture } from '@/save/testFixtures';
import { saveStore } from '@/save/SaveStore';
import { VARRETH_OUTSKIRTS_MAP_ID, type CharacterSaveState } from '@/save/schema';

const SAVE_KEY = 'save_slot_1';

function makeCharacter(): CharacterSaveState {
  return {
    name: 'Aldric',
    gender: 'homem',
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
  };
}

describe('gameSave', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it('new game -> save -> reload -> continue: personagem e posição sobrevivem', () => {
    const save = loadOrCreateSave();
    save.character = makeCharacter();
    save.player = { mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 123, y: 456 };
    forceSave(save);

    expect(hasContinuableSave()).toBe(true);

    // "Reload": carrega de novo do zero, como se fosse uma nova sessão.
    const reloaded = loadOrCreateSave();
    expect(reloaded.character?.name).toBe('Aldric');
    expect(reloaded.player).toEqual({ mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 123, y: 456 });
  });

  it('sem personagem criado, não há save continuável', () => {
    const save = loadOrCreateSave();
    expect(save.character).toBeNull();
    expect(hasContinuableSave()).toBe(false);
  });

  it('scheduleSave faz debounce (não grava sincronamente) e flushSave força gravação pendente', () => {
    vi.useFakeTimers();
    const save = loadOrCreateSave();
    save.character = makeCharacter();
    scheduleSave(save);

    // Ainda não deveria ter gravado (debounce).
    const raw = window.localStorage.getItem('ethurel::' + SAVE_KEY);
    expect(raw).toBeNull();

    flushSave(save);
    const rawAfter = window.localStorage.getItem('ethurel::' + SAVE_KEY);
    const parsedAfter = JSON.parse(rawAfter!);
    expect(parsedAfter.character.name).toBe('Aldric');
    vi.useRealTimers();
  });

  it('migra um save v1 (fixture legado) preservando o que é possível', () => {
    saveStore.save(SAVE_KEY, createEmptySaveV1V2Fixture(1));
    const migrated = loadOrCreateSave();
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.character).toBeNull();
  });

  it('migra um save v2 (posição/mapa, sem personagem) preservando a posição', () => {
    saveStore.save(SAVE_KEY, createEmptySaveV1V2Fixture(2, { mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 10, y: 20 }));
    const migrated = loadOrCreateSave();
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.player).toEqual({ mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 10, y: 20 });
    expect(migrated.character).toBeNull();
  });
});
