# Migrações de save

`001_to_002.ts` — `SaveDataV1` (dev-check) → `SaveDataV2` (posição do jogador
+ mapa atual). `002_to_003.ts` — `SaveDataV2` → `SaveDataV3` (personagem
criado, progresso de quest, Índole/Reputação, Arcane, preferência de áudio).
Ambas usadas por `src/save/gameSave.ts` (`loadOrCreateSave`), que decide qual
cadeia aplicar (v1→v2→v3 ou v2→v3) antes de devolver o save à cena do jogo.

Quando o schema mudar de shape de novo, a mudança não edita `SaveDataV3`
in-place — cria-se `SaveDataV4` em `src/save/schema.ts` e uma função nomeada
aqui (`003_to_004.ts`), seguindo o mesmo padrão.

Export/import e recuperação de falha completos continuam fora do escopo
atual — o que existe hoje (`gameSave.ts`) cobre a cadeia de migração
sequencial (v1→v2→v3) e o caso de schemaVersion desconhecido (faz backup e
começa um save novo em vez de travar ou corromper o existente).
