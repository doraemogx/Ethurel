# Artifact Recovery Audit

> Rodada de Recuperação do Produto §1/§A. Reauditoria do Ethurel-Artifact
> (o HTML único, narrado por IA em tempo real, que precede toda a
> reconstrução em Claude Code) contra o estado atual, depois do teste real
> em Android que rejeitou a Fase 3 visualmente.

## Limitação honesta desta auditoria

O handoff original (`ETUREL_PROJECT_HANDOFF.md`, 838 linhas) e o HTML do
Artifact (`ETUREL_CURRENT_SOURCE.html`, 1718 linhas) foram anexados como
arquivos de sessão numa conversa anterior — **nunca foram versionados neste
repositório** e não estão disponíveis nesta sessão. Não tenho como reabrir
o HTML original ou reler o handoff palavra por palavra agora.

O que existe, e que uso como fonte de verdade: `docs/design/11-LEGACY-RECOVERY.md`,
escrito numa fase anterior com o handoff em mãos — já fez o trabalho de
extrair, comparar e decidir o que recuperar/manter/descartar/melhorar. Esta
auditoria não repete esse trabalho; ela **audita o estado ATUAL contra o
que aquele documento já registrou como recuperado**, para achar o que
regrediu ou nunca chegou a ficar bom o bastante desde então — que é
exatamente o que o teste em Android acabou de expor.

## O que 11-LEGACY-RECOVERY.md já confirma como recuperado (não re-auditado aqui)

Princípio/Desejo/Medo/Limite na criação; seed de Índole por escolha;
sigilo por classe reagindo à zona Arcana; sistema de tags por categoria
(✦ classe / ◈ atributo / ◇ origem); feedback de combate (shake + número +
flash); typewriter configurável; separação cena→decisão (escolhas só
aparecem depois do texto terminar); coordenadas de mapa; limiares
narrativos de Marca (25/50/75); confiança por NPC como rótulo narrativo.
Todos presentes no código hoje, confirmados por leitura direta nesta
rodada — não regrediram.

## O que regrediu ou nunca vingou (achado nesta rodada, com teste real em Android)

### 1. Sugestões de ação são um roteiro fixo, não um motor narrativo

`src/content/firstChapterScenes.ts` define exatamente 5 cenas
(`intro → toward-clearing → clearing-check → return → epilogue`) com ações
contextuais **hardcoded** por cena. `src/ai/LocalNarrativeProvider.ts` —
que deveria ser a fonte de sugestões — sempre retorna `suggestedActions: []`;
o campo existe no contrato (`NarrativeResponse.suggestedActions`) mas
nunca é preenchido no caminho principal da cena. Resultado: a experiência
é literalmente um roteiro de ~15-20 minutos com fim fixo, não um RPG capaz
de continuar. Isto é a causa raiz da queixa "texto → texto → 'fazer outra
coisa'" — o Artifact original também não tinha isso (usava IA ao vivo pra
cada cena, com os problemas de determinismo/segurança já documentados),
mas a arquitetura atual tem os componentes certos (`NarrativeEngine`,
`NarrativeProvider`, `RemoteNarrativeProvider`, contrato estruturado) e só
não os conecta de ponta a ponta. Corrigido em §O/§Q desta rodada.

### 2. Mapa é grafo de nós, não cartografia

`MapScreen.tsx` desenha círculos conectados por linhas curvas sobre um
pergaminho — nunca foi cartografia real (terreno, montanha, floresta,
fronteira), apesar do handoff descrever `MAP_NODES` como coordenadas de
localização, não como especificação visual. Rejeitado explicitamente nesta
rodada (§15); rebuild em §M.

### 3. Ancestralidade usa ícone de item genérico

A Fase 3 (vertical slice anterior) resolveu "que emblema mostrar pra cada
povo" reaproveitando o vocabulário de ícone já usado por classe/item (ash/
moss/trail/sigil) — funcional, mas nenhum desses ícones foi desenhado
pensando em comunicar um povo. Rejeitado nesta rodada (§6); substituído
por SVG original em §E.

### 4. Só 1 classe era selecionável

A Fase 3 restringiu a criação a Portador de Cinza "para provar o slice" —
decisão de escopo que fez sentido como vertical slice isolado, mas que o
usuário agora rejeita como regressão real (o Artifact sempre teve 8
classes selecionáveis). Revertido nesta rodada (§G) — as 8 classes de
`src/data/classes.ts` (nunca alteradas desde a fundação) voltam a ser
selecionáveis, agora com vitrine visual própria por classe (§H, ver
`CHARACTER_ASSET_REGISTRY.md`).

### 5. Personagens de Origem sem retrato

Confirmado pela própria Fase 3 como lacuna documentada (nenhum dos 5 tinha
imagem própria). Resolvido nesta rodada (§I) — ver
`CHARACTER_ASSET_REGISTRY.md` para os 5 pares retrato↔personagem.

### 6. Fundo de cidade usado universalmente na criação

`CharacterCreationScreen` usa `varreth-market.webp` como pano de fundo
fixo do início ao fim da criação — mesmo antes de o jogador saber que a
campanha vai começar em Varreth (ou não). Rejeitado nesta rodada (§4);
corrigido em §D.

### 7. Premissa "toda campanha começa em Varreth"

`NewGameChoiceScreen.tsx` tinha a frase literal "Toda história em Ethurel
começa em Varreth" (adicionada na Fase 3 anterior como tagline). Rejeitado
explicitamente nesta rodada (§5) — Varreth é uma localização canônica, não
o único ponto de partida possível. Removido em §C.

### 8. "Marca de Brasa" como passo de criação sem função clara

O passo `identidade-arcana` da criação mostra o sigilo/label da classe
(`arcaneIdentityForClass`) como se fosse uma revelação separada, com texto
longo explicando o conceito — mas não há nenhuma escolha ali; é derivado
automaticamente da classe já escolhida. Isso lê como um passo arbitrário
("por que isso é uma tela própria, se eu não decido nada aqui?"). Auditado
e resolvido em §L.

## Diagnóstico

A arquitetura desta reconstrução (determinismo real, save confiável, Índole/
Reputação corretos, canon retrieval, contrato de ação estruturado) **não
regrediu** — está mais sólida que o Artifact em quase tudo que 11-LEGACY-
RECOVERY.md já tinha confirmado. O que regrediu foi a **camada de
apresentação e o laço narrativo principal**: a Fase 3 investiu peso em
redesenhar a criação de personagem visualmente (com sucesso técnico, mas
escopo reduzido demais — 1 classe, ícones genéricos, fundo fixo) e não
chegou a reconectar `NarrativeEngine`/`suggestedActions` ao fluxo real de
cena, deixando o roteiro fixo de 5 cenas como única experiência jogável
depois da criação. Esta rodada existe pra corrigir exatamente essa lacuna,
sem descartar a fundação técnica que já funciona.
