# Gameplay: combate, Arcane, itens, quests, NPCs — Ethurel v2

## 1. Modelo de combate — decisão

**Recomendação: (A) combate por turnos em arena visual, com uma camada tática leve — não (B) tático em grade completa, nem (C) tempo real.**

Comparativo rápido:

| Opção | Prós | Contras para este projeto |
|---|---|---|
| A. Turnos em arena | Simples de aprender, rápido de jogar no celular, permite profundidade via habilidades/Arcane sem exigir controle motor fino, fácil de tornar determinístico | Sozinho, pode ficar raso demais sem nenhum elemento tático |
| B. Tático em grade | Muita profundidade, mas exige grid de movimento, mais telas, mais tempo de decisão por combate | Pesado para "combate rápido e divertido" em mobile; risco de virar planilha, indo contra o pedido explícito |
| C. Tempo real | Mais "ação" imediata | Difícil de manter determinístico e legível com 8 classes + Arcane + controles simples no celular; exige reflexo/precisão touch, ruim para "profundidade sem complexidade de controle" |
| D. Híbrido | Flexível | Maior custo de engenharia sem ganho claro nesta fase |

**Por que A, com tempero tático:** você tem 8 classes com identidades mecânicas reais e um recurso estratégico (Arcane: Controle/Saturação/Ruptura) que já cria decisão tática por si só ("uso a habilidade mais forte e arrisco Ruptura, ou jogo seguro?"). Isso dá profundidade sem exigir grade de movimento. Adiciono três elementos leves de tática, todos determinísticos e simples de entender:

1. **Iniciativa real:** ordem de turno calculada por Reflexo (+ velocidade da ação), não "jogador sempre age primeiro".
2. **Seleção de alvo:** quando há 2+ inimigos, o jogador escolhe o alvo (a v1 sempre mirava o primeiro da lista sem escolha).
3. **Postura/exposição simples (opcional, fase 5+):** um inimigo pode ficar "exposto" (recebe mais dano) após certas ações — sem virar grid, é só um estado booleano por combatente.

## 2. Regras determinísticas de combate (a IA não decide nenhuma destas)

```
dano_base(atacante, ataque) = atk(atacante) + rolagem(d6) [+d6 extra em crítico]
dano_final = max(1, dano_base - mitigação(alvo))
crítico: d20 de acerto == 20 (ou faixa definida por Reflexo/arma)
falha crítica: d20 de acerto == 1
cura(hab) = valor_base(hab) + escala(Presença|Mente conforme classe)
custo(hab) = Foco Arcano fixo por habilidade (clamp em 0..arcaneMax)
tensão += ganho_fixo(hab) × tensionMult(classe)   // sobe ao usar habilidade
zona = tensão>=90 ? Ruptura : tensão>=60 ? Saturação : Controle
marca += max(3, round((8 - Presença*0.4) × markMult(classe)))  // só ao cruzar para Ruptura
vitória: todos os inimigos com hp<=0
derrota: hp do jogador <= 0
xp, loot: definidos pela lootTable/xpReward do inimigo (dados fixos), nunca improvisados
```

A IA recebe o resultado desses cálculos como fato consumado e só escreve a *narração* em cima ("o golpe abre um corte que arde com um brilho baço" para um crítico de Portador de Cinza, por exemplo) — ela não pode alterar HP, dano, XP ou loot.

## 3. Classes como mecânica — tabela de hooks reais (resumo; ver `02-STACK-E-ARQUITETURA.md §3`)

| Classe | Hook mecânico central |
|---|---|
| Portador de Cinza | Dano cresce com stacks de "risco" acumuladas em combate (código soma stack a cada ação, reseta ao fim). |
| Tecelão do Véu | Habilidades de controle aplicam status determinístico (ex.: `silenciado: true` por N turnos), não "a IA decide se funcionou". |
| Caçador de Fissuras | Marca de alvo dá bônus fixo de acerto/dano nas próximas ações contra aquele alvo específico. |
| Lâmina Silenciosa | Bônus de dano fixo em primeiro golpe/ataque furtivo (calculado, não narrado). |
| Guardião do Bastião | Redução percentual real de dano recebido + habilidade de escudo (HP temporário com valor fixo) + redirecionamento de dano de aliado. |
| Arauto do Musgo | Cura com fórmula fixa escalando por Presença; remoção determinística de 1 condição por uso. |
| Andarilho do Selo | Aplica status de controle (imobilizado/confuso) com duração fixa em turnos, não sujeito a interpretação. |
| Lançador de Ossos | Rolagem própria de efeito aleatório *dentro de uma tabela fixa de resultados possíveis* (não "a IA inventa o resultado") — aleatoriedade determinística com seed do RNG do jogo. |

## 4. Arcane no gameplay (não só em número)

| Zona | Mecânica | Manifestação visual/audível |
|---|---|---|
| Controle (0-59) | Uso normal | Nenhum efeito ambiental extra |
| Saturação (60-89) | Habilidades ficam mais fortes, mas cada uso aumenta mais a tensão | Partículas discretas ao redor do personagem, pequenas reações no cenário (folhas/água/luzes tremulam), som ambiente sutilmente diferente; primeira vez, uma mensagem única explica o estado |
| Ruptura (90-100) | Poder máximo, custo real; cruzar para cá aumenta a Marca permanentemente | Mudança audiovisual forte (paleta da tela pode puxar para tons mais intensos por alguns segundos, partículas mais densas, som mais grave), possível efeito colateral mecânico leve (ex.: pequeno dano de recuo, já presente em algumas habilidades da v1) |

Arcane nunca usa iconografia elétrica/neon — partículas orgânicas (esporos, raízes, veios de luz baça, bioluminescência) por classe, reaproveitando os sigilos SVG existentes como base a redesenhar em pixel art.

## 5. Itens e equipamento

```ts
interface Item {
  id: string;
  name: string;
  category: 'arma'|'armadura'|'acessorio'|'consumivel'|'material'|'questItem'|'artefato';
  rarity: 'comum'|'incomum'|'raro'|'artefato';
  stats?: Partial<{atk:number; def:number; hp:number; arcaneFocus:number}>;
  effects?: ItemEffect[];
  classRestriction?: string[];
  requirements?: {level?:number; attr?:Partial<Attrs>};
  arcane?: {tensionOnUse?:number};
  spriteKey: string;
  description: string;
  value: number;
}
```
Equipamento ocupa slots (`arma`, `armadura`, `acessório`). Não é preciso popular centenas de itens agora — a vertical slice precisa de ~6-10 itens reais (1-2 armas/classe relevante, 1 armadura, 1-2 consumíveis, 1 item de quest).

## 6. Quests

```ts
interface Quest {
  id: string; title: string; description: string; giver: string;
  status: 'desconhecida'|'descoberta'|'ativa'|'concluida'|'falhou';
  objectives: Objective[];       // cada um com condição verificável pelo código
  optionalObjectives?: Objective[];
  rewards?: {xp?:number; gold?:number; items?:string[]; reputation?:{entity:string; delta:number}[]};
  consequences?: string[];       // flags que a quest liga ao concluir
  prerequisites?: string[];      // ids de quest/flag necessários
  discoveredAt?: number; completedAt?: number;
}
interface Objective { id:string; text:string; done:boolean; check: () => boolean }
```
A IA pode variar o *texto* de descrição/diálogo em torno da quest, mas o estado (`status`, `objectives[].done`) é sempre calculado pelo jogo (ex.: "derrotar 1 inimigo tipo X", "levar item Y ao NPC Z" — verificável, nunca "a IA decide que a quest progrediu").

## 7. Bestiário

```ts
interface Enemy {
  id: string; name: string; family: string; level: number;
  stats: {hp:number; atk:number; def:number};
  abilities: string[];
  behavior: 'agressivo'|'defensivo'|'oportunista'|'suporte';
  resistances?: string[]; weaknesses?: string[];
  lootTable: {itemId:string; chance:number}[];
  xp: number; arcaneAffinity?: 'nenhuma'|'controle'|'saturacao'|'ruptura';
  sprite: string; animations: {idle:string; attack:string; hit:string; death:string};
}
```
A vertical slice precisa de **2-3 inimigos reais** (ex.: uma criatura corrompida por Arcane da Borda dos Musgos, um bandido/ex-membro de facção). A IA pode depois gerar variantes narrativas (nome próprio, descrição), mas as regras (stats/loot/comportamento) pertencem sempre ao bestiário de dados.

## 8. NPCs

```ts
interface NPC {
  id: string; name: string; role: string; location: string;
  schedule?: {morning?:string; afternoon?:string; night?:string};
  personality: string;            // 1 traço marcante, não um parágrafo
  relationship: number;           // -100..100, por jogador
  faction?: string;
  quests?: string[];              // ids de quest ligadas a este NPC
  dialogueState: Record<string, boolean|number>;
  flags: Record<string, boolean>;
  alive: boolean;
}
```
Diálogo estruturado como árvore curta (nó NPC → 2-4 respostas do jogador → reação), com uma opção discreta "Outra resposta..." que abre texto livre interpretado pela IA (dentro do que o personagem realisticamente pode fazer ali) — preserva a ação livre que você quer manter, sem tornar o diálogo padrão num parágrafo.

## 9. Índole e Reputação — efeitos reais (arquitetura, não tudo implementado no slice 1)

A arquitetura de dados já suporta, desde o início:
- `reputation[entidade]` disponível para gates simples (`if (reputation['Varreth'] < -20) precoLoja *= 1.5`).
- `indoleLabel` disponível para NPCs consultarem e reagirem (ex.: um diálogo alternativo se o rótulo for "Cruel").
Na vertical slice, implementamos **pelo menos um efeito real de cada** (ex.: preço de um item muda com reputação; um NPC oferece uma linha de diálogo diferente conforme Índole) — o suficiente para provar que o sistema tem consequência, sem exigir dezenas de ramificações ainda.
