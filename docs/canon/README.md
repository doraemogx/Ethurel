# docs/canon/

Camada técnica consultável da Bíblia Canônica V7 de Ethurel — não uma cópia
do documento, mas a estrutura que vai recebê-lo em pedaços recuperáveis por
tema/entidade (ver `CANON_INGESTION_PLAN.md`).

- **`CANON_CORE.md`** — pequeno, só fatos fundamentais que nunca podem ser
  violados arbitrariamente. Comece por aqui.
- **`CANON_CONFLICTS.md`** — divergências encontradas entre o cânone V7 e o
  jogo/documentação existente, com severidade e recomendação (sem decidir
  por conta própria).
- **`GLOSSARY.md`** — termos confirmados, cresce incrementalmente.
- **`CANON_INGESTION_PLAN.md`** — o que já foi lido da Bíblia, o que falta,
  como o resto será processado.
- **Subdiretórios temáticos** (`arcane/`, `history/`, `geography/`,
  `regions/`, `cities/`, `peoples/`, `cultures/`, `religions/`, `classes/`,
  `origins/`, `origin-characters/`, `npcs/`, `factions/`, `politics/`,
  `bestiary/`, `items/`, `relics/`, `economy/`, `laws/`, `narrative/`,
  `campaign/`) — hoje vazios (só `.gitkeep`), reservados para quando a
  ingestão de conteúdo específico começar (Fase 1 em diante, fora do escopo
  desta auditoria). Não fragmentar em arquivos por entrada individual sem
  necessidade real — agrupar por tema quando fizer sentido (ex.: um único
  `npcs/tolven-marr.md` por NPC relevante à campanha atual, não um arquivo
  por sub-entrada `VII.001.1`/`.2`/`.3`).
