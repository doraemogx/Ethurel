# 10 — Sistema Visual da UI

## Identidade

Mística, cósmica, elegante, adulta, fantástica. Paleta base em `:root` de
`index.html`: quase-preto azulado (`--bg-void`), violeta profundo, índigo,
prata, branco frio, com um único tom de destaque por contexto (`--accent`).
Deliberadamente evitado: cards de dashboard, grids genéricos, bordas
grossas, sombras CSS pesadas, botões web genéricos — ver `src/ui/theme.css`.

## Camadas

1. **Moldura mística constante** — `.screen` / `.screen__backdrop` /
   `.vignette` / `.mystic-btn` / `.dialogue-box` / `.d20` /
   `.slot-card` são sempre os mesmos, em toda tela. Isto é a "UI".
2. **Arte de cena variável** — `SceneArtStyle` (`src/ui/visual/sceneArt.ts`)
   muda por `AmbientProfile` do local atual (village/forest/road/cave/
   fissure/ashlands/archive): gradiente de fundo + cor/motivo de partícula.
   Isto é o "mundo", nunca a UI em si — a mesma UI mística envolve qualquer
   local.
3. **Reação Arcana por cima** — `arcaneOverlayFor(zone)` sobrepõe um halo
   sutil (Controle: quase imperceptível, opacidade 0.06) a perceptível
   (Saturação: pulso lento, opacidade 0.25) a intenso (Ruptura: opacidade
   0.55, hue-shift 40°, pulso rápido) sobre a arte de cena, sem substituir a
   atmosfera do local. Usado em `SceneScreen`, `CombatScreen` e
   `CharacterScreen` via `arcaneZone(tension)`.
4. **Tema por classe** — `ClassTheme` (`src/ui/visual/classThemes.ts`) dá a
   cada uma das 8 classes uma cor de destaque e um motivo de partícula
   próprios (cinzas para Portador de Cinza, fios para Tecelão do Véu, ossos
   para Lançador de Ossos etc.) — nunca "eletricidade roxa genérica" para
   Arcane. Usado na seleção de classe e na ficha do personagem.

## Partículas

`ParticleField` (`src/ui/visual/ParticleField.tsx`) é canvas 2D simples, sem
WebGL/lib externa, densidade fixa e pequena (26 partículas por padrão) —
performance mobile em mente (spec §61). `reduceMotion` (setting persistido)
desenha um único frame estático em vez de animar; a classe global
`.reduce-motion` (aplicada em `<html>` por `main.tsx`/`SettingsScreen`) some
com toda animação/transição CSS do app inteiro.

## d20 na interface

`D20Check` (`src/ui/components/D20Check.tsx`) só é montado quando o
`GameEngine` (a própria tela) decide que há um teste real acontecendo —
nunca em toda ação/diálogo. Mostra atributo, DC, e vantagem/desvantagem
quando aplicável; ao rolar, exibe o d20 escolhido com destaque visual
diferenciado para crítico (borda/glow dourado) e falha crítica (borda/glow
vermelho).

## Combate sem parecer planilha

`CombatScreen` reage a cada `BattleEvent` do `TurnManager` com um flash de
cor no lado atingido (vermelho para dano, verde para cura) e um log curto
das últimas 3 mensagens — nunca uma lista crescente de texto. HP/Foco/
Tensão usam a mesma `StatusBar` da ficha do personagem, não uma barra de
progresso genérica de dashboard.

## O que ainda não tem arte final

Sem produção de arte nesta sessão (fora de escopo — spec §64/§65).
Fallbacks usados, todos deliberadamente NÃO procedurais/pixel-art:
retratos são iniciais sobre um círculo com glow radial (`Portrait.tsx`);
cenas são gradientes atmosféricos + partículas (`sceneArtFor`); inimigos são
representados só por nome/motivo de cor, sem sprite. Nenhum destes é
hardcoded num componente — trocar por arte real é só popular
`portraitDefault`/um futuro `artwork` de `Location` sem mudar estrutura.
