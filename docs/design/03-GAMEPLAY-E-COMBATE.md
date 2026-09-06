# Gameplay: combate, Arcane, itens, quests, NPCs — Ethurel v2

> **Revisão 2:** fórmulas de combate rebaixadas a hipótese de trabalho, com uma especificação de balanceamento formal como gate antes da Fase 5; Arcane redesenhado (zonas com identidade mecânica própria, não só "mais poder"); classes migradas de hooks de código para efeitos componíveis; redirecionamento de dano do Guardião removido da slice; Índole formalizada como 12 dimensões com sistema de testemunhas/conhecimento separando-a de Reputação; itens explicitamente limitados ao necessário para a demo.

## 1. Modelo de combate — decisão (mantida, com fórmulas rebaixadas a hipótese)

**Recomendação: (A) combate por turnos em arena visual, com uma camada tática leve.**

| Opção | Prós | Contras para este projeto |
|---|---|---|
| A. Turnos em arena | Simples de aprender, rápido no celular, profundidade via habilidades/Arcane sem exigir controle motor fino, fácil de tornar determinístico | Sozinho, pode ficar raso sem elemento tático |
| B. Tático em grade | Muita profundidade | Pesado para "combate rápido e divertido" em mobile; risco de virar planilha |
| C. Tempo real | Ação imediata | Difícil manter determinístico/legível com 8 classes + Arcane em touchscreen |
| D. Híbrido | Flexível | Maior custo de engenharia sem ganho claro nesta fase |

Elementos táticos leves mantidos: **iniciativa real** (Reflexo + velocidade da ação, não "jogador sempre primeiro"), **seleção de alvo** quando há 2+ inimigos, **postura/exposição simples** (opcional, fase 5+).

### ⚠️ Gate obrigatório antes da Fase 5: Especificação de Balanceamento

As fórmulas da seção 2 abaixo são **hipótese de trabalho**, não especificação final. Antes de qualquer código de combate ser escrito, produzimos um documento dedicado de balanceamento definindo, com números reais e justificativa (não "chute"):

- **Função de cada atributo:** o que exatamente Vigor, Reflexo, Mente e Presença fazem em combate (não só "bônus genérico") — ex.: Vigor → HP e mitigação plana; Reflexo → iniciativa e evasão; Mente → Foco Arcano máximo e potência de efeito; Presença → resistência a Marca e testes sociais.
- **Ataque e defesa:** como convertem em dano final (fórmula linear? escala com nível/tier de inimigo?).
- **Precisão/evasão** (se o combate usar chance de acerto além de dano fixo): quando existe rolagem de acerto e quando o efeito é garantido.
- **Crítico:** condição de disparo e multiplicador.
- **Duração-alvo dos combates:** quantos turnos um combate comum deve durar (ex.: 3-5 turnos) para "rápido e divertido" não virar "instantâneo e raso" nem "arrastado".
- **Recuperação de Foco Arcano:** taxa/gatilho (descanso, tempo, item, kill).
- **Mecanismos de redução/gerenciamento de Tensão** (a peça que faltava na v1) — ver §4 abaixo para a arquitetura proposta; a especificação de balanceamento define os números exatos.

Esse documento é responsabilidade da Fase 5 e é pré-requisito para escrever o motor de combate — não escrevemos código de combate "no escuro" com os números atuais.

## 2. Fórmulas de combate — hipótese de trabalho (a validar na especificação acima)

```
dano_base(atacante, ataque) = atk(atacante) + rolagem(d6) [+d6 extra em crítico]
dano_final = max(1, dano_base - mitigação(alvo))
crítico: d20 de acerto == 20 (faixa exata a definir na especificação)
falha crítica: d20 de acerto == 1
cura(hab) = valor_base(hab) + escala(atributo conforme classe)
custo(hab) = Foco Arcano fixo por habilidade (clamp em 0..arcaneMax)
tensão += ganho_fixo(hab) × tensionMult(classe)
zona = tensão>=90 ? Ruptura : tensão>=60 ? Saturação : Controle
marca += max(3, round((8 - Presença*0.4) × markMult(classe)))  // só ao cruzar para Ruptura
xp, loot: definidos pela lootTable/xpReward do inimigo (dados fixos), nunca improvisados
```

A IA (quando existir uma camada de IA ativa, ver `02-STACK-E-ARQUITETURA.md §5`) recebe o resultado desses cálculos como fato consumado e só escreve a *narração* em cima — nunca altera HP, dano, XP ou loot.

## 3. Classes e habilidades: sistema de efeitos componíveis

Em vez de uma função de código por classe, cada habilidade/passiva é uma **lista de efeitos de dados**, resolvida por um motor genérico (`src/effects/`). Vocabulário de efeitos:

```ts
type Target = 'self' | 'ally' | 'enemy' | 'allEnemies' | 'allAllies';

type Effect =
  | { type: 'Damage'; amount: number; target: Target }
  | { type: 'Heal'; amount: number; target: Target }
  | { type: 'Shield'; amount: number; duration?: number; target: Target }
  | { type: 'ApplyStatus'; status: string; duration: number; target: Target }
  | { type: 'ModifyStat'; stat: 'atk'|'def'|'mitigation'|'accuracy'|'evasion'; delta: number; duration?: number; target: Target }
  | { type: 'ModifyTension'; amount: number; target: Target }
  | { type: 'MarkTarget'; tag: string; target: Target }
  | { type: 'ConditionalEffect'; condition: Condition; then: Effect[]; else?: Effect[] }
  | { type: 'Trigger'; event: 'onHit'|'onDamaged'|'onTurnStart'|'onCombatStart'; effects: Effect[] }
  | { type: 'RandomEffect'; outcomes: { weight: number; effects: Effect[] }[] };

interface Ability {
  id: string; name: string; tier: 'controle'|'saturacao'|'ruptura';
  cost: number; tensionGain: number; effects: Effect[];
}
```

**Exemplos concretos (substituindo os antigos "hooks" por classe):**

| Classe | Como fica em efeitos componíveis |
|---|---|
| Portador de Cinza | `Trigger{onTurnStart}` acumula `ModifyStat{atk,+N,duration:combat}` (stack de risco), resetado ao fim do combate — tudo dados, sem função dedicada. |
| Tecelão do Véu | Habilidade de controle = `ApplyStatus{'silenciado', duration:2}` num alvo — resolução determinística padrão do motor. |
| Caçador de Fissuras | `MarkTarget{'rastreado'}` + `ConditionalEffect` que dá `ModifyStat{accuracy,+X}` contra alvo marcado. |
| Lâmina Silenciosa | `ConditionalEffect{condition: isFirstActionInCombat, then:[ModifyStat{atk,+N}]}`. |
| Guardião do Bastião | `Shield{amount:N}` (Voto de Bastião) + passiva `ModifyStat{mitigation,+N%,duration:combat}`. **Redirecionamento de dano de aliado fica fora da slice** (ver §7). |
| Arauto do Musgo | `Heal{amount:N}` + `ApplyStatus{remove:'condição'}` compostos no mesmo efeito de habilidade. |
| Andarilho do Selo | `ApplyStatus{'imobilizado', duration:1}` ou `'confuso'` — duração fixa em turnos, não interpretação livre. |
| Lançador de Ossos | `RandomEffect{outcomes:[{weight, effects:[...]}, ...]}` — aleatoriedade determinística dentro de uma tabela fixa, com seed do RNG do jogo (não "a IA inventa o resultado"). |

Código especializado (bespoke) é reservado para o caso em que este vocabulário realmente não expressa uma mecânica — hoje, nenhuma das 8 classes exige isso.

## 4. Arcane no gameplay — zonas com identidade mecânica própria (redesenho)

As três zonas deixam de ser apenas "degraus crescentes de poder" — cada uma tem uma proposta de risco/benefício diferente:

| Zona | Faixa | Identidade mecânica | Manifestação visual/audível |
|---|---|---|---|
| **Controle** | 0-59 | **Estabilidade/eficiência/precisão.** Vantagens próprias, não apenas "ausência de poder": menor custo relativo de Foco, maior precisão/confiabilidade de efeito, sem risco de efeito colateral. É o modo sustentável — vantajoso por si, não um "modo fraco" que se tolera até acumular Saturação. | Nenhum efeito ambiental extra |
| **Saturação** | 60-89 | **Troca segurança por potência.** Habilidades mais fortes, mas com um custo real de risco: eficiência cai (mais Foco ou menor precisão), e existe chance/condição de efeito colateral (ex.: o ambiente reage, ou um NPC percebe algo). Não é "mais poder de graça". | Partículas discretas ao redor do personagem, pequenas reações no cenário (folhas/água/luzes tremulam); primeira vez, mensagem única explica o estado |
| **Ruptura** | 90-100 | **Poder excepcional com consequência real e potencialmente permanente.** Acesso a efeitos fora do alcance normal, mas: aumenta a Marca Arcana permanentemente ao cruzar para cá, pode aplicar um debuff de exaustão pós-combate, e pode registrar uma flag narrativa de consequência (ex.: o local guarda uma "cicatriz" que o Códice/NPCs podem referenciar mais tarde). | Mudança audiovisual forte (paleta puxa para tons mais intensos por alguns segundos, partículas mais densas, som mais grave) |

### Gerenciamento/redução de Tensão (peça que faltava na v1)

A Tensão não pode só subir — isso tornaria Ruptura inevitável e sem decisão real. Mecanismos propostos (números exatos ficam para a especificação de balanceamento da Fase 5):

1. **Decaimento passivo fora de combate:** a Tensão cai lentamente com o tempo/descanso, nunca instantaneamente — o personagem "se assenta", mas carrega algum resquício.
2. **Descarga ativa:** uma ação dedicada de tier Controle ("Assentar", por exemplo) que reduz Tensão a um custo (tempo de turno, pequeno debuff temporário, ou consumo de Foco) — dá ao jogador agência para gerenciar risco em vez de só esperar.
3. **Normalização parcial pós-combate:** ao fim de um encontro, parte da Tensão acumulada se dissipa (não tudo), evitando acúmulo perpétuo entre combates consecutivos mas preservando risco real dentro de cada combate.
4. **Interação com o ambiente:** locais ricos em Arcane (como o landmark de Varreth, ver `04-VERTICAL-SLICE-E-ROADMAP.md §1`) podem ajudar a reduzir Tensão ao descansar ali — liga o mecanismo ao mundo, não só a um botão de menu.

Arcane nunca usa iconografia elétrica/neon — partículas orgânicas por classe (a forma), com intensidade definida pela zona (ver `02-STACK-E-ARQUITETURA.md §8`).

## 5. Itens e equipamento — arquitetura extensível, implementação mínima

```ts
interface Item {
  id: string; name: string;
  category: 'arma'|'armadura'|'acessorio'|'consumivel'|'material'|'questItem'|'artefato';
  rarity: 'comum'|'incomum'|'raro'|'artefato';
  stats?: Partial<{atk:number; def:number; hp:number; arcaneFocus:number}>;
  effects?: Effect[];             // reaproveita o motor de efeitos componíveis
  classRestriction?: string[];
  requirements?: {level?:number};
  spriteKey: string; description: string; value: number;
}
```
Equipamento ocupa slots (`arma`, `armadura`, `acessório`). **A implementação da vertical slice fica deliberadamente pequena: 6-10 itens reais no total** (1-2 armas relevantes para a classe jogada, 1 armadura, 1-2 consumíveis, 1 item de quest). Não implementamos crafting, sets de equipamento, encantamento ou raridades além de "comum/incomum" nesta fase — a arquitetura permite isso depois, mas não é construído antes de haver conteúdo suficiente para justificar.

## 6. Quests

```ts
interface Quest {
  id: string; title: string; description: string; giver: string;
  status: 'desconhecida'|'descoberta'|'ativa'|'concluida'|'falhou';
  objectives: Objective[];
  optionalObjectives?: Objective[];
  rewards?: {xp?:number; gold?:number; items?:string[]; reputation?:{entity:string; delta:number}[]};
  consequences?: string[];
  prerequisites?: string[];
  discoveredAt?: number; completedAt?: number;
}
interface Objective { id:string; text:string; done:boolean; check: () => boolean }
```
A IA (quando ativa) pode variar o *texto* ao redor da quest, mas `status`/`objectives[].done` são sempre calculados pelo jogo. O desenho concreto da quest piloto da vertical slice (com duas resoluções significativas) está em `04-VERTICAL-SLICE-E-ROADMAP.md §1`.

## 7. Bestiário

```ts
interface Enemy {
  id: string; name: string; family: string; level: number;
  stats: {hp:number; atk:number; def:number};
  abilities: string[];             // referenciam Ability (§3), mesmo motor de efeitos
  behavior: 'agressivo'|'defensivo'|'oportunista'|'suporte';
  resistances?: string[]; weaknesses?: string[];
  lootTable: {itemId:string; chance:number}[];
  xp: number; arcaneAffinity?: 'nenhuma'|'controle'|'saturacao'|'ruptura';
  sprite: string; animations: {idle:string; attack:string; hit:string; death:string};
}
```
A vertical slice precisa de **2-3 inimigos reais** (ver desenho concreto em `04-VERTICAL-SLICE-E-ROADMAP.md §1`).

## 8. NPCs

```ts
interface NPC {
  id: string; name: string; role: string; location: string;
  personality: string;
  relationship: number;           // -100..100, por jogador
  faction?: string;
  quests?: string[];
  dialogueState: Record<string, boolean|number>;
  flags: Record<string, boolean>;
  alive: boolean;
}
```
Diálogo estruturado como árvore curta (nó NPC → 2-4 respostas → reação), com opção discreta "Outra resposta..." (texto livre, interpretado localmente por palavra-chave; enriquecido pelo `NarrativeProvider` quando ele existir). NPCs participam do sistema de testemunhas/conhecimento (§9) — é o que permite Reputação reagir sem exigir uma simulação social completa.

## 9. Índole e Reputação — formalização (12 dimensões + testemunhas)

**Regra central:** Índole muda sempre que o personagem age, **independentemente de haver testemunha**. Reputação só muda quando a ação é **conhecida** por um NPC/facção relevante. O rótulo (`indoleLabel`) continua existindo, mas é **apenas uma síntese de apresentação** — nunca a base de uma condição de jogo.

```ts
interface IndoleState { [trait: string]: number }  // as 12 dimensões, fonte de verdade

// Condições de jogo usam as dimensões diretamente, não o rótulo:
function condition(indole: IndoleState) {
  return indole.compaixao >= 20 && indole.impulsividade < 10;   // combinação de dimensões
}
// indoleLabel(indole) segue existindo só para exibir na ficha/diálogo da IA — nunca em `if` de gameplay.

interface WorldEvent {
  id: string;
  indoleDelta?: { trait: string; delta: number }[];      // sempre aplicado
  reputationDelta?: { entity: string; delta: number }[]; // só aplicado se conhecido
  witnesses: 'none' | 'public' | string[];               // quem sabe: ninguém, todo mundo, ou lista de NPCs/facções específicos
}

function resolveWorldEvent(event: WorldEvent) {
  applyIndole(event.indoleDelta);                         // incondicional
  if (event.witnesses !== 'none') {
    applyReputation(event.reputationDelta, event.witnesses); // condicional ao conhecimento
  }
}
```

Isso é deliberadamente simples: **não é uma simulação social** (não há propagação de rumores, memória de NPC por NPC, ou cálculo de quem conta para quem — isso pode vir depois, se fizer sentido). É só um campo `witnesses` em cada evento narrativo relevante, decidido no momento em que o evento é definido (na quest/diálogo/combate), que já basta para separar mecanicamente os dois sistemas e permitir a consequência dupla pedida na quest piloto (§ver `04-VERTICAL-SLICE-E-ROADMAP.md §1`).

Condições de jogo (diálogo, quest, gating de preço/loja, etc.) podem usar **dimensões individuais ou combinações** de Índole diretamente — não ficam limitadas ao rótulo único.
