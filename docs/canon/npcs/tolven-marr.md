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
