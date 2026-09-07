# CANON_CORE — Ethurel

> Fonte: `ETHUREL_BIBLIA_CANONICA_V7_FINAL.docx` (anexado nesta sessão), Livro 0
> ("Hierarquia canônica" até "Liberdade"). Este documento é **deliberadamente
> pequeno** — só os fatos que nunca podem ser violados arbitrariamente por uma
> campanha ou por uma implementação. Tudo o mais vive em `docs/canon/<tema>/`,
> consultado sob demanda, não carregado inteiro em nenhum contexto.
>
> Extraído por leitura direta do documento nesta sessão (ver
> `docs/canon/CANON_INGESTION_PLAN.md` para a metodologia e o que ainda não foi
> lido). Cada item abaixo tem a referência exata da fonte para auditoria.

## 1. Hierarquia de verdade (Livro 0.01)

> "Verdade autoral > fato histórico confirmado > conhecimento institucional >
> testemunho > crença > rumor > propaganda > hipótese. A IA nunca promove uma
> camada inferior a verdade sem evento de descoberta validado."

Consequência direta para a implementação: nenhum sistema (IA ou determinístico)
pode tratar um rumor/crença como fato confirmado sem um evento de descoberta
registrado. Divergência entre fontes permanece diegética (o narrador descreve
a perspectiva do personagem, não arbitra uma resposta editorial).

## 2. Mundo (Livro 0.02)

> "Ethurel é o mundo conhecido; Avarra é o continente principal desta Bíblia.
> O jogo pode expandir além de Avarra somente por atualização canônica."

## 3. Macrogeografia inicial (Livro 0.03 / 0.13 / 0.23 — idêntico nas 3 repetições)

> "Veyra, Orren, Liga de Sarn, Domínios de Elnor, Marchas Bastião, Fronteira
> Partida, Cinzas Longas e Terras de Selka formam a macrogeografia inicial."

8 territórios macro. **Varreth pertence a Orren** (confirmado por leitura
direta de `Livro III.007-012` completo, não só o Livro 0). "Borda dos Musgos"
e "Estrada Velha" não aparecem em nenhum desses 8 nomes, mas foram
preservadas como microrregião/localidade dentro de Orren — **resolvido**,
ver `docs/canon/geography/orren-varreth-resolution.md` e
`CANON_CONFLICTS.md` §1.

## 4. Ano 0 (Livro 0.04)

> "Ano 0 é o presente de referência de saves novos. Datas negativas são
> anteriores ao presente. Calendários locais devem ser convertíveis."

Livro II usa notação "a.P." (anterior ao Presente) para eventos históricos —
ex.: "3081 a.P.: Fundação de Fortificação em Veyra".

## 5. Arcane — natureza (Livro 0.05, ver também Livro I completo — 260 entradas "Arcane e X")

Livro 0.05 não foi ainda extraído palavra-por-palavra nesta sessão (ver
pendências no plano de ingestão) — o que já está confirmado por leitura
direta de outras seções e por `docs/design/06-WORLD-NARRATIVE-BIBLE.md`
(cânone anterior, compatível): Arcane não é "mana"; está ligada à tensão entre
realidade estabilizada e possibilidades não realizadas. Livro I detalha a
relação de Arcane com dezenas de temas (dor, memória, sonhos, cura, gravidez,
etc.) — não resumido aqui por volume; consultar sob demanda.

## 6. Controle / Saturação / Ruptura (Livro 0.06)

> "Controle 0–59; Saturação 60–89; Ruptura 90–100. Marca Arcana registra
> consequência duradoura de Rupturas extremas."

**Idêntico ao que já está implementado** em `src/arcane/zone.ts` e usado em
todo o jogo desde a Fase 1. Nenhuma mudança necessária aqui.

## 7. Índole e Reputação (Livro 0.07)

> "Índole registra padrão interno inferido de ações; Reputação é conhecimento
> social distribuído e exige testemunho ou transmissão."

Consistente com a arquitetura já implementada (`src/social/indole.ts` —
separação por testemunha, `WorldEvent.witnesses`). Nenhuma mudança estrutural
necessária.

## 8. Morte (Livro 0.08)

> "Morte é normalmente permanente. Eco, memória ou ressonância não equivalem a
> ressurreição integral."

"Eco" aqui é terminologia canônica — coincide com o sistema `Ecos`
(`src/domain/echoes.ts`) já implementado na Fase 2. Precisa de verificação
mais profunda (Livro I tem entradas específicas sobre Eco/memória/ressonância
que ainda não foram lidas) para confirmar se o *conceito* de Eco do jogo
corresponde ao *mecanismo* canônico ou é só uma coincidência de nome — ver
pendência em `CANON_CONFLICTS.md`.

## 9. IA e motor (Livro 0.09)

> "IA interpreta intenção e narra; GameEngine valida dano, recursos, checks,
> inventário, progressão, relações estruturadas e mutações de estado."

**Princípio arquitetural idêntico** ao que já rege `src/domain/`, `src/ai/` e
`docs/design/`. A separação IA-narra / motor-decide é cânone explícito, não
só uma preferência de design — reforça que qualquer integração real de IA
(Trilha G) deve manter essa fronteira rigidamente.

## 10. Liberdade / ações livres (Livro 0.10)

> "Ações livres devem receber interpretação contextual. Não existe fallback
> narrativo genérico para ações compreensíveis."

**Isto é cânone explícito, não só preferência de design.** A violação
registrada (`SceneScreen.submitFreeAction` sobre regex de 3 verbos + fallback
genérico, nunca sequer chamado ao `NarrativeEngine`) foi **resolvida nesta
rodada** — ver `CANON_CONFLICTS.md` §7 e `src/ai/LocalNarrativeProvider.ts`.

## 11. Classes (Livro V.1–V.8) — confirmado compatível

As 8 classes já implementadas (`src/data/classes.ts`) existem no cânone com
os mesmos 8 nomes exatos, cada uma com 12 sub-entradas (origem histórica,
escolas, treinamento, técnica de Controle/Saturação/Ruptura, equipamento,
vida profissional, reputação social, mestres célebres, falhas e acidentes,
evoluções). **Nenhuma mudança de nome/conceito necessária.**

## 12. Origens (Livro V.O1–V.O5) — confirmado compatível

As 5 origens já implementadas (`src/data/origins.ts`) existem no cânone com
os mesmos 5 nomes exatos (Cinzas Longas, Arquivo Vertido, Culto do Selo,
Fronteira Partida, Bastião Caído), cada uma com 5 sub-entradas. **Nenhuma
mudança de nome/conceito necessária** — mas o *conteúdo* de cada origem no
jogo (`src/data/origins.ts`, textos curtos) é muito mais raso que as 5
entradas canônicas de cada uma; ver plano de ingestão para enriquecimento
futuro.

---

**O que este documento explicitamente NÃO cobre ainda** (fora do escopo desta
sessão — diagnóstico + duas correções críticas + resolução pontual de
conflitos, não ingestão completa): Livro I (Arcane, 260 entradas), Livro II
(cronologia, 320 entradas), Livro III completo (240 entradas além de
Varreth), Livro IV completo (só Povo do Musgo Antigo foi lido, 235 entradas
dos outros 9 povos ainda não), Livro VII (150 NPCs-âncora, só Tolven Marr
parcialmente lido, ~740 entradas restantes), Livro VIII (facções, 100
entradas), Livro IX (bestiário, 100 entradas), Livro X (itens/relíquias, 100
entradas), Livro XI (arquitetura narrativa, 120 entradas), Livro XII (80
assentamentos), Apêndice A (25 protocolos de coerência). Ver
`CANON_INGESTION_PLAN.md`.

**Livro VI (8 personagens de origem canônicos) foi lido por completo** nesta
sessão (64 entradas) — ver `docs/canon/origin-characters/COMPARISON.md` para
a comparação campo a campo contra os 5 personagens implementados no jogo.
