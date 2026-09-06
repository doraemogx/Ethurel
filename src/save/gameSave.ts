import { saveStore } from '@/save/SaveStore';
import {
  createEmptySaveV2,
  CURRENT_SCHEMA_VERSION,
  type PlayerSaveState,
  type SaveData,
  type SaveDataV1,
  type SaveDataV2,
} from '@/save/schema';
import { migrate001To002 } from '@/save/migrations/001_to_002';

/** Chave real do save de jogo, a partir da Fase 2. */
const SAVE_KEY = 'save_slot_1';

/** Chave do save de teste da Fase 1 (ver src/core — cena removida na Fase 2).
 * Se existir e ainda não houver save em `SAVE_KEY`, é migrada e depois apagada,
 * provando que a cadeia de migração v1→v2 funciona de verdade quando aplicável. */
const LEGACY_DEV_CHECK_KEY = 'dev_boot_check';

/**
 * Carrega o save atual, migrando se necessário, e sempre devolve algo utilizável
 * (nunca lança, nunca trava o jogo por falta de save ou por save desatualizado).
 */
export function loadOrCreateSave(): SaveDataV2 {
  const current = saveStore.load<SaveData>(SAVE_KEY);
  if (current) {
    if (current.schemaVersion === CURRENT_SCHEMA_VERSION) return current as SaveDataV2;
    if (current.schemaVersion === 1) {
      const migrated = migrate001To002(current as SaveDataV1);
      saveStore.save(SAVE_KEY, migrated);
      return migrated;
    }
    // schemaVersion desconhecido/futuro (ex.: save de uma versão mais nova do
    // jogo aberto numa build antiga) — nunca apagar, guarda de lado e começa
    // um save novo em vez de travar ou corromper o existente.
    console.warn('[gameSave] schemaVersion não reconhecido, preservando save original sob backup.');
    saveStore.save(`${SAVE_KEY}__backup_unrecognized`, current);
    return createEmptySaveV2();
  }

  const legacy = saveStore.load<SaveDataV1>(LEGACY_DEV_CHECK_KEY);
  if (legacy && legacy.schemaVersion === 1) {
    const migrated = migrate001To002(legacy);
    saveStore.save(SAVE_KEY, migrated);
    saveStore.delete(LEGACY_DEV_CHECK_KEY);
    return migrated;
  }

  return createEmptySaveV2();
}

export function persistPlayerState(save: SaveDataV2, player: PlayerSaveState): boolean {
  save.player = player;
  save.updatedAt = Date.now();
  return saveStore.save(SAVE_KEY, save);
}
