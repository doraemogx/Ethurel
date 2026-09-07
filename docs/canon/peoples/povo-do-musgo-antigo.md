# Povo do Musgo Antigo — resolução canônica

> Resolve `CANON_CONFLICTS.md` §2. Aplica a distinção do usuário: **"essa
> sessão não conhecia a Bíblia" ≠ "o conceito não é canônico".**

## Confirmado pela Bíblia V7 (Livro IV.010-011, 021-022, ... 164-165 — 20
entradas, 10 temas × 2 variantes)

- **Nome do povo é canônico**: "Povo do Musgo Antigo".
- **Duas variantes canônicas**: "**Guardiões de Raiz**" e "**Dispersos**".
- O conteúdo das 20 entradas lidas é texto-modelo genérico (mesmo padrão
  estrutural do Livro 0/Livro III — ver `CANON_CONFLICTS.md` §0): regras de
  worldbuilding (sem personalidade coletiva, preconceito é crença diegética
  não verdade biológica, cultura varia por região/renda/geração, Ancestralidade
  afeta conhecimento/percepção social e não alinhamento moral) repetidas para
  cada povo/variante do Livro IV, **sem nenhum detalhe biológico específico**
  (nada sobre bioluminescência, marcas na pele, ou vínculo territorial restrito
  a uma única floresta).

## O que a Fase 3 do jogo tinha (pré-Bíblia)

`src/data/ancestries.ts`, ancestralidade `musgo-antigo`, criada citando
explicitamente "nenhuma ancestralidade citada em conversas anteriores era
cânone" — coincidência de nome real com a V7 (não cópia), com duas variantes
próprias: **"Enraizados"** e **"Dispersos"**.

## Resolução

1. **O conceito e o nome do povo são canônicos — preservados**, não
   removidos.
2. **Variante "Dispersos"**: nome já batia exatamente. Sem mudança.
3. **Variante "Enraizados" → "Guardiões de Raiz"**: nome corrigido para bater
   com o cânone (`src/data/ancestries.ts`). O `id` interno (`enraizados`)
   foi mantido por estabilidade — nada além do `name` exibido mudou, sem
   risco de quebrar saves existentes ou referências de código.
4. **Detalhes biológicos específicos (resposta bioluminescente, marcas na
   pele, ligação de gerações a uma única floresta) são worldbuilding da Fase
   3, não confirmados nem contraditos pela V7** (que é silenciosa nesse nível
   de detalhe nas 20 entradas lidas). Preservados como estão — não são
   contradição de cânone, são só um nível de detalhe que a Bíblia ainda não
   cobriu no que foi lido até agora. Sinalizados aqui para revisão se uma
   leitura futura do Livro IV revelar detalhe biológico canônico específico
   que divirja do que o jogo já descreve.
5. **"Borda dos Musgos"** como território de origem do povo (`tagline`,
   `npcRecognitionHook`) permanece consistente com a resolução geográfica em
   `docs/canon/geography/orren-varreth-resolution.md` — é a microrregião
   dentro de Orren, não um território macro competindo com a V7.

## Pendências fora do escopo desta rodada

- As outras 9 raças canônicas do Livro IV (Humanos de Avarra, Elen da Lua
  Fria, Elen do Bosque Profundo, Dhorim de Orren, Dhorim Errantes, Myr de
  Caldra, Myr de Lúmen, Veyl de Selka, Veyl de Nacre) não foram adicionadas ao
  jogo — isso é trabalho de conteúdo novo, fora do que esta rodada autorizou
  ("não complete classes/ancestralidades restantes"). `CANON_CONFLICTS.md` §2
  mantém a recomendação original de decisão de escopo antes de qualquer
  rework maior.
