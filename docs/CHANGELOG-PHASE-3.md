# Changelog — Phase 3

## Assets
- Auditoria completa dos 10 packs (docs/assets/ASSET-CATALOG.md, ASSET-LICENSES.md).
- Pipeline de curadoria/otimização WebP (Pillow) — 66 derivados, ~8MB, originais brutos fora do repo.
- Resolvida a lacuna de ferramenta para extrair `.7z` (Pack #10) via `py7zr`.

## Ancestralidade (novo sistema)
- 4 ancestralidades próprias de Ethurel (Filhos da Pedra-Funda, Povo do Musgo Antigo, Errantes da
  Estrada, Marcados do Selo), 2 variantes cada, sem reaproveitar raças de D&D.
- `src/data/ancestries.ts` + testes de integridade.

## Criação de personagem
- Fluxo reescrito para 12 passos: Ancestralidade → Variante → Aparência → Classe → Atributos →
  Origem → Princípio → Desejo → Medo → Limite → Identidade Arcana → Revisão.
- Regra "Selecionar != Confirmar" aplicada de ponta a ponta via `SelectConfirmStep`.
- Passo de distribuição de atributos real (`src/domain/attributeDistribution.ts`): 3 pontos, teto
  +2 por atributo, nunca abaixo do preset, reset, preview de HP/Foco.
- Retrato do jogador: 4 opções reais (Cogabushi), escolhidas no passo Aparência.
- Corrigido bug de dupla contagem do bônus de ancestralidade (pego por teste durante o desenvolvimento).

## Identidade visual de personagem
- `CharacterVisualProfile` evoluído para `{id, portrait, fullBody, pose, expressions, ancestry, presentation}`.
- Sistema de expressões (8 estados), fallback sempre para `neutral`, nunca troca de personagem.
- Tolven (NPC) ganhou retrato real + 5 expressões, wireadas nas falas de diálogo existentes.
- Oracle/Pyromancer/Black Witch catalogados e processados, reservados para conteúdo futuro.

## Locais e mapa
- Fundo real para Varreth, Borda dos Musgos (+ tratamento Arcano "lua de sangue") e Estrada Velha.
- Mapa reconstruído: pergaminho real como fundo, terreno/estradas desenhados em SVG, nomes em
  Cinzel com sombra. 4 estados de descoberta persistidos + "atual" derivado.

## Título e menu
- Sequência de abertura fade → fundo → partículas → logo → frase → menu.
- Logo em Cinzel (OFL-1.1, self-hospedada).
- Novo item de menu "Campanhas" (`CampaignsScreen.tsx`).

## Percepção Passiva
- Bug corrigido: raiz era ausência de exclusão mútua entre o estado do insight e o estado de nota
  de checagem ativa na `SceneScreen`. Nova apresentação "Percepção Passiva" com onboarding e
  bloqueio de outras notas/ações até ser reconhecida.

## Sistemas visuais/áudio
- `VisualExperienceEngine` renomeado/evoluído para `ExperienceDirector`, resolvendo fundo real por local.
- Partículas por classe agora têm forma/comportamento distintos por motivo (não só cor).
- `AudioManager` evoluído para 4 canais + volume mestre + mute, persistido — sem trilhas reais
  (nenhum pack da Phase 3 continha áudio).

## Ficha / Inventário / Diário
- Ficha mostra ancestralidade + variante.
- Ícones de item reais (Pack #10, 8 ícones por motivo).
- Diário com textura de pergaminho real nos cards de entrada.

## Testes e qualidade
- +8 arquivos de teste novos, 103 testes totais, todos passando.
- `tsc --noEmit` limpo, build de produção limpo.
- QA visual: 20 screenshots mobile-portrait cobrindo os 18 pontos pedidos.

## Documentação
- `docs/assets/ASSET-CATALOG.md`, `docs/assets/ASSET-LICENSES.md` (novos).
- `docs/HANDOFF-CURRENT.md` reescrito para o estado atual.
- Este changelog.
