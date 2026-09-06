# Migrações de save

`001_to_002.ts` — primeira migração real: `SaveDataV1` (Fase 1, dev-check) →
`SaveDataV2` (Fase 2, posição do jogador + mapa atual). Usada por
`src/save/gameSave.ts` (`loadOrCreateSave`), que decide se aplica a migração
antes de devolver o save à cena do jogo.

Quando o schema mudar de shape de novo (ex.: ao integrar inventário na Fase 4),
a mudança não edita `SaveDataV2` in-place — cria-se `SaveDataV3` em
`src/save/schema.ts` e uma função nomeada aqui, por exemplo `002_to_003.ts`,
seguindo o mesmo padrão de `001_to_002.ts`.

A cadeia de migração completa (rodar todas as funções necessárias em sequência
até chegar à versão atual, para saves muito antigos que pulam mais de uma
versão), export/import e recuperação de falha são responsabilidade da Fase 7
(`docs/design/04-VERTICAL-SLICE-E-ROADMAP.md §3`) — o que existe hoje
(`gameSave.ts`) só cobre o caso de 1 salto de versão (v1→v2), suficiente
para o que existe até agora.
