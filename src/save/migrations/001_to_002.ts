import type { SaveDataV1, SaveDataV2 } from '@/save/schema';
import { DEFAULT_SPAWN } from '@/save/schema';

/**
 * v1 (Fase 1, dev-check) → v2 (Fase 2, posição + mapa atual). Um save v1 não
 * tinha nenhum conceito de personagem/posição — não há dado real para
 * preservar além do contador de sessão, então o jogador migrado nasce no
 * spawn padrão do protótipo.
 */
export function migrate001To002(old: SaveDataV1): SaveDataV2 {
  return {
    schemaVersion: 2,
    sessionCount: old.sessionCount,
    player: { ...DEFAULT_SPAWN },
    createdAt: old.createdAt,
    updatedAt: Date.now(),
  };
}
