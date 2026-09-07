# Handoff — Ethurel Phase 3

> Honestidade em primeiro lugar (regra explícita do prompt de execução): nada
> aqui está marcado como "implementado" se estiver só preparado; nada é
> chamado de "narrativa por IA" se o `RemoteNarrativeProvider` não estiver
> operacional; nenhuma limitação foi escondida. Onde algo ficou parcial, isso
> está dito explicitamente, com o motivo.

## 1. Metadados

- **Data:** 2026-09-07
- **Repositório:** `doraemogx/Ethurel`
- **Branch:** `claude/ethurel-reconstrucao-uz59be`
- **Commit desta entrega:** ver `git log -1` no momento do push (feito após este documento)
- **Deploy:** https://doraemogx.github.io/Ethurel/ (GitHub Pages, workflow existente)
- **Stack:** React 19 + TypeScript + Vite 6 + PWA, sem framework de jogo (Phaser foi retirado na Fase 2)
- **Alvo:** Android mobile, portrait (360×800 / 390×844 / 412×915)

## 2. Arquitetura (inalterada em essência, evoluída em pontos específicos)

- **Domínio puro** (`src/domain/`, `src/combat/`, `src/quest/`, `src/social/`, `src/arcane/`): TypeScript sem dependência de UI, testado por `vitest`. Continua sendo a única fonte de verdade para regras — nada disso mudou de filosofia na Phase 3, só ganhou dois módulos novos (`attributeDistribution.ts`).
- **Conteúdo autoral** (`src/data/`, `src/content/`): dados/texto do jogo, agora incluindo `src/data/ancestries.ts`.
- **UI** (`src/ui/`, `src/app/`): React puro, CSS em `src/ui/theme.css` (sem Tailwind/lib de UI).
- **Save** (`src/save/`): versionado (`SaveDataV1..V5`), migração explícita por versão.
- **IA** (`src/ai/`): `NarrativeProvider` (interface) / `LocalNarrativeProvider` (determinístico, sempre ativo) / `RemoteNarrativeProvider` (arquitetura pronta, **não operacional** — ver §11).

### Novidades estruturais da Phase 3

| Novo módulo | Papel |
|---|---|
| `src/characters/visualRegistry.ts` | Registro central de `CharacterVisualProfile` por id — portrait/fullBody/pose/expressions, usado por NPCs e pelas 4 opções de retrato do jogador. |
| `src/data/ancestries.ts` | Sistema de Ancestralidade (4 ancestrias, 2 variantes cada). |
| `src/domain/attributeDistribution.ts` | Distribuição de pontos de atributo no passo Atributos da criação. |
| `src/ui/visual/ExperienceDirector.ts` | Evolução do `VisualExperienceEngine` (renomeado) — agora resolve fundo real por local + tratamento Arcano. |
| `src/ui/visual/locationArt.ts` | Registro de arte real por local (Varreth/Borda dos Musgos/Estrada Velha). |
| `src/ui/screens/CampaignsScreen.tsx` | Nova tela "Campanhas" do menu principal. |

## 3. O que foi implementado nesta fase (com honestidade sobre profundidade)

### 3.1 Auditoria de assets — **completo**
`docs/assets/ASSET-CATALOG.md` e `docs/assets/ASSET-LICENSES.md` documentam os 10 packs recebidos, o que foi usado/descartado/reservado, e a licença de cada um. Nenhum arquivo bruto (~300MB de RAR/ZIP/7z/PNG originais) foi versionado — só os derivados WebP tratados (~8MB em `public/assets/img/`, 66 arquivos).

### 3.2 Ancestralidade — **completo para a fatia vertical**
4 ancestralidades novas, criadas do zero para Ethurel (não são raças de D&D reaproveitadas): **Filhos da Pedra-Funda**, **Povo do Musgo Antigo**, **Errantes da Estrada**, **Marcados do Selo**. Cada uma tem 2 variantes com diferença real (não decorativa), afeta aparência (texto), um pequeno `attrBonus` (+1, mesma escala do resto do jogo), um `perceptionEdge` (reduz DC de Percepção Passiva no bioma associado — arquitetura pronta, mas hoje só Percepção Passiva em Borda dos Musgos usa `ambientProfile: 'forest'`, então o efeito prático maior é para o Povo do Musgo Antigo), um hook de reconhecimento por NPC (texto, não uma regra de diálogo condicional implementada em todo NPC), e o Povo do Musgo Antigo desbloqueia uma entrada de Códice já confirmada no Diário. **Limitação honesta:** o `perceptionEdge`/`npcRecognitionHook` são dados estruturados prontos para uso narrativo mais amplo, mas só uma fração do potencial é de fato consumida pelo conteúdo desta fatia vertical (1 capítulo, 1 NPC nomeado).

### 3.3 Criação de personagem — **completo, 12 passos**
Fluxo reescrito: Ancestralidade → Variante → Aparência → Classe → Atributos → Origem → Princípio → Desejo → Medo → Limite → Identidade Arcana → Revisão. Regra "SELECIONAR != CONFIRMAR" aplicada via um componente reutilizável (`SelectConfirmStep`) usado em Ancestralidade/Variante/Origem/Princípio/Desejo/Medo/Limite: tocar numa opção só destaca (preview), um botão explícito confirma e avança. Classe e Aparência têm seu próprio padrão (carrossel + botão "Escolher X"; múltiplos campos + botão "Continuar"), mas seguem a mesma regra. Voltar sempre disponível; reabrir um passo já visitado mostra a escolha anterior pré-selecionada (`initialSelectedId`).

### 3.4 Atributos — **decisão explícita: mantida a escala pequena existente**
O prompt permitia migrar para uma escala 8-18 com modificador derivado, mas exigia, se isso fosse feito, uma respec completa (HP/Foco/Marca/checks/8 classes/saves + migração de save) — escopo incompatível com uma fatia vertical (§29 do prompt). **Decisão: manter a escala pequena já documentada em `src/domain/dice.ts`** (atributos 2-6 na criação, o valor bruto é o modificador do d20). Em vez de rescaling, o prompt pedia também "um passo real de distribuição de atributos" — isso foi implementado: 3 pontos de ajuste, até +2 por atributo, nunca abaixo do preset recomendado pela classe+ancestralidade, com botão de reset e preview de HP/Foco em tempo real (`src/domain/attributeDistribution.ts`). A ordem de aplicação dos bônus é: `classe.baseAttrs` → `+ ajuste do jogador` → `+ ancestralidade` → `+ origem`, toda ela centralizada em `createCharacterModel` (única fonte de verdade — um teste (`characterFactory.test.ts`) pegou e corrigiu uma contagem duplicada do bônus de ancestralidade durante o desenvolvimento).

### 3.5 Portraits e expressões — **completo para o elenco atual, arquitetura pronta para mais**
`CharacterVisualProfile` evoluiu para `{id, portrait, fullBody, pose, expressions, ancestry, presentation}` (era `{portraitDefault, portraitExpressions, visualTheme}`). Sistema de expressões com 8 estados (`neutral/happy/sad/angry/afraid/surprised/suspicious/hurt`) — nem todo personagem tem todos; fallback é sempre `neutral`, nunca o retrato de outro personagem (`resolveExpressionImage`, testado). Elenco com arte real:
- **Tolven** (NPC de Varreth, já existente): retrato Cogabushi #101, 5 expressões reais (neutral/happy/angry/suspicious/hurt), full body e pose de ação. As falas de diálogo já carregam `expression` (`src/content/firstChapterQuest.ts`) e o `SceneScreen` resolve a imagem certa por linha.
- **Oracle** e **Pyromancer** (Nyteon, packs #1/#2): retratos únicos, catalogados como NPCs de apoio em Varreth — **não estão wireados em nenhuma cena ainda** (candidatos documentados, sem gancho narrativo nesta fatia).
- **Black Witch** (FR16, pack #4): retrato + 5 expressões, catalogada para Borda dos Musgos — **também não wireada em cena** ainda.
- **4 opções de retrato do jogador** (`player-viajante-a..d`, Cogabushi #102-105): escolhidas no passo Aparência, cada uma com 5 expressões próprias — usadas no Sheet, na Revisão e no Combate.

### 3.6 Locais reais — **Varreth, Borda dos Musgos, Estrada Velha**
`src/ui/visual/locationArt.ts` mapeia fundo real por local. Borda dos Musgos tem tratamento Arcano próprio (mesmo fundo, versão "lua de sangue" quando Saturação/Ruptura) + 2 camadas de primeiro plano (cogumelos/folhagem). Varreth usa o mercado (Assetsmithy #9); Estrada Velha usa "mountain path" (Divinet #7) — combina bem com a identidade de deslocamento pedida no prompt. **Fronteira Partida não tem arte curada** (nenhum pack cobria essa região) — cai no gradiente atmosférico de sempre, sem quebrar.

### 3.7 Mapa em pergaminho — **reconstruído do zero, visualmente**
Antigo grafo SVG de pontos substituído por composição real: moldura de pergaminho (Pack #5) como fundo, terreno desenhado em SVG por cima (vilarejo/floresta/fissura — glifos próprios, não um recorte colado do tile sheet), estradas como curvas de tinta (Bézier quadrática, não retas), nomes em Cinzel com sombra clara (lê como tinta sobre papel). 4 estados persistidos (`desconhecido/conhecido/descoberto/visitado`, string-union alargada de forma aditiva — saves antigos continuam válidos) + "atual" derivado de `currentLocationId` em tempo de render (não persistido — evita ficar desatualizado).

### 3.8 Título — **reconstruído**
Sequência fade preto → fundo (Borda dos Musgos noturna/bioluminescente) → partículas → logo → frase → menu, com `animation-delay` escalonado em CSS puro, desligada de uma vez por `.reduce-motion`. Logo em **Cinzel** (Google Fonts, OFL-1.1, self-hospedada via `@fontsource/cinzel` — sem dependência de CDN em runtime, mantendo o PWA funcional offline). Menu agora tem CONTINUAR/NOVO JOGO/**CAMPANHAS**/CONFIGURAÇÕES — "Campanhas" é uma tela nova (`CampaignsScreen.tsx`) mostrando o único capítulo existente com contexto, e um aviso literal "mais campanhas, em breve" (não é um placeholder enganoso).

### 3.9 Passive Insight — **bug corrigido + apresentação nova**
**Causa raiz confirmada do bug reportado** (uma percepção de Presença e uma nota de Mente apareciam juntas): `insight` (estado de Percepção Passiva) e `note` (resultado de uma checagem ativa) eram estados React independentes, sem exclusão mútua — os dois podiam renderizar ao mesmo tempo porque usavam o mesmo estilo visual (`stage-box--attribute`), fazendo parecer "2 insights". Corrigido: Percepção Passiva agora tem visual próprio ("◈ Percepção Passiva — {Atributo}" / "Você percebe...") e **bloqueia** nota/diálogo/ações/composer até ser reconhecida ("Entendi ▸") — nunca mais pode coexistir com outra coisa na tela. Onboarding de 1 linha na primeira vez (flag `passive-insight-onboarded`).

### 3.10 ExperienceDirector — **evoluído, com escopo honesto**
`VisualExperienceEngine` renomeado/expandido para `ExperienceDirector` (`composeExperience`), agora resolvendo fundo real + tratamento Arcano por local, além do que já existia (gradiente/partículas/overlay Arcano/vinheta/destaque de classe). **O prompt também cita tempo-do-dia e clima como entradas — Ethurel não tem sistema de tempo nem de clima nesta fatia vertical, então essas entradas não existem no `ExperienceContext`.** Isso não é uma regressão: nenhuma das duas jamais existiu no jogo.

### 3.11 Classe muda o ambiente — **parcial, honesto**
Cada um dos 8 motivos de partícula (ash/thread/trail/shadow/stone/moss/sigil/bone) agora tem **forma e comportamento próprios** no canvas (`ParticleField.tsx`) — fios giratórios, fragmentos com rastro, manchas que somem, cristais angulares, círculos concêntricos, lascas erráticas, brilho pulsante — não só cor diferente sobre o mesmo ponto. Isso aparece na Criação (passo Classe, ao confirmar), na Ficha e no Combate. **O que NÃO foi feito** (por orçamento de tempo, não por decisão de escopo): tratamentos de tela bespoke por classe (distorção térmica real do Portador de Cinza, tecido etéreo do Tecelão do Véu, etc.) além do que partícula+cor+`ArcaneSigil`+tema de cor já entregam. A arte do LOCAL continua dominando a paleta em cenas de mundo (decisão preservada da Fase 2, documentada em `ExperienceDirector.ts`); a classe só empresta cor+motivo de partícula em telas focadas no personagem (Criação/Ficha/Combate), nunca substitui a atmosfera do mundo.

### 3.12 AudioDirector — **arquitetura completa, sem trilhas reais (honesto)**
`AudioManager.ts` evoluído: 4 canais (music/ambience/sfx/ui) + volume mestre + mute por canal, tudo persistido (`GameSettings.masterVolume/musicOn/ambienceOn/sfxOn`), fade/crossfade, desbloqueio por gesto (mobile). **Nenhum dos 10 packs da Phase 3 continha áudio** — todos são packs visuais (ver `ASSET-CATALOG.md`). Nenhuma trilha foi adicionada. `playMusic`/`playAmbience` nunca são chamados com nenhuma URL em lugar nenhum do jogo hoje — o jogo permanece **deliberadamente silencioso**, não quebrado, seguindo a instrução literal do prompt: "se não houver asset coerente, não usar qualquer áudio só para preencher".

### 3.13 Sheet / Inventário / Diário — **completo**
Ficha agora mostra ancestralidade+variante (com fallback gracioso para saves sem essa informação). Inventário usa ícones reais recortados do atlas do Pack #10 (OpenGameArt RPG Icons Set) — 8 ícones, um por motivo de item (reaproveita o vocabulário visual já existente de classe/partícula em vez de precisar de 21 ícones únicos para 21 itens catalogados). Diário: cada entrada agora tem textura de pergaminho real (Pack #6), aplicada só nos cards de conteúdo — não a tela inteira.

## 4. Sistemas explicitamente preservados sem alteração de design

- d20/checks/vantagem-desvantagem (`src/domain/dice.ts`).
- WorldEventLog, Índole (12 dimensões)/Reputação (separação testemunha-based).
- Arcane: Controle 0-59/Saturação 60-89/Ruptura 90-100, Marca Arcana persistente.
- 8 classes, 5 origens (nomes/mecânica — só a apresentação visual mudou).
- NarrativeProvider architecture: IA nunca decide HP/dano/XP/loot/atributo/dado/status/Índole/Reputação/Marca/quest/inventário — só narra o que o motor já decidiu.

## 5. Testes

103 testes (`vitest run`), todos passando. Novos nesta fase:
- `src/domain/attributeDistribution.test.ts` — orçamento de pontos, teto por atributo, reset.
- `src/data/ancestries.test.ts` — integridade dos dados, "não é só +1 atributo".
- `src/characters/visualRegistry.test.ts` — fallback de expressão nunca troca de personagem.
- `src/domain/characterFactory.test.ts` — ancestralidade/retrato/attrs (pegou e corrigiu um bug real de dupla contagem).
- `src/ui/visual/locationArt.test.ts`, extensões em `ExperienceDirector.test.ts` — resolução de fundo real e tratamento Arcano.
- `src/save/settingsStore.test.ts` — configurações antigas (sem `masterVolume`/`ambienceOn`) recebem os novos campos via merge, nunca `undefined`.
- `src/ai/RemoteNarrativeProvider.test.ts` — `isAvailable` honesto, nunca finge sucesso sem proxy configurado.

**Não coberto por teste automatizado** (verificado manualmente via QA visual, documentado abaixo): a correção do bug de Percepção Passiva é uma correção de exclusão mútua de estado React na `SceneScreen` — não há testes de componente React neste projeto (nenhuma fase anterior introduziu `@testing-library/react`; segui a mesma convenção de só testar a camada de domínio pura). A correção foi verificada visualmente nos screenshots de QA (nenhuma ocorrência de duas notas simultâneas em nenhum dos 20 screenshots capturados).

## 6. Build / Performance

- `npx tsc --noEmit` limpo.
- `npm run build`: bundle JS 334KB (105KB gzip), CSS 15.5KB (4KB gzip), fontes Cinzel self-hospedadas (~65KB, só pesos 600/700, sem 900 que não era usado).
- Imagens: 66 arquivos WebP, ~8MB total em `public/assets/img/` (portraits ~160KB médio, fundos ~200-350KB, ícones ~2KB) — cada tela só carrega as imagens que realmente usa (nenhum preload global).
- `loading="lazy"` + `decoding="async"` em todos os `<img>` de retrato/ícone.
- Nenhuma chave de API no bundle (`grep` manual + arquitetura do `RemoteNarrativeProvider` — só lê `import.meta.env.VITE_NARRATIVE_PROXY_URL`, nunca uma chave).

## 7. Saves

Nenhuma migração nova foi necessária — todas as mudanças de schema desta fase são **aditivas**:
- `LocationDiscoveryState`: união de string alargada (`desconhecido/conhecido/descoberto/visitado`) — os 3 valores antigos continuam válidos.
- `CharacterModel.ancestryId`/`ancestryVariantId`: campos opcionais novos — saves antigos carregam `undefined`, a UI trata isso como "ancestralidade não registrada" (nunca inventa uma).
- `GameSettings.masterVolume`/`ambienceOn`: campos novos com merge de default em `loadSettings()` — configurações salvas antes da Phase 3 nunca ficam com esses campos `undefined`.
- `CharacterVisualProfile`: campos renomeados (`portraitDefault→portrait`, `portraitExpressions→expressions`) — como isto é gerado sempre por `createCharacterModel`/conteúdo autoral (nunca serializado independentemente com o nome antigo em um save existente, é parte de `CharacterModel.visualProfile` dentro do save), saves antigos que tinham `portraitDefault` gravado literalmente ficam com um campo órfão inofensivo (ignorado, não lido por nada) em vez de um crash — mas o retrato desses personagens fica ausente até o jogador recriar o personagem. **Isto é uma perda cosmética documentada, não um crash.**

## 8. Propostas não canonizadas

Nenhum conteúdo novo desta fase precisou da tag `[PROPOSTA — NÃO CANONIZADO]` de lore — as 4 ancestralidades são um SISTEMA novo (mecânico/de apresentação), não lore de mundo que contradiga ou expanda `docs/design/06-WORLD-NARRATIVE-BIBLE.md`. Nenhuma delas cria facção, geografia, ou personagem nomeado novo além do que já existe.

## 9. Limitações conhecidas (completo, sem esconder nada)

1. **Áudio**: zero trilhas reais (ver §3.12) — decisão deliberada, não lacuna esquecida.
2. **Classe muda o ambiente**: só partícula+cor+sigilo, não tratamentos de tela bespoke por classe (ver §3.11).
3. **Saturação vs. Ruptura no fundo da cena**: usam a MESMA imagem de tratamento Arcano (a "lua de sangue" de Borda dos Musgos) — a diferença visual entre as duas vem só da intensidade do overlay roxo (`arcaneOverlayFor`), que é sutil num screenshot estático. A Ficha do personagem diferencia claramente as duas (rótulo "Zona Arcana" + cor da barra de Tensão + overlay de partículas mais forte em Ruptura). Não houve tempo para um segundo tratamento visual exclusivo de Ruptura.
4. **Oracle/Pyromancer/Black Witch**: retratos catalogados e processados, mas não usados em nenhuma cena do capítulo 1 (não há NPC nomeado para eles ainda).
5. **Nenhum teste de componente React**: seguindo a convenção já estabelecida nas Fases 1-2, todos os testes são de domínio puro. A correção do bug de Percepção Passiva foi verificada visualmente, não por teste automatizado.
6. **Perceptions Edge / NPC Recognition Hook das ancestralidades**: dados estruturados prontos, mas subutilizados pelo conteúdo desta fatia vertical (ver §3.2).
7. **Origem exata dos arquivos dos packs #5-#8**: reconstruída por inspeção visual de conteúdo (ver a nota de honestidade em `ASSET-CATALOG.md`), não por metadado de arquivo original.
8. Todas as limitações já documentadas nas Fases 1-2 (Remote AI não operacional, sem servidor de backend disponível, balanceamento numérico é hipótese de trabalho) continuam válidas e não foram re-verificadas nesta fase além do que está no §11 abaixo.

## 10. Débito técnico

- `AudioManager.ts` mantém o nome de arquivo antigo por não ter sido renomeado (só a classe interna foi expandida) — considerar renomear para `AudioDirector.ts` numa próxima fase, por consistência com `ExperienceDirector.ts`.
- `CharacterVisualProfile.visualTheme` (herdado da Fase 2) continua existindo e sendo setado, mas nunca é lido em lugar nenhum — candidato a remoção numa limpeza futura.

## 11. Integração de IA — status real (reafirmação, nada mudou nesta fase)

`RemoteNarrativeProvider` continua **arquitetura pronta, não operacional**: sem `VITE_NARRATIVE_PROXY_URL` configurada, `isAvailable` é `false` e o jogo usa `LocalNarrativeProvider` (determinístico, offline, conteúdo autoral). Nenhuma chave de API existe no repositório, no bundle, ou em `localStorage`. Um teste novo (`RemoteNarrativeProvider.test.ts`) garante que isso não regride silenciosamente.

## 12. Decisões pendentes de aprovação humana

1. Se as ancestralidades merecem arte de retrato própria numa fase futura (hoje o retrato do jogador é independente da ancestralidade escolhida — 4 opções fixas, sem variação visual por ancestralidade).
2. Se vale a pena investir em tratamento de tela bespoke por classe (além de partícula+cor) numa próxima fase.
3. Se/quando conseguir trilhas de áudio reais e licenciadas para wireup no AudioDirector já pronto.
4. Se Oracle/Pyromancer/Black Witch devem virar NPCs nomeados em conteúdo futuro, ou ficam reservados.

## 13. Próximos passos sugeridos (não implementados aqui — fora do escopo desta fatia vertical, §29 do prompt)

- Expandir o capítulo 2+ usando a mesma arquitetura (locais/NPCs/quests adicionais já têm o registro/sistema pronto para crescer).
- Avaliar contratar/produzir trilha sonora real para o AudioDirector.
- Considerar arte de retrato específica por ancestralidade, se aprovado.
