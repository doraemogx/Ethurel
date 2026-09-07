import { saveStore } from '@/save/SaveStore';
import {
  createEmptySaveV3,
  CURRENT_SCHEMA_VERSION,
  type PlayerSaveState,
  type SaveData,
  type SaveDataV1,
  type SaveDataV2,
  type SaveDataV3,
} from '@/save/schema';
import { migrate001To002 } from '@/save/migrations/001_to_002';
import { migrate002To003 } from '@/save/migrations/002_to_003';

const SAVE_KEY = 'save_slot_1';
const LEGACY_DEV_CHECK_KEY = 'dev_boot_check';

/** Só grava se `save` foi marcado sujo desde a última gravação (ver
 * `scheduleSave`/`flushSave` abaixo) — versão anterior gravava a cada 500ms
 * SEMPRE, independentemente de ter havido mudança real. */
export function loadOrCreateSave(): SaveDataV3 {
  const current = saveStore.load<SaveData>(SAVE_KEY);
  if (current) {
    if (current.schemaVersion === CURRENT_SCHEMA_VERSION) return current as SaveDataV3;
    if (current.schemaVersion === 2) {
      const migrated = migrate002To003(current as SaveDataV2);
      saveStore.save(SAVE_KEY, migrated);
      return migrated;
    }
    if (current.schemaVersion === 1) {
      const v2 = migrate001To002(current as SaveDataV1);
      const v3 = migrate002To003(v2);
      saveStore.save(SAVE_KEY, v3);
      return v3;
    }
    console.warn('[gameSave] schemaVersion não reconhecido, preservando save original sob backup.');
    saveStore.save(`${SAVE_KEY}__backup_unrecognized`, current);
    return createEmptySaveV3();
  }

  const legacy = saveStore.load<SaveDataV1>(LEGACY_DEV_CHECK_KEY);
  if (legacy && legacy.schemaVersion === 1) {
    const v2 = migrate001To002(legacy);
    const v3 = migrate002To003(v2);
    saveStore.save(SAVE_KEY, v3);
    saveStore.delete(LEGACY_DEV_CHECK_KEY);
    return v3;
  }

  return createEmptySaveV3();
}

/** Existe um save de personagem utilizável (para decidir New Game vs Continue
 * na tela de título) sem precisar carregar/migrar tudo primeiro. */
export function hasContinuableSave(): boolean {
  const current = saveStore.load<SaveData>(SAVE_KEY);
  if (!current) return false;
  if (current.schemaVersion === 3) return (current as SaveDataV3).character !== null;
  return false;
}

// ---- Autosave: dirty-flag + debounce, nunca grava sem mudança real ----

const DEBOUNCE_MS = 2000;
let dirty = false;
let debounceHandle: ReturnType<typeof setTimeout> | null = null;

function writeNow(save: SaveDataV3): void {
  save.updatedAt = Date.now();
  saveStore.save(SAVE_KEY, save);
  dirty = false;
  if (debounceHandle !== null) {
    clearTimeout(debounceHandle);
    debounceHandle = null;
  }
}

/** Marca o save como sujo e agenda uma gravação debounced (no máx. 1 a cada
 * `DEBOUNCE_MS`, coalescendo qualquer número de chamadas nesse intervalo em
 * uma única escrita) — usar para mudanças de rotina (posição durante
 * movimento). Para eventos importantes (quest, decisão, fim de combate),
 * prefira `flushSave` (grava imediatamente). */
export function scheduleSave(save: SaveDataV3): void {
  dirty = true;
  if (debounceHandle !== null) return;
  debounceHandle = setTimeout(() => writeNow(save), DEBOUNCE_MS);
}

/** Grava imediatamente se houver mudança pendente — usar em visibilitychange
 * (app indo para background) e após eventos que não podem se perder. */
export function flushSave(save: SaveDataV3): void {
  if (!dirty) return;
  writeNow(save);
}

/** Força gravação mesmo sem `dirty` (usar só logo após uma mutação síncrona
 * que o chamador sabe ser real, ex.: conclusão de criação de personagem). */
export function forceSave(save: SaveDataV3): void {
  dirty = true;
  writeNow(save);
}

export function persistPlayerState(save: SaveDataV3, player: PlayerSaveState): void {
  save.player = player;
  scheduleSave(save);
}
