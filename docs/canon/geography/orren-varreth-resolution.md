# Resolução: Varreth/Orren vs "Borda dos Musgos"/"Estrada Velha"

> Resolve `CANON_CONFLICTS.md` §1. Aplica a regra do usuário: **CANON MACRO >
> conteúdo legado. Conteúdo legado pode ser incorporado como detalhe local
> quando não contradiz o cânone.**

## Fontes lidas nesta resolução (Bíblia V7)

- `Livro 0.03 — Territórios`: "Veyra, Orren, Liga de Sarn, Domínios de Elnor,
  Marchas Bastião, Fronteira Partida, Cinzas Longas e Terras de Selka formam
  a macrogeografia inicial." — 8 territórios macro, nomes fechados.
- `Livro III.007-012 — Varreth` (6 sub-entradas: fundação/bairros/economia/
  governo/cotidiano/conflitos): todas as 6 abrem com a mesma frase-âncora,
  **"Varreth, em Orren, existe por uma combinação específica de água, rota,
  defesa e recurso."** — confirma Varreth como parte do território Orren,
  repetido de forma consistente nas 6 entradas (sem variação, sem menção
  alternativa de território).
- Busca de texto completo (25.816 parágrafos): **"Borda dos Musgos"** e
  **"Estrada Velha"** têm 0 ocorrências em todo o documento.

## O que a V7 NÃO faz

As 6 entradas de Varreth **não descrevem nenhuma microgeografia** — não
nomeiam bairro, distrito rural, estrada específica ou sub-região dentro de
Orren. O conteúdo das 6 entradas é o mesmo texto-modelo genérico (o mesmo
padrão de repetição já registrado em `CANON_CONFLICTS.md` §0 para o Livro 0 e
observado de novo aqui e no Livro IV) — a V7, no nível atual de leitura, é
estrutural/procedural nesse ponto, não prosa bespoke por assentamento.

## Resolução

1. **Varreth pertence a Orren** — este é o fato macro, agora refletido em
   `src/data/locations.ts` (`region: 'Orren'` para `varreth`, `borda-musgos`,
   `estrada-velha`).
2. **"Borda dos Musgos" sobrevive como microrregião/zona rural dentro de
   Orren** — floresta/fronteira ao redor de Varreth. Não contradiz a V7 (que
   é silenciosa nesse nível de detalhe); não é promovida a território macro.
3. **"Estrada Velha" sobrevive como localidade/rota concreta dentro de
   Orren** — a estrada a leste de Varreth. Mesma lógica.
4. **Nada foi deletado.** `id`, `name`, `description`, `connections` e as
   coordenadas do mapa em `src/data/locations.ts` permanecem exatamente como
   estavam — só o campo `region` (que identifica o macrotterritório) mudou de
   `'Borda dos Musgos'` (inexistente na V7) para `'Orren'` (confirmado).
   Nenhum asset visual, nenhum texto de criação de personagem, nenhuma tela
   foi redesenhada por esta resolução.

## O que ainda fica pendente (fora do escopo desta rodada)

- Ler `Livro III.007-012` não deu nome canônico algum para a microrregião ao
  redor de Varreth — então "Borda dos Musgos"/"Estrada Velha" continuam sendo
  os únicos nomes existentes para esse nível, só que agora corretamente
  aninhados sob Orren em vez de competirem com ele. Se uma leitura futura mais
  profunda da V7 (Livro III completo, Apêndice A) revelar um nome canônico
  específico para essa microrregião, isso seria uma atualização aditiva, não
  outro conflito.
- "Fronteira Partida" (`src/data/locations.ts`, location `fronteira`) já
  usava `region: 'Fronteira Partida'` — isso já batia exatamente com um dos 8
  territórios macro da V7 (548 ocorrências confirmadas no Livro 0.03) e não
  foi alterado.
