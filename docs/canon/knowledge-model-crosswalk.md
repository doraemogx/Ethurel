# Knowledge Model — cruzamento com a hierarquia de verdade (Livro 0.01)

> Resolve parcialmente a prioridade 8 da Fase 1 (`CANON_INGESTION_PLAN.md`).
> Isto é um documento de referência — **não altera** `src/domain/knowledge.ts`
> nem o schema de save. Mudar o `KnowledgeState` persistido é uma migração de
> save + rework de UI (`JournalScreen.tsx` renderiza por estado), fora do
> escopo desta rodada ("não redesenhe").

## Hierarquia canônica (Livro 0.01, já citada em `CANON_CORE.md` §1)

> "Verdade autoral > fato histórico confirmado > conhecimento institucional >
> testemunho > crença > rumor > propaganda > hipótese. A IA nunca promove uma
> camada inferior a verdade sem evento de descoberta validado."

8 camadas, da mais autoritativa à menos:

1. Verdade autoral
2. Fato histórico confirmado
3. Conhecimento institucional
4. Testemunho
5. Crença
6. Rumor
7. Propaganda
8. Hipótese

## O que o jogo já implementa (`KnowledgeState`, `src/domain/knowledge.ts`)

4 estados: `rumor` | `confirmed` | `disputed` | `unknown`.

## Crosswalk

| `KnowledgeState` do jogo | Camada(s) canônicas correspondentes | Nota |
|---|---|---|
| `unknown` | (nenhuma — a entrada ainda não existe na consciência do personagem) | Compatível — a hierarquia canônica só se aplica a algo já conhecido de alguma forma. |
| `rumor` | 6 (Rumor), parcialmente 7 (Propaganda) | O jogo não distingue rumor espontâneo de propaganda deliberada — a V7 trata como camadas diferentes (propaganda é mais abaixo, tem intenção). |
| `disputed` | 5 (Crença) ou fontes conflitantes em qualquer camada | O jogo usa `disputed` para "duas versões incompatíveis" — a V7 não tem um estado equivalente único; trata divergência como camadas diferentes competindo (ex.: testemunho vs. crença), não como um 5º estado. |
| `confirmed` | 1-3 (Verdade autoral, Fato histórico confirmado, Conhecimento institucional) | O jogo colapsa as 3 camadas mais altas num único `confirmed` — perde a distinção entre "o mestre da campanha decidiu que isto é verdade" (1), "documentado e verificável" (2) e "uma instituição garante, mas pode estar errada" (3). |

## O que falta para um cruzamento completo (não feito nesta rodada)

- `testemunho` (camada 4) não tem estado próprio — hoje um testemunho de
  personagem vira `rumor` ou `confirmed` dependendo de como o código que
  chama `upsertKnowledge` decide, sem que a distinção "eu vi com meus
  próprios olhos" vs. "alguém me contou" fique registrada no dado.
- Promover uma entrada de `rumor`/`disputed` para `confirmed` hoje é uma
  chamada de código qualquer a `upsertKnowledge` — a regra canônica explícita
  ("a IA nunca promove uma camada inferior a verdade sem evento de descoberta
  validado") não tem um gate estrutural que impeça isso; depende de disciplina
  de quem escreve o código chamador, não de um tipo que force o evento de
  descoberta a existir.
- Uma expansão futura poderia adicionar 1-2 estados (ex.: separar
  `testemunho` de `confirmed`) sem quebrar saves existentes (migração aditiva,
  como outras versões do schema já fizeram) — mas isso é uma decisão de
  design de sistema, não uma correção de dado, então não foi feita aqui.
