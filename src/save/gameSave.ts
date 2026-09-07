import { saveStore } from '@/save/SaveStore';
import {
  createEmptySaveV4,
  CURRENT_SCHEMA_VERSION,
  type SaveData,
  type SaveDataV1,
  type SaveDataV2,
  type SaveDataV3,
  type SaveDataV4,
} from '@/save/schema';
import { migrate001To002 } from '@/save/migrations/001_to_002';
import { migrate002To003 } from '@/save/migrations/002_to_003';
import { migrate003To004 } from '@/save/migrations/003_to_004';
import { CLASSES } from '@/data/classes';

export const SAVE_SLOT_IDS = ['slot1', 'slot2', 'slot3'] as const;
export type SaveSlotId = (typeof SAVE_SLOT_IDS)[number];

function slotKey(slot: SaveSlotId): string {
  return `save_${slot}`;
}

const LEGACY_SAVE_KEY = 'save_slot_1'; // chave única usada pelo protótipo top-down (v1-v3)

function migrateToV4(data: SaveData): SaveDataV4 {
  if (data.schemaVersion === 4) return data;
  if (data.schemaVersion === 3) return migrate003To004(data as SaveDataV3);
  if (data.schemaVersion === 2) return migrate003To004(migrate002To003(data as SaveDataV2));
  return migrate003To004(migrate002To003(migrate001To002(data as SaveDataV1)));
}

/** Carrega um slot específico, migrando se necessário. Nunca lança. */
export function loadSlot(slot: SaveSlotId): SaveDataV4 {
  const current = saveStore.load<SaveData>(slotKey(slot));
  if (current) {
    if (current.schemaVersion === CURRENT_SCHEMA_VERSION) return current as SaveDataV4;
    const migrated = migrateToV4(current);
    saveStore.save(slotKey(slot), migrated);
    return migrated;
  }

  // slot1 herda o save único do protótipo top-down, se existir (evita
  // "perder" o único save que alguém possa ter de antes da reconstrução).
  if (slot === 'slot1') {
    const legacy = saveStore.load<SaveData>(LEGACY_SAVE_KEY);
    if (legacy) {
      const migrated = migrateToV4(legacy);
      saveStore.save(slotKey(slot), migrated);
      return migrated;
    }
  }

  return createEmptySaveV4();
}

export interface SaveSlotSummary {
  slot: SaveSlotId;
  occupied: boolean;
  characterName?: string;
  className?: string;
  locationId?: string;
  updatedAt?: number;
}

export function listSlotSummaries(): SaveSlotSummary[] {
  return SAVE_SLOT_IDS.map((slot) => {
    const raw = saveStore.load<SaveData>(slotKey(slot)) ?? (slot === 'slot1' ? saveStore.load<SaveData>(LEGACY_SAVE_KEY) : null);
    if (!raw) return { slot, occupied: false };
    const data = migrateToV4(raw);
    if (!data.character) return { slot, occupied: false };
    const className = CLASSES.find((c) => c.id === data.character!.classId)?.name;
    return {
      slot,
      occupied: true,
      characterName: data.character.name,
      className,
      locationId: data.currentLocationId,
      updatedAt: data.updatedAt,
    };
  });
}

export function hasAnyContinuableSave(): boolean {
  return listSlotSummaries().some((s) => s.occupied);
}

// ---- Autosave: dirty-flag + debounce, nunca grava sem mudança real ----

const DEBOUNCE_MS = 1500;
const dirtySlots = new Set<SaveSlotId>();
const debounceHandles = new Map<SaveSlotId, ReturnType<typeof setTimeout>>();

function writeNow(slot: SaveSlotId, save: SaveDataV4): void {
  save.updatedAt = Date.now();
  saveStore.save(slotKey(slot), save);
  dirtySlots.delete(slot);
  const handle = debounceHandles.get(slot);
  if (handle) {
    clearTimeout(handle);
    debounceHandles.delete(slot);
  }
}

export function scheduleSave(slot: SaveSlotId, save: SaveDataV4): void {
  dirtySlots.add(slot);
  if (debounceHandles.has(slot)) return;
  debounceHandles.set(
    slot,
    setTimeout(() => writeNow(slot, save), DEBOUNCE_MS)
  );
}

export function flushSave(slot: SaveSlotId, save: SaveDataV4): void {
  if (!dirtySlots.has(slot)) return;
  writeNow(slot, save);
}

export function forceSave(slot: SaveSlotId, save: SaveDataV4): void {
  dirtySlots.add(slot);
  writeNow(slot, save);
}

export function deleteSlot(slot: SaveSlotId): void {
  saveStore.delete(slotKey(slot));
  if (slot === 'slot1') saveStore.delete(LEGACY_SAVE_KEY);
}
