# World & Narrative Bible — Ethurel

> Estrutura para consolidar o que já existe e organizar o que falta decidir — não é uma criação retroativa de lore. Cada item carrega uma tag:
>
> - **[CÂNONE]** — já estabelecido em `ETUREL_PROJECT_HANDOFF.md` ou nos documentos de design (`docs/design/01-04`), preservado literalmente.
> - **[PROPOSTA]** — ideia nova, coerente com o cânone, mas que ainda precisa da sua aprovação explícita antes de virar cânone.
> - **[EM ABERTO]** — decisão que ainda não foi tomada, sinalizada para não ser esquecida nem inventada às pressas depois.
>
> Nenhum item [EM ABERTO] deste documento foi respondido arbitrariamente — ver §8 no final para a lista consolidada do que precisa da sua decisão.

## 1. Mundo — [CÂNONE]

- **Ethurel**: nome do mundo/jogo. Descrito como natural, mineral, escuro, ancestral — tom dark fantasy medieval.
- **Arcane**: força viva primordial, orgânica (veios luminosos, pulsação, esporos, água anormal, bioluminescência) — nunca elétrica, nunca "mágica roxa". Sua natureza verdadeira nunca deve ser totalmente explicada — regra de design permanente, não lacuna a preencher depois.
- **Estados de risco**: Controle (0-59) → Saturação (60-89) → Ruptura (90-100), cada um com identidade mecânica própria (não só "mais poder") — ver `docs/design/03-GAMEPLAY-E-COMBATE.md §4`.
- **Marca Arcana**: cicatriz permanente que cresce ao cruzar para Ruptura.
- **Índole**: quem o personagem está se tornando (12 dimensões internas, ver `03-GAMEPLAY-E-COMBATE.md §9`) — muda por eventos moral/comportamentalmente relevantes, independente de testemunha.
- **Reputação**: como o mundo percebe o personagem, por entidade — só muda quando a ação é conhecida (testemunhada).

## 2. Geografia — [CÂNONE] (semente) + [PROPOSTA] (microambiente atual)

| Local | Status | Descrição |
|---|---|---|
| **Varreth** | [CÂNONE] | Povoado de partida da campanha, na Borda dos Musgos. Nenhuma descrição fixa detalhada existia além de "povoado" — todo detalhe sensorial era gerado por IA na v1, não persistido. |
| **Borda dos Musgos** | [CÂNONE] | Região de fronteira onde Varreth fica. |
| **Estrada Velha** | [CÂNONE] | Rota a leste de Varreth. |
| **Fronteira Partida** | [CÂNONE] | Região isolada por uma fissura arcana permanente; também é uma origem jogável. |
| **Arquivo Vertido** | [CÂNONE] (origem) | Biblioteca parcialmente submersa — mencionada só como origem, sem mapa. |
| **Cinzas Longas** | [CÂNONE] (origem) | Região de fronteira em guerra — mencionada só como origem, sem mapa. |
| **Bastião Caído / Casas Bastião** | [CÂNONE] (origem/facção) | Antiga linhagem nobre caída, guardava um posto contra incursões arcanas. |
| **A Raiz Rompida** | [PROPOSTA, já aprovada em `04-VERTICAL-SLICE-E-ROADMAP.md`] | Landmark de Varreth: pedra fendida com raiz bioluminescente na praça. Origem deliberadamente incerta (não é cânone que "aconteceu há séculos" ou qualquer causa específica). |
| **Primeiro microambiente jogável (este ciclo)** | [PROPOSTA] | Uma pequena clareira nos arredores de Varreth — não é a vila inteira, não tem interiores. Existe só para provar a linguagem visual (ver `05-DIRECAO-DE-ARTE.md`). Não estabelece geografia nova além do que já era cânone (ainda é "perto de Varreth/Borda dos Musgos"). |

**Regiões/locais citados no handoff sem mapa nem conteúdo além do nome** (permanecem [EM ABERTO] quanto a onde ficam e o que contêm): nenhuma outra além das listadas acima.

## 3. Facções — [CÂNONE] (mínimo) + [EM ABERTO] (tudo o resto)

| Facção | O que é cânone | O que está em aberto |
|---|---|---|
| **Culto do Selo** | Seita que venera o colapso de Arcane (Ruptura) como revelação, não perigo. Origem jogável. | Estrutura interna, líderes, objetivos concretos, presença em Varreth — nada definido. |
| **A Vigília** | Ordem que monitora/age contra abusos de Arcane. Mencionada uma única vez no prompt da v1, sem detalhe. | Praticamente tudo — é só um nome hoje. |
| **Casas Bastião** | Linhagens nobres que guardavam postos contra incursões arcanas; ao menos uma caiu (origem do jogador, se escolhida). | Quantas restam, onde ficam, se são aliadas/rivais entre si. |

## 4. Personagem do jogador — [CÂNONE]

- 8 classes (nomes, conceitos, mecânicas — ver `03-GAMEPLAY-E-COMBATE.md §3` e `src/data/classes.ts`): Portador de Cinza, Tecelão do Véu, Caçador de Fissuras, Lâmina Silenciosa, Guardião do Bastião, Arauto do Musgo, Andarilho do Selo, Lançador de Ossos.
- 5 origens (ver `src/data/origins.ts`): Cinzas Longas, Arquivo Vertido, Culto do Selo, Fronteira Partida, Bastião Caído.
- Passado/Princípio/Desejo/Medo/Limite: preservados como conceito de modelo de personagem, não coletados obrigatoriamente na criação (Revisão 2 da Fase 1).
- Gênero: Homem/Mulher (Elu removido).

## 5. Premissa de campanha, conflito central, protagonismo e antagonismo — [EM ABERTO]

Nada disto foi definido em nenhum documento anterior. Não invento agora. Esta seção existe só para deixar a lacuna explícita:

- **Premissa da campanha:** [EM ABERTO]
- **Conflito central:** [EM ABERTO]
- **Antagonista(s):** [EM ABERTO] — nenhum vilão nomeado existe no cânone.
- **Papel do protagonista no conflito:** [EM ABERTO] além do que a origem/classe/princípio escolhidos sugerem individualmente.

**[PROPOSTA] de estrutura, não de conteúdo:** o conflito central provavelmente deveria se conectar ao mistério de Arcane e à tensão Controle/Saturação/Ruptura já existente (já que isso é o pilar mecânico central) — mas qual é o conflito específico, quem o personifica, e por que agora, continuam em aberto até você decidir.

## 6. Estrutura narrativa — [PROPOSTA] (arquitetura) + [EM ABERTO] (conteúdo)

Preservando a filosofia já aprovada ("a narrativa acontece através do RPG", loop explorar→interagir→conquistar→decidir→consequência→continuar — `docs/design/04` e a instrução deste ciclo):

- **Atos/capítulos:** [EM ABERTO] — quantos, o que marca a transição entre eles.
- **Revelações:** [EM ABERTO] — o que é revelado, quando, sobre o quê (Arcane permanece deliberadamente nunca 100% explicada, mas revelações parciais/pessoais são esperadas).
- **Ramificações e convergências:** [PROPOSTA de princípio, já orientado pelo usuário]: decisões geram ramificação controlada que converge de volta ao fio principal, evitando múltiplos jogos completamente diferentes. Quais decisões especificamente ramificam: [EM ABERTO].
- **Finais:** [EM ABERTO] — quantos, o que os diferencia (provavelmente uma função de Índole + Reputação + Marca Arcana acumulada, dado o que já é cânone, mas isso é [PROPOSTA], não decidido).

## 7. Arquitetura de consequência (técnica, já aprovada) — [CÂNONE, arquitetura]

Já coberto em `docs/design/03-GAMEPLAY-E-COMBATE.md §9`: sistema de testemunhas (`WorldEvent{witnesses}`) separando Índole (sempre pode mudar por peso moral) de Reputação (só muda se conhecida). Esta Bible não repete a especificação técnica — só reafirma que qualquer conteúdo narrativo escrito a partir de agora (diálogos, quests, NPCs) deve gerar esses eventos tipados, não só "a próxima fala muda".

Categorias de consequência que uma decisão pode acionar (arquitetura já suporta, conteúdo específico é [EM ABERTO] quest a quest):
NPC vivo/morto/ausente · confiança/relação · Reputação por entidade · Índole (dimensões) · disponibilidade de quest · recompensa/preço · diálogo alternativo · acesso a área · reação de facção · evento posterior · aliados · desfecho de arco.

## 8. Lista consolidada do que precisa da sua decisão

Nada abaixo foi decidido nesta entrega — listado para você aprovar, rejeitar ou responder quando fizer sentido, não bloqueante para o código deste ciclo:

1. Premissa da campanha e conflito central.
2. Quem é (ou se existe) um antagonista nomeado.
3. Estrutura de atos/capítulos.
4. Quais decisões específicas ramificam a história e onde convergem de volta.
5. Quantos finais existem e o que os diferencia.
6. Detalhamento de A Vigília e Casas Bastião além do que já é cânone.
7. Se e quando a origem/causa da Raiz Rompida deixa de ser incerta (e o que ela revela).
