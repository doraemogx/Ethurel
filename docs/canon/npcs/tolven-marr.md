# Tolven Marr (NPC-001) — dossiê canônico

> Fonte: Bíblia V7, Livro VII.001.1-5 (lido por completo nesta sessão — as 5
> sub-entradas: infância/família, juventude/profissão, psicologia/crenças/voz,
> segredo/rede de relações, rotina/arcos/consequência). Ver
> `src/canon/npcRegistry.ts` para a versão estruturada em código.
>
> Ao contrário da maior parte da V7 (texto-modelo genérico repetido por
> entrada — `CANON_CONFLICTS.md` §0), o Livro VII tem prosa bespoke real:
> fatos específicos, não template.

## Fatos confirmados

- **Nasceu em Veyr**, povo Humanos de Avarra.
- **Profissão: ferreiro** — aprendeu por necessidade e aptidão; sua
  competência narrativa é concreta (reconhece qualidade/prazo/risco de
  trabalho), nunca "sabedoria genérica".
- **Relações nomeadas**: Thessa Aster (vínculo de obrigação e afeto desde
  jovem — o segredo dele existe para protegê-la), Hadrik Arven (prejudicado
  pelo primeiro erro profissional de Tolven; pode contradizer a versão
  pública do segredo), Bram Kest (rival profissional por disputa de crédito).
- **Segredo autoral (NPC-001)**: alterou uma informação num registro menor
  para proteger Thessa Aster de uma consequência desproporcional — criou
  vulnerabilidade jurídica, não benefício próprio. 3 pistas concretas
  existem na fonte (diferença de tinta/data num documento, testemunho de
  Hadrik Arven, um pagamento indireto).
- **Voz**: fala como ferreiro — preço, distância, desgaste, tempo. Quando
  nervoso, encurta frases e repete a última palavra importante da pergunta.
  Não usa enigma para parecer misterioso: se não quer responder, muda de
  assunto, mente concretamente, recusa, ou pergunta por que o interlocutor
  quer saber.
- **Rotina**: manhã (abastecimento/preparação) → meio-dia (ferraria) →
  fim de tarde (contas/reparo/visita) → 2 noites/semana (vínculo
  comunitário). Muda em dias de chuva forte (gargalo de circulação em Veyr)
  e em feira/feriado.
- **Arcos possíveis**: positivo (aceitar ajuda sem ver como perda de
  autonomia), negativo (usar segredo/competência para controlar outros),
  ambíguo (segurança financeira ao custo de uma relação importante).
- **Fato de continuidade explícito na fonte**: "a família de Tolven Marr não
  pode ser reescrita por improvisação; novos parentes exigem registro
  explícito."

## Divergência com o jogo atual — NÃO resolvida nesta rodada

`src/data/npcs.ts`: `id: 'tolven'`, `name: 'Tolven'`, `role: 'Guarda-caminho
de Varreth'`, `location: 'varreth'`, personalidade "Cansado, mas atento —
desconfia de coisas que 'não são naturais' antes de qualquer outra coisa."

Isso diverge da biografia canônica em pelo menos 2 pontos concretos:
**profissão** (ferreiro, não guarda-caminho) e **local de origem** (nasceu em
Veyr — o jogo não afirma isso, mas também não explica por que um ferreiro de
Veyr estaria em Varreth como guarda). O sobrenome "Marr" nunca é usado no
jogo. Provavelmente é o mesmo personagem (mesmo nome, mesmo papel de NPC
central do primeiro capítulo) — mas reconciliar profissão/origem exige
reescrever diálogo e a moldura da quest do capítulo 1
(`src/content/firstChapterQuest.ts`, `src/content/firstChapterScenes.ts`),
o que é conteúdo/redesign fora do escopo autorizado nesta rodada.

**Decisão necessária do usuário** (não decidida silenciosamente aqui):
manter o Tolven do jogo como está (aceitando a divergência como uma
variação desta campanha específica) OU autorizar uma reescrita futura do
diálogo/papel dele para bater com "ferreiro nascido em Veyr, mudou-se para
Varreth" (motivo da mudança ainda precisaria ser inventado, já que a fonte
não cobre isso).

## Decisão (Fase 2) — usar o Tolven Marr canônico

> Atualização: o usuário decidiu explicitamente na Fase 2 ("DECISÃO
> CANÔNICA — TOLVEN MARR") usar a versão canônica, adaptando o jogo, com a
> instrução expressa de não reescrever o capítulo inteiro — só o
> necessário. Análise de impacto abaixo, feita antes de qualquer edição.

### Onde "guarda-caminho"/o papel dele aparece no código

| Arquivo | O que tem | Precisa mudar? |
|---|---|---|
| `src/data/npcs.ts` | `role: 'Guarda-caminho de Varreth'` | **Sim** — vira `'Ferreiro de Varreth'` (ou equivalente que reflita Veyr/ferreiro). |
| `src/content/firstChapterScenes.ts` | label da ação `'Falar com Tolven, o guarda-caminho'` | **Sim** — só o rótulo, a cena/estrutura não muda. |
| `src/ui/screens/JournalScreen.tsx` | resumo do Diário: `'Guarda-caminho de Varreth. Cansado, mas atento...'` | **Sim** — troca "Guarda-caminho" por "Ferreiro"; o resto ("cansado, mas atento — desconfia do que não é natural") já bate com a psicologia canônica (Livro VII.001.3: cautela diante de Arcane, não fascínio). |
| `src/data/ancestries.ts` (linha 118) | `'Guardas-caminho como Tolven reconhecem um Errante...'` cita Tolven como EXEMPLO de guarda | **Sim** — troca a referência a "guardas-caminho" citando o nome dele por algo que não afirme a profissão errada. |
| `src/content/firstChapterQuest.ts` (`DIALOGUE_OFFER`) | Falas dele pedindo para investigar a raiz | **Não precisa mudar o texto** — as falas nunca afirmam "eu sou guarda", funcionam igualmente bem vindas de um ferreiro preocupado com algo perto da estrada que ele usa/depende. |
| `src/domain/passiveInsights.ts` | "Tolven desvia os olhos ao mencionar a Estrada Velha" | **Não precisa mudar** — não depende de profissão, não contradiz o cânone (que é silencioso sobre Estrada Velha para ele). |
| `src/ui/screens/SceneScreen.tsx` (falas de confiança) | "Tolven mede você com os olhos...", "Tolven já parecia esperar por você" | **Não precisa mudar** — genéricas, não dependem de profissão. |
| `docs/design/06-WORLD-NARRATIVE-BIBLE.md` | cânone legado pré-V7, cita Tolven como guarda | Não editado (documento histórico da Fase 1 anterior) — a divergência já está registrada aqui e em `CANON_CONFLICTS.md` §4; reescrever um doc histórico não muda o jogo. |

### Por que a quest continua funcionando sem reescrita

`DIALOGUE_OFFER` nunca afirma "eu, como guarda, preciso que você...". O
gancho é: alguém em Varreth percebeu uma anomalia perto da estrada e pede a
um viajante capaz para investigar. Isso funciona igual vindo de um ferreiro
preocupado (rotas/materiais/segurança da comunidade que ele depende para o
próprio ofício) — não precisa inventar um motivo elaborado, só remover a
palavra "guarda-caminho" de onde ela aparece como rótulo/resumo.

Mudança de escopo: **4 arquivos, 1 linha cada** (`npcs.ts`, `firstChapterScenes.ts`,
`JournalScreen.tsx`, `ancestries.ts`). Nenhuma tela redesenhada, nenhum
diálogo novo escrito, nenhuma estrutura de cena alterada.

### Aplicado

As 4 mudanças acima foram feitas:

- `src/data/npcs.ts`: `role: 'Ferreiro de Varreth'` (era "Guarda-caminho de
  Varreth"). `personality` preservada — já batia com a psicologia canônica.
- `src/content/firstChapterScenes.ts`: rótulo da ação `'Falar com Tolven, o
  ferreiro'` (era "o guarda-caminho").
- `src/ui/screens/JournalScreen.tsx`: resumo no Diário atualizado para
  "Ferreiro de Varreth. Cansado, mas atento...".
- `src/data/ancestries.ts`: `npcRecognitionHook` de Errantes da Estrada não
  cita mais Tolven como "guarda-caminho" — trocado por "gente de ofício em
  Varreth, como Tolven", preservando a função narrativa da frase (alguém
  que tem contato regular com viajantes reconhece um Errante) sem afirmar
  uma profissão errada.

`src/canon/entityRegistry.ts` (`tolven-marr`) atualizado: `status`
permanece `blocker` — a profissão está resolvida, mas o nascimento em Veyr
(e o motivo da mudança para Varreth) segue sem explicação no jogo, e
escrever essa origem é conteúdo novo, fora do escopo desta rodada.
