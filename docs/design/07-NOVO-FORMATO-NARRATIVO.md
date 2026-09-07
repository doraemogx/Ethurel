# 07 — Novo Formato Narrativo

> Reconstrução total de Ethurel: de protótipo top-down (Phaser) para RPG
> narrativo cinematográfico, mobile portrait, com regras determinísticas e
> narração adaptativa. Este documento registra a decisão e o porquê — não
> repete o spec completo recebido, que continua sendo a fonte de verdade.

## Por que a virada

A implementação top-down (mapa navegável, joystick, cabana Tiny RPG, slime
Kenney) foi tratada explicitamente como protótipo de validação de sistemas
(combate, save, Índole/Reputação, quest), nunca como o produto. O formato
"andar pelo mapa e interagir com sprites" não comunica a identidade que
Ethurel precisa: mística, cinematográfica, adulta, centrada em personagem e
consequência — não em navegação espacial. A decisão de reconstrução total
(não "melhorar a UI existente") vem desse desalinhamento de formato, não de
um defeito técnico do protótipo.

## O que muda

- **Plataforma**: celular em pé (portrait) é o alvo primário. Sem exigência
  de rotação. Desktop continua funcional, mas secundário.
- **Motor**: Phaser sai por completo do runtime. A interface é React puro —
  não há mais canvas de jogo, sprites, física ou câmera. Tudo é DOM/CSS.
- **Loop central**: `Cena → Narrativa curta → Personagem → Interação →
  Reação visual → Decisão/Ação → Sistema de RPG → Consequência → Nova cena`.
  Nunca "texto grande → escolha → texto grande" sem reação intermediária.

## O que NÃO muda (cânone preservado)

Todo o motor de regras determinístico sobrevive sem reescrita de lógica —
só de acoplamento de UI. Ver `03-CARTA-DE-REUSO.md`-equivalente inline nos
commits: combate (`src/combat/`), classes e habilidades (`src/data/classes.ts`),
Índole/Reputação (`src/social/indole.ts`), zonas Arcane (`src/arcane/zone.ts`),
save versionado (`src/save/`). O d20 é uma camada nova (`src/domain/dice.ts`),
mas as fórmulas de HP/Foco já aprovadas (`HP = 16 + Vigor*4`,
`Foco = 10 + Mente*4`) são preservadas literalmente.

## Regras "podcast" — status

O spec de reconstrução pede explicitamente para preservar/adaptar regras
mencionadas em algum podcast/RPG de mesa de referência, e proíbe
explicitamente inventar conteúdo atribuído a essa fonte caso ela não esteja
disponível. Foi feita uma busca no repositório inteiro, no histórico de git,
em `docs/`, e no handoff original de ~837 linhas — nenhuma menção a um
podcast ou a regras de mesa de referência específicas foi encontrada em
nenhum lugar do projeto.

**`PODCAST_RULES_PENDING`** — não existe fonte documentada para essas regras
neste repositório. Nenhum conteúdo neste projeto é atribuído a um podcast. Se
o usuário tiver a fonte original (nome do podcast, episódio, ou transcrição),
ela precisa ser fornecida para que as regras sejam extraídas e documentadas
aqui — até lá, a camada d20 usa somente convenções de sistemas d20 genéricos
(vantagem/desvantagem, crítico em 20, falha crítica em 1, testes opostos),
documentadas em `src/domain/dice.ts`.

## Pacing do primeiro capítulo

Ver roteiro completo em `src/content/firstChapterScenes.ts`. Cinco beats:
`intro → toward-clearing → clearing-check → return → epilogue`, alternando
diálogo, exploração contextual (gated por classe/origem), teste d20, combate
e decisão com consequência de Índole/Reputação — nunca mais de duas telas
consecutivas do mesmo tipo de interação.
