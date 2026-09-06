# Migrações de save

Ainda não há nenhuma migração — só existe `schemaVersion: 1` (Fase 1).

Quando o schema mudar de shape (ex.: ao integrar inventário na Fase 4), a mudança
não edita `SaveDataV1` in-place — cria-se `SaveDataV2` em `src/save/schema.ts` e
uma função nomeada aqui, por exemplo `001_to_002.ts`:

```ts
export function migrate001To002(old: SaveDataV1): SaveDataV2 {
  return { ...old, schemaVersion: 2, inventory: [] };
}
```

A cadeia de migração completa (rodar todas as funções necessárias em sequência
até chegar à versão atual) e o teste de fechar/reabrir após uma migração real
são responsabilidade da Fase 7 (`docs/design/04-VERTICAL-SLICE-E-ROADMAP.md §3`).
