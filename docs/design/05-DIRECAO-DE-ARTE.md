# Direção de Arte — Ethurel

> Documento de decisão prática, não pesquisa exaustiva. Substitui/consolida `02-STACK-E-ARQUITETURA.md §8` como fonte única da linguagem visual — aquela seção agora só aponta para cá.
>
> Contexto: a Fase 2 provou tecnicamente movimento/colisão/câmera/save num Android real, mas com blocos geométricos gerados por `Graphics` — aceitável como prova técnica, **não** como direção visual. Este documento define a direção visual real e o que muda a partir de agora.

## 1. Situação de assets (transparência obrigatória antes de tudo)

Antes de desenhar qualquer sistema novo, avaliei fontes de assets CC0/permissivos. Resultado, para registro:

- **Kenney "Tiny Dungeon" e "Tiny Town"** (CC0, por Kenney Vleugels, `kenney.nl`) são a recomendação técnica ideal para um protótipo público como este — tile 16×16, coerentes entre si, licença CC0 sem exigência de atribuição, feitos exatamente para RPG top-down 16-bit.
- **Não consegui baixá-los nesta sessão.** O ambiente de execução deste Claude Code bloqueia acesso de rede a `kenney.nl`, `opengameart.org` e `itch.io` (política de rede do sandbox, confirmado via teste direto — `EGRESS_BLOCKED`). Busca (`WebSearch`) funciona; download de arquivo (`WebFetch`/`curl`) não. Isso não é um problema de licença — é uma limitação técnica deste ambiente específico.
- Por instrução explícita do usuário, **não** uso repositórios de terceiros no GitHub como atalho para contornar isso (este ambiente também restringe a escopo do repositório do próprio projeto).
- **Decisão para este ciclo (seguindo o plano de contingência já combinado):** os assets temporários deste ciclo são **pixel art desenhada por código** (via `Phaser.Graphics` → texturas), autoral, sem questão de licença de terceiros — mas deliberadamente mais detalhada, colorida e coerente do que os blocos da Fase 2. A arquitetura mantém um único ponto de entrada por asset (`ensureTilesetTexture`, `ensurePlayerTexture`) para que, quando o Kenney Tiny Dungeon/Tiny Town (ou outro pack equivalente) puder ser obtido — por você me enviando os arquivos diretamente, ou se o acesso de rede mudar — a troca seja local a esses módulos, não uma reescrita de sistema.
- **Ação recomendada para desbloquear isso de verdade:** se você puder baixar `kenney.nl/assets/tiny-dungeon` e `tiny-town` no seu computador/celular e me enviar os arquivos (upload direto na conversa), eu integro como assets reais já no próximo ciclo, com crédito e licença documentados aqui.

## 2. Especificação visual (substitui a tabela antiga de `02-STACK-E-ARQUITETURA.md §8`)

| Parâmetro | Definição | Status |
|---|---|---|
| Resolução lógica | 320×180 (16:9) | Testada funcionalmente num Android real na Fase 2 (moveu, colidiu, salvou). Qualidade visual ainda não confirmada por você — pode subir para 480×270 ou mais se a legibilidade pedir. |
| Tile size | 16×16 px | Mantido nesta fase; ponto de maior atenção no seu próximo teste. |
| Escala do personagem | ~16×26 px (mais alto que 1 tile) | Ajustado ligeiramente nesta revisão para dar espaço a cabeça/capuz mais legível. |
| Perspectiva | Top-down 3/4 | Mantida. |
| Proporção | Personagem nitidamente menor que estruturas/árvores | Aplicada no microambiente de Varreth (árvores e a cabana são bem maiores que o personagem). |
| Frames mínimos | idle: 2 · walk (por direção): 2-3 · attack/hit/death: ainda não implementados (sem combate neste ciclo) | idle e walk (cima/baixo/lado com flip) implementados agora. |
| Densidade visual | Cenário legível a distância de braço | Variação de tile por pseudo-aleatoriedade determinística (sem repetição óbvia em grade), sem virar ruído. |
| Iluminação | Luz direcional suave, tom "fim de tarde" | Aplicada via paleta (verde-musgo mais quente, sombras curtas nas bases de árvore/cabana). |
| Sombra | Sombra de contato simples (elipse escura semi-transparente na base) em personagem e objetos verticais | Implementada no personagem e nas árvores/cabana. |
| Paleta | Pedra, musgo verde dessaturado, madeira, âmbar, azul-noturno, vermelho profundo — nunca preto puro dominante, nunca roxo neon | Mantida e reforçada (menos saturação "de teste", mais tons naturais). |
| Arquitetura (construções) | Silhueta simples de madeira/palha/pedra rústica, telhado inclinado, sem ornamento — assentamento de fronteira, não capital | 1 cabana decorativa nesta entrega. |
| Vegetação | Árvores com copa irregular (não círculo perfeito) + tronco, touceiras de grama alta, raízes expostas em 1-2 pontos | Implementada como borda natural do mapa em vez de parede de blocos. |
| Interiores | Fora de escopo deste ciclo | Ainda não construídos — só exterior. |
| Personagens (NPCs/inimigos) | Fora de escopo deste ciclo | Nenhum NPC ainda. |
| Animação | 2 frames de idle (respiração sutil) + 2-3 frames de passo por direção | Implementado. |
| VFX | Ver §3 abaixo — só direção técnica, sem implementação | Documentado, não implementado. |
| UI | Fonte pequena, paleta pergaminho/âmbar sobre fundo escuro — nunca card de site | HUD de debug mínimo mantido; overlay de "gire o aparelho" nesta entrega. |
| Regra de Arcane | Orgânico (veios, esporos, bioluminescência) — nunca elétrico, nunca roxo neon; intensidade por zona, forma por classe | Um ponto discreto de Arcane (veio luminoso na base de uma raiz) inserido no microambiente, sem explicar nada — só sinalizar visualmente. |

### Regras de consistência para futuros mapas

1. Todo tileset novo reaproveita a paleta desta tabela — nenhuma cor fora dela sem atualizar este documento primeiro.
2. Bordas de mapa são sempre elementos naturais (árvore, rocha, água, desnível) ou arquitetura coerente com o local — nunca uma parede de tile genérico repetido.
3. Todo tile de piso tem pelo menos 2 variantes visuais aplicadas de forma não uniforme, para evitar leitura de "grade de teste".
4. Personagem, NPCs e inimigos compartilham a mesma unidade de escala (proporcional ao tile size vigente) e a mesma régua de sombra de contato.
5. Arcane nunca aparece como efeito isolado "decorativo" sem motivo — todo ponto de Arcane visível no cenário deve corresponder a algo que a Fase 3+ vai explicar ou usar mecanicamente.

## 3. VFX — direção técnica preparada, não implementada

Combate não existe ainda (Fase 5). Isto documenta o **padrão** que o motor de efeitos (`src/effects/`) deverá acionar quando o combate for implementado, para que о desenho de dados já saia compatível.

Pipeline de um ataque físico (ex.: espada):

```
wind-up (1-2 frames de antecipação)
  → movimento/deslocamento do golpe
  → slash VFX (traço/arco de partícula, curto, direcional)
  → contato (frame de impacto)
  → hit flash (flash branco/claro de 1-2 frames no alvo)
  → partículas de impacto (forma pela natureza do dano: corte, impacto, arcano)
  → aplicação de dano (número flutuante, já determinístico — ver docs/design/03)
  → SFX (som de impacto)
  → camera shake leve (só em acertos críticos/Ruptura — nunca em todo golpe, satura rápido visualmente)
```

Magia/Arcane usa o mesmo pipeline, mas com partículas maiores/mais numerosas e cor/intensidade que muda por zona:

- **Controle:** VFX discreto, quase sem partícula extra além do próprio golpe.
- **Saturação:** partículas visíveis ao redor do personagem durante a habilidade, cor da paleta de Arcane (nunca neon).
- **Ruptura:** VFX dominante na tela por um instante (mais partículas, leve distorção cromática momentânea, nunca tela inteira roxa) — a diferença entre as três zonas precisa ser reconhecível sem ler HUD.

Nenhum destes efeitos é implementado agora — combate falso não é criado só para demonstrar isto.

## 4. O que muda no código deste ciclo

- Tileset e personagem: redesenhados com mais detalhe/cor, mantendo a mesma arquitetura de geração por código (nenhum novo asset externo, pelos motivos do §1).
- Landscape: overlay de "gire o aparelho" quando o dispositivo está em portrait, em vez de mostrar o jogo espremido/com espaço vazio.
- Ver `docs/design/06-WORLD-NARRATIVE-BIBLE.md` para o que este primeiro microambiente representa narrativamente.
