# FASE1_VALIDACAO.md

Documento gerado para revisão técnica externa da implementação da Fase 1 do
Ethurel (scaffold do projeto, arquitetura de dados, esqueleto de save).
Estado real do repositório no branch `claude/ethurel-reconstrucao-uz59be`,
sem nenhuma alteração de implementação feita para preparar este documento.

---

## 1. Árvore completa de arquivos (excluindo `node_modules`, `dist`, `.git`)

```
.
├── .gitignore
├── FASE1_VALIDACAO.md          (este arquivo)
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── docs/
│   └── design/
│       ├── 01-AUDITORIA.md
│       ├── 02-STACK-E-ARQUITETURA.md
│       ├── 03-GAMEPLAY-E-COMBATE.md
│       └── 04-VERTICAL-SLICE-E-ROADMAP.md
└── src/
    ├── main.ts
    ├── ai/
    │   ├── LocalNarrativeProvider.ts
    │   └── NarrativeProvider.ts
    ├── arcane/
    │   └── zone.ts
    ├── audio/
    │   └── AudioManager.ts
    ├── classes/
    │   └── types.ts
    ├── combat/
    │   └── types.ts
    ├── core/
    │   ├── BootScene.ts
    │   └── game.ts
    ├── data/
    │   ├── classes.ts
    │   ├── enemies.ts
    │   ├── items.ts
    │   ├── map.ts
    │   ├── npcs.ts
    │   ├── origins.ts
    │   └── quests.ts
    ├── effects/
    │   └── types.ts
    ├── items/
    │   └── types.ts
    ├── npcs/
    │   └── types.ts
    ├── player/
    │   └── types.ts
    ├── quests/
    │   └── types.ts
    ├── save/
    │   ├── SaveStore.ts
    │   ├── schema.ts
    │   └── migrations/
    │       └── README.md
    ├── social/
    │   └── indole.ts
    ├── ui/
    │   └── README.md
    └── world/
        └── types.ts
```

---

## 2. Conteúdo completo dos arquivos

### `package.json`

```json
{
  "name": "ethurel",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "playwright": "^1.63.0",
    "typescript": "^5.5.4",
    "vite": "^6.4.1"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
});
```

### `src/effects/types.ts`

```ts
/**
 * Vocabulário de efeitos componíveis e data-driven — a base pela qual habilidades,
 * passivas de classe, itens e inimigos expressam comportamento sem código bespoke
 * por classe. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §3 para a especificação e
 * os exemplos das 8 classes.
 *
 * 'ally' e 'allAllies' existem só como extensibilidade futura (party/companions
 * não está no escopo atual) — nada na vertical slice usa esses valores.
 */
import type { ArcaneZone } from '@/arcane/zone';
import type { IndoleTrait } from '@/social/indole';

export type TargetRef = 'self' | 'target' | 'ally' | 'allAllies';

export type Duration =
  | { kind: 'instant' }
  | { kind: 'turns'; value: number }
  | { kind: 'untilCombatEnd' }
  | { kind: 'permanent' };

export interface StackingRule {
  max: number;
  onReapply: 'refresh' | 'add' | 'ignore';
}

export type Condition =
  | { type: 'HasStatus'; status: string; target: TargetRef }
  | { type: 'HasMark'; tag: string; target: TargetRef }
  | { type: 'IsFirstActionInCombat' }
  | { type: 'HpBelowPercent'; percent: number; target: TargetRef }
  | { type: 'TensionZoneIs'; zone: ArcaneZone }
  | { type: 'IndoleAtLeast'; trait: IndoleTrait; value: number }
  | { type: 'IndoleBelow'; trait: IndoleTrait; value: number }
  | { type: 'And'; conditions: Condition[] }
  | { type: 'Or'; conditions: Condition[] }
  | { type: 'Not'; condition: Condition };

export type StatKey = 'atk' | 'def' | 'mitigation' | 'accuracy' | 'evasion';

export type TriggerEvent = 'onHit' | 'onDamaged' | 'onTurnStart' | 'onCombatStart';

export type Effect =
  | { type: 'Damage'; amount: number; target: TargetRef }
  | { type: 'Heal'; amount: number; target: TargetRef }
  | { type: 'Shield'; amount: number; duration: Duration; target: TargetRef }
  | {
      type: 'ApplyStatus';
      status: string;
      duration: Duration;
      stacking?: StackingRule;
      target: TargetRef;
    }
  | { type: 'RemoveStatus'; status: string; target: TargetRef }
  | {
      type: 'ModifyStat';
      stat: StatKey;
      delta: number;
      duration: Duration;
      stacking?: StackingRule;
      target: TargetRef;
    }
  | { type: 'ModifyTension'; amount: number; target: TargetRef }
  | { type: 'MarkTarget'; tag: string; duration: Duration; target: TargetRef }
  | { type: 'ConditionalEffect'; condition: Condition; then: Effect[]; else?: Effect[] }
  | { type: 'Trigger'; event: TriggerEvent; effects: Effect[] }
  | { type: 'RandomEffect'; outcomes: { weight: number; effects: Effect[] }[] };

export type AbilityTier = 'controle' | 'saturacao' | 'ruptura';

export interface Ability {
  id: string;
  name: string;
  tier: AbilityTier;
  cost: number;
  tensionGain: number;
  effects: Effect[];
}
```

### `src/classes/types.ts`

*(tipo compartilhado usado por `src/data/classes.ts`)*

```ts
import type { Ability } from '@/effects/types';

export interface Attrs {
  vigor: number;
  reflexo: number;
  mente: number;
  presenca: number;
}

export interface ClassEvolution {
  id: string;
  name: string;
  description: string;
}

export interface ClassDefinition {
  id: string;
  name: string;
  tagline: string;
  concept: string;
  combatStyle: string;
  role: string;
  mainAttrs: (keyof Attrs)[];
  difficulty: 1 | 2 | 3;
  strengths: string;
  weaknesses: string;
  arcaneAffinity: string;
  /** Multiplica o ganho de Tensão ao usar habilidades desta classe. */
  tensionMult: number;
  /** Multiplica o ganho de Marca Arcana ao cruzar para Ruptura. */
  markMult: number;
  baseAttrs: Attrs;
  /** Descrição textual dos itens iniciais — vira referência a Item.id real na Fase 4. */
  startingItems: string[];
  abilities: [Ability, Ability, Ability]; // uma por tier: controle, saturacao, ruptura
  evolutions: [ClassEvolution, ClassEvolution, ClassEvolution];
}
```

### `src/data/classes.ts`

*(dados das 8 classes)*

```ts
/**
 * As 8 classes de Ethurel, preservadas do handoff (Parte 5) e reescritas em
 * efeitos componíveis (docs/design/03-GAMEPLAY-E-COMBATE.md §3) em vez de
 * hooks de código por classe.
 *
 * Números de custo/tensão/dano são HIPÓTESE DE TRABALHO — ver o gate de
 * especificação de balanceamento antes da Fase 5 (docs/design/03-GAMEPLAY-E-COMBATE.md §1).
 * Nenhum destes valores é final.
 *
 * Habilidades com `target: 'ally'` (ex.: Guardião do Bastião) estão marcadas
 * explicitamente — 'ally'/'allAllies' são extensibilidade futura (party/companions
 * fora do escopo atual); nenhuma dessas habilidades é utilizável ou testada na
 * vertical slice enquanto não houver decisão de design sobre grupo.
 */
import type { ClassDefinition } from '@/classes/types';

export const CLASSES: ClassDefinition[] = [
  {
    id: 'portador-de-cinza',
    name: 'Portador de Cinza',
    tagline: 'A ferida vira porta; a dor vira poder.',
    concept: 'Canaliza Arcane diretamente pelo corpo e pela lâmina, transformando risco físico em força bruta.',
    combatStyle: 'Corpo a corpo agressivo. Dano cresce conforme se arrisca mais.',
    role: 'Linha de frente, dano bruto.',
    mainAttrs: ['vigor', 'mente'],
    difficulty: 1,
    strengths: 'Alto dano sustentado; resistente a pressão física; ganha força ao arriscar Arcane.',
    weaknesses: 'Pouco controle fino; satura Arcane rapidamente; fraco em situações sociais.',
    arcaneAffinity: 'Instintiva e física — queima Arcane rápido, mas se acalma com repouso simples ou combate resolvido.',
    tensionMult: 1.2,
    markMult: 1,
    baseAttrs: { vigor: 4, reflexo: 2, mente: 3, presenca: 2 },
    startingItems: ['Lâmina curta de bordas irregulares', 'Bandagens ritualizadas'],
    abilities: [
      {
        id: 'golpe-cindra',
        name: 'Golpe Cindra',
        tier: 'controle',
        cost: 3,
        tensionGain: 10,
        effects: [{ type: 'Damage', amount: 4, target: 'target' }],
      },
      {
        id: 'furia-em-brasa',
        name: 'Fúria em Brasa',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 25,
        effects: [
          { type: 'Damage', amount: 9, target: 'target' },
          { type: 'Damage', amount: 1, target: 'self' },
        ],
      },
      {
        id: 'combustao-total',
        name: 'Combustão Total',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 45,
        effects: [
          { type: 'Damage', amount: 16, target: 'target' },
          { type: 'Damage', amount: 3, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'cinza-ardente', name: 'Cinza Ardente', description: 'Foco em dano/fúria crescente.' },
      { id: 'couraca-viva', name: 'Couraça Viva', description: 'Arcane vira resistência.' },
      { id: 'lamina-rompida', name: 'Lâmina Rompida', description: 'Aceita risco de Ruptura como arma constante.' },
    ],
  },
  {
    id: 'tecelao-do-veu',
    name: 'Tecelão do Véu',
    tagline: 'Arcane não se doma. Negocia-se.',
    concept: 'Estuda Arcane como linguagem, tece padrões precisos para efeitos previsíveis onde outros veem caos.',
    combatStyle: 'À distância, controle de campo, efeitos calculados.',
    role: 'Suporte técnico, controle.',
    mainAttrs: ['mente', 'reflexo'],
    difficulty: 3,
    strengths: 'Eficiência no uso de Arcane; controle preciso; poucos efeitos colaterais em uso normal.',
    weaknesses: 'Frágil fisicamente; baixo dano corpo a corpo; depende de concentração.',
    arcaneAffinity: 'Técnica e disciplinada — mantém controle fino mesmo perto da Saturação, mas a Ruptura é catastrófica quando chega.',
    tensionMult: 0.85,
    markMult: 1,
    baseAttrs: { vigor: 2, reflexo: 3, mente: 4, presenca: 2 },
    startingItems: ['Cajado dobrável de vidro-fumo', 'Caderno de padrões incompletos'],
    abilities: [
      {
        id: 'fio-arcano',
        name: 'Fio Arcano',
        tier: 'controle',
        cost: 3,
        tensionGain: 8,
        effects: [{ type: 'Damage', amount: 5, target: 'target' }],
      },
      {
        id: 'no-de-silencio',
        name: 'Nó de Silêncio',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 22,
        effects: [
          { type: 'ApplyStatus', status: 'silenciado', duration: { kind: 'turns', value: 2 }, target: 'target' },
        ],
      },
      {
        id: 'desfiar-a-trama',
        name: 'Desfiar a Trama',
        tier: 'ruptura',
        cost: 11,
        tensionGain: 42,
        effects: [
          { type: 'Damage', amount: 10, target: 'target' },
          { type: 'ModifyStat', stat: 'def', delta: -4, duration: { kind: 'turns', value: 2 }, target: 'target' },
        ],
      },
    ],
    evolutions: [
      { id: 'cartografo-de-padroes', name: 'Cartógrafo de Padrões', description: 'Exploração/utilidade.' },
      { id: 'tecelao-de-silencio', name: 'Tecelão de Silêncio', description: 'Controle/anulação.' },
      { id: 'arquiteto-de-fissuras', name: 'Arquiteto de Fissuras', description: 'Ofensivo, reescreve regras locais.' },
    ],
  },
  {
    id: 'cacador-de-fissuras',
    name: 'Caçador de Fissuras',
    tagline: 'Onde o mundo racha, eu encontro a trilha.',
    concept: 'Rastreia criaturas e fenômenos corrompidos por Arcane usando ferramentas e foco — não poder do próprio corpo.',
    combatStyle: 'À distância, tático, terreno e armadilhas, ataques certeiros.',
    role: 'Reconhecimento, dano de precisão, utilidade.',
    mainAttrs: ['reflexo', 'vigor'],
    difficulty: 2,
    strengths: 'Versátil em qualquer terreno; boa sobrevivência; detecta perigo arcano cedo.',
    weaknesses: 'Dano single-target menor; depende de preparo prévio.',
    arcaneAffinity: 'Pragmática — usa Arcane emprestada de artefatos e armadilhas, raramente do próprio corpo. Satura mais devagar que a maioria.',
    tensionMult: 0.9,
    markMult: 0.9,
    baseAttrs: { vigor: 3, reflexo: 4, mente: 2, presenca: 2 },
    startingItems: ['Arco curto e carcaz', 'Kit de armadilhas de fenda'],
    abilities: [
      {
        id: 'marca-do-rastro',
        name: 'Marca do Rastro',
        tier: 'controle',
        cost: 3,
        tensionGain: 9,
        effects: [
          { type: 'MarkTarget', tag: 'rastreado', duration: { kind: 'untilCombatEnd' }, target: 'target' },
          {
            type: 'ConditionalEffect',
            condition: { type: 'HasMark', tag: 'rastreado', target: 'target' },
            then: [{ type: 'ModifyStat', stat: 'accuracy', delta: 3, duration: { kind: 'instant' }, target: 'self' }],
          },
        ],
      },
      {
        id: 'armadilha-de-fenda',
        name: 'Armadilha de Fenda',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 24,
        effects: [
          { type: 'ApplyStatus', status: 'preso', duration: { kind: 'turns', value: 2 }, target: 'target' },
          { type: 'Damage', amount: 6, target: 'target' },
        ],
      },
      {
        id: 'chamado-da-fissura',
        name: 'Chamado da Fissura',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 44,
        effects: [
          { type: 'ModifyStat', stat: 'atk', delta: 6, duration: { kind: 'turns', value: 3 }, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'guardiao-da-fronteira', name: 'Guardião da Fronteira', description: 'Defesa de território.' },
      { id: 'cacador-de-ecos', name: 'Caçador de Ecos', description: 'Especialista em entidades arcanas.' },
      { id: 'andarilho-silencioso', name: 'Andarilho Silencioso', description: 'Furtividade/rastreamento puro.' },
    ],
  },
  {
    id: 'lamina-silenciosa',
    name: 'Lâmina Silenciosa',
    tagline: 'O que você não vê, já decidiu seu destino.',
    concept: 'Fez pactos à margem da lei com entidades pouco compreendidas; usa Arcane para iludir, silenciar, golpear das sombras.',
    combatStyle: 'Furtivo, ataques de oportunidade, ilusão/manipulação.',
    role: 'Infiltração, dano de oportunidade, informação.',
    mainAttrs: ['reflexo', 'presenca'],
    difficulty: 2,
    strengths: 'Altíssimo dano em ataques surpresa; ótima furtividade/engano; poder rápido e barato.',
    weaknesses: 'Frágil em combate direto prolongado; cada uso deixa uma "dívida" — Marca cresce mais rápido.',
    arcaneAffinity: 'Ilícita e pactuada — poder imediato no Controle, mas cada gota cobrada se acumula em algo que não é totalmente seu.',
    tensionMult: 1,
    markMult: 1.3,
    baseAttrs: { vigor: 2, reflexo: 4, mente: 2, presenca: 3 },
    startingItems: ['Par de adagas negras', 'Fragmento do contrato (nunca totalmente lido)'],
    abilities: [
      {
        id: 'veu-de-sombra',
        name: 'Véu de Sombra',
        tier: 'controle',
        cost: 3,
        tensionGain: 9,
        effects: [
          { type: 'ModifyStat', stat: 'evasion', delta: 5, duration: { kind: 'turns', value: 1 }, target: 'self' },
        ],
      },
      {
        id: 'sussurro-do-pacto',
        name: 'Sussurro do Pacto',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 23,
        effects: [
          {
            type: 'ConditionalEffect',
            condition: { type: 'IsFirstActionInCombat' },
            then: [{ type: 'Damage', amount: 14, target: 'target' }],
            else: [{ type: 'Damage', amount: 7, target: 'target' }],
          },
        ],
      },
      {
        id: 'preco-pago',
        name: 'Preço Pago',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 45,
        effects: [
          { type: 'Damage', amount: 18, target: 'target' },
          { type: 'ModifyTension', amount: 5, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'herdeiro-do-pacto', name: 'Herdeiro(a) do Pacto', description: 'Poder crescente e perigoso.' },
      { id: 'lamina-sem-nome', name: 'Lâmina sem Nome', description: 'Furtividade absoluta.' },
      { id: 'corretor-de-sombras', name: 'Corretor(a) de Sombras', description: 'Influência no submundo.' },
    ],
  },
  {
    id: 'guardiao-do-bastiao',
    name: 'Guardião do Bastião',
    tagline: 'Entre o mundo e o abismo, eu fico.',
    concept: 'Jurou proteger algo (pessoa, lugar, ideia); usa Arcane defensiva para manter o juramento vivo mesmo quando o corpo falha.',
    combatStyle: 'Defesa, proteção de aliados, contra-ataques.',
    role: 'Linha de frente defensiva.',
    mainAttrs: ['vigor', 'presenca'],
    difficulty: 1,
    strengths: 'Altíssima resistência; protege o grupo; muito difícil de derrubar.',
    weaknesses: 'Dano ofensivo baixo; depende de manter o juramento (peso narrativo se quebrado).',
    arcaneAffinity: 'Protetiva e disciplinada — controla bem em defesa, mas sofre mais ao forçar Arcane ofensivamente.',
    tensionMult: 0.8,
    markMult: 0.75,
    baseAttrs: { vigor: 4, reflexo: 2, mente: 2, presenca: 3 },
    startingItems: ['Escudo entalhado com o símbolo do juramento', 'Corrente de contenção arcana'],
    abilities: [
      {
        id: 'voto-de-bastiao',
        name: 'Voto de Bastião',
        tier: 'controle',
        cost: 3,
        tensionGain: 8,
        effects: [{ type: 'Shield', amount: 8, duration: { kind: 'untilCombatEnd' }, target: 'self' }],
      },
      {
        id: 'linha-inquebravel',
        name: 'Linha Inquebrável',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 20,
        // FORA DO ESCOPO DA VERTICAL SLICE: depende de 'ally', que é só extensibilidade
        // futura enquanto não houver decisão de design sobre grupo/companions
        // (docs/design/03-GAMEPLAY-E-COMBATE.md §3 e §7). Definida aqui para preservar
        // o conceito de classe; não é usável nem testada nos encontros da slice.
        effects: [{ type: 'Shield', amount: 10, duration: { kind: 'turns', value: 2 }, target: 'ally' }],
      },
      {
        id: 'ultima-muralha',
        name: 'Última Muralha',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 40,
        effects: [
          { type: 'ModifyStat', stat: 'mitigation', delta: 50, duration: { kind: 'turns', value: 2 }, target: 'self' },
          { type: 'ApplyStatus', status: 'exausto', duration: { kind: 'turns', value: 2 }, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'muralha-viva', name: 'Muralha Viva', description: 'Tanque absoluto.' },
      { id: 'guardiao-jurado', name: 'Guardião Jurado', description: 'Proteção dedicada a um aliado específico.' },
      { id: 'ultima-linha', name: 'Última Linha', description: 'Sacrifício, alto risco/retorno.' },
    ],
  },
  {
    id: 'arauto-do-musgo',
    name: 'Arauto do Musgo',
    tagline: 'A vida ao redor responde ao seu toque.',
    concept: 'Aprendeu a ouvir o que cresce; canaliza Arcane através de raízes, esporos e coisas vivas para sustentar aliados.',
    combatStyle: 'Suporte — mantém-se atrás, cura e remove condições.',
    role: 'Suporte, cura, fortalecimento de aliados.',
    mainAttrs: ['presenca', 'mente'],
    difficulty: 2,
    strengths: 'Cura/suporte confiáveis; percebe perigo através de fauna/flora ao redor; resistente a manipulação alheia.',
    weaknesses: 'Dano ofensivo baixo; depende de aliados por perto para render o máximo.',
    arcaneAffinity: 'Simbiótica — quanto mais vida existe ao redor, mais fácil canalizar Arcane; em lugares mortos, sente-se enfraquecido.',
    tensionMult: 0.85,
    markMult: 0.8,
    baseAttrs: { vigor: 2, reflexo: 2, mente: 3, presenca: 4 },
    startingItems: ['Cajado entrelaçado com raízes vivas', 'Bolsa de esporos secos'],
    abilities: [
      {
        id: 'toque-de-musgo',
        name: 'Toque de Musgo',
        tier: 'controle',
        cost: 3,
        tensionGain: 8,
        // Alvo 'self' na vertical slice (sem party); a cura em aliados é a extensão
        // natural desta habilidade quando houver grupo (ver nota em Guardião do Bastião).
        effects: [{ type: 'Heal', amount: 6, target: 'self' }],
      },
      {
        id: 'floracao-repentina',
        name: 'Floração Repentina',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 22,
        effects: [
          { type: 'Heal', amount: 14, target: 'self' },
          { type: 'RemoveStatus', status: 'condicao_negativa', target: 'self' },
        ],
      },
      {
        id: 'renascimento-verde',
        name: 'Renascimento Verde',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 42,
        effects: [
          { type: 'Heal', amount: 24, target: 'self' },
          { type: 'RemoveStatus', status: 'condicao_negativa', target: 'self' },
          { type: 'ModifyStat', stat: 'atk', delta: -2, duration: { kind: 'turns', value: 2 }, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'guardiao-do-musgo', name: 'Guardião do Musgo', description: 'Cura em área.' },
      { id: 'sussurro-verde', name: 'Sussurro Verde', description: 'Comunicação com fauna/flora para pistas.' },
      { id: 'floracao-forcada', name: 'Floração Forçada', description: 'Cura poderosa, satura rápido.' },
    ],
  },
  {
    id: 'andarilho-do-selo',
    name: 'Andarilho do Selo',
    tagline: 'Aprendeu os nós que prendem mais que corda.',
    concept: 'Carrega conhecimento de um culto que abandonou — símbolos e votos que amarram vontade, não só corpo.',
    combatStyle: 'Amarra, confunde, desarma inimigos à distância antes que cheguem perto.',
    role: 'Controle e manipulação de campo de batalha.',
    mainAttrs: ['mente', 'presenca'],
    difficulty: 3,
    strengths: 'Excelente contra grupos; lê intenções alheias; pode neutralizar sem matar.',
    weaknesses: 'Fraco em dano direto; quem reconhece os símbolos do Selo desconfia na hora.',
    arcaneAffinity: 'Ritualística e vinculante — usa símbolos emprestados do Culto do Selo para prender e controlar, mesmo negando pertencer a ele.',
    tensionMult: 1,
    markMult: 1.1,
    baseAttrs: { vigor: 2, reflexo: 2, mente: 4, presenca: 3 },
    startingItems: ['Cordas marcadas com símbolos apagados', 'Máscara de pano sem rosto'],
    abilities: [
      {
        id: 'no-silencioso',
        name: 'Nó Silencioso',
        tier: 'controle',
        cost: 3,
        tensionGain: 9,
        effects: [
          { type: 'ApplyStatus', status: 'imobilizado', duration: { kind: 'turns', value: 1 }, target: 'target' },
        ],
      },
      {
        id: 'marca-do-selo',
        name: 'Marca do Selo',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 23,
        effects: [
          { type: 'ApplyStatus', status: 'confuso', duration: { kind: 'turns', value: 2 }, target: 'target' },
        ],
      },
      {
        id: 'voto-quebrado',
        name: 'Voto Quebrado',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 44,
        effects: [
          { type: 'ApplyStatus', status: 'anulado', duration: { kind: 'turns', value: 1 }, target: 'target' },
          { type: 'ModifyStat', stat: 'def', delta: -3, duration: { kind: 'turns', value: 2 }, target: 'self' },
        ],
      },
    ],
    evolutions: [
      { id: 'guardiao-de-votos', name: 'Guardião de Votos', description: 'Controle defensivo.' },
      { id: 'desatador-de-nos', name: 'Desatador de Nós', description: 'Quebra amarras/maldições alheias.' },
      { id: 'selo-invertido', name: 'Selo Invertido', description: 'Controle ofensivo perigoso.' },
    ],
  },
  {
    id: 'lancador-de-ossos',
    name: 'Lançador de Ossos',
    tagline: 'Todo lance é uma pergunta que Arcane responde.',
    concept: 'Não controla Arcane — negocia com ela através de ossos e fragmentos, apostando em resultados que nem ele mesmo prevê.',
    combatStyle: 'Aposta em efeitos aleatórios de Arcane, alto risco/recompensa.',
    role: 'Imprevisível — pode virar o jogo ou piorar tudo.',
    mainAttrs: ['presenca', 'mente'],
    difficulty: 2,
    strengths: 'Pode gerar vantagens enormes do nada; imprevisível para inimigos; bom em ler padrões e sorte.',
    weaknesses: 'Resultados inconsistentes; pode prejudicar a si mesmo/aliados por acidente.',
    arcaneAffinity: 'Adivinhatória e instável — lança ossos e fragmentos e deixa Arcane decidir o resultado.',
    tensionMult: 1.1,
    markMult: 1.15,
    baseAttrs: { vigor: 2, reflexo: 3, mente: 3, presenca: 3 },
    startingItems: ['Punhado de ossos entalhados', 'Bolsa de fragmentos de sorte'],
    abilities: [
      {
        id: 'lance-simples',
        name: 'Lance Simples',
        tier: 'controle',
        cost: 3,
        tensionGain: 10,
        effects: [
          {
            type: 'RandomEffect',
            outcomes: [
              { weight: 1, effects: [{ type: 'Heal', amount: 5, target: 'self' }] },
              { weight: 1, effects: [{ type: 'ModifyStat', stat: 'atk', delta: 3, duration: { kind: 'turns', value: 2 }, target: 'self' }] },
            ],
          },
        ],
      },
      {
        id: 'lance-duplo',
        name: 'Lance Duplo',
        tier: 'saturacao',
        cost: 6,
        tensionGain: 26,
        effects: [
          {
            type: 'RandomEffect',
            outcomes: [
              { weight: 2, effects: [{ type: 'Damage', amount: 16, target: 'target' }] },
              { weight: 1, effects: [{ type: 'Damage', amount: 6, target: 'self' }] },
            ],
          },
        ],
      },
      {
        id: 'ultima-aposta',
        name: 'Última Aposta',
        tier: 'ruptura',
        cost: 10,
        tensionGain: 46,
        effects: [
          {
            type: 'RandomEffect',
            outcomes: [
              { weight: 1, effects: [{ type: 'Damage', amount: 30, target: 'target' }] },
              { weight: 1, effects: [{ type: 'Damage', amount: 15, target: 'self' }] },
            ],
          },
        ],
      },
    ],
    evolutions: [
      { id: 'mao-da-sorte', name: 'Mão da Sorte', description: 'Resultados mais controlados.' },
      { id: 'oraculo-de-ossos', name: 'Oráculo de Ossos', description: 'Previsão/informação.' },
      { id: 'jogo-final', name: 'Jogo Final', description: 'Aposta tudo, risco máximo.' },
    ],
  },
];
```

### `src/player/types.ts`

*(tipo compartilhado usado por `src/data/origins.ts` — define `OriginDefinition` e o modelo de personagem)*

```ts
import type { Attrs } from '@/classes/types';
import type { IndoleState, ReputationState } from '@/social/indole';

export type Gender = 'homem' | 'mulher';

export interface OriginDefinition {
  id: string;
  name: string;
  description: string;
  attrBonus: Partial<Attrs>;
  startingItem: string;
  /**
   * "Segredo"/gancho da origem. Os textos exatos de cada origem só existiam em
   * `ETUREL_CURRENT_SOURCE.html` (não anexado ao handoff) — os textos abaixo em
   * `src/data/origins.ts` são rascunho a confirmar contra a fonte original antes
   * de virarem cânone definitivo.
   */
  hook: string;
}

/**
 * Modelo de personagem. Passado/Princípio/Desejo/Medo/Limite são preservados
 * como campos (lore/modelo de dados) mas NÃO são obrigatórios na criação —
 * a criação (Revisão 2) é: gênero → nome → aparência básica → classe → origem
 * → jogar. Personalidade emerge de Índole durante o jogo, não de um formulário.
 */
export interface CharacterModel {
  name: string;
  gender: Gender;
  classId: string;
  originId: string;
  attrs: Attrs;
  hp: number;
  maxHp: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
  marca: number;
  indole: IndoleState;
  reputation: ReputationState;
  gold: number;
  xp: number;
  level: number;
  inventory: string[]; // ids de Item (src/data/items.ts) — populado na Fase 4
  quests: string[]; // ids de Quest (src/data/quests.ts) — populado na Fase 4
  location: string; // id de nó do mapa

  // Preservados como conceito de lore/modelo, opcionais, não coletados na criação:
  past?: string;
  principle?: string;
  desire?: string;
  fear?: string;
  limit?: string;
}
```

### `src/data/origins.ts`

*(dados das 5 origens)*

```ts
/**
 * As 5 origens, preservadas do handoff (Parte 22 — bônus/item confirmados pela
 * auditoria de código da v1). Os textos de `hook` (segredo) são rascunho — a
 * v1 os definia em `ETUREL_CURRENT_SOURCE.html`, não anexado ao handoff; ver
 * nota em `src/player/types.ts`.
 */
import type { OriginDefinition } from '@/player/types';

export const ORIGINS: OriginDefinition[] = [
  {
    id: 'cinzas-longas',
    name: 'Cinzas Longas',
    description: 'Região de fronteira em guerra.',
    attrBonus: { vigor: 1 },
    startingItem: 'Fragmento de couraça queimada',
    hook: 'Reconhece marcas de combate arcano e desconfia de autoridades militares.',
  },
  {
    id: 'arquivo-vertido',
    name: 'Arquivo Vertido',
    description: 'Biblioteca parcialmente submersa.',
    attrBonus: { mente: 1 },
    startingItem: 'Página cifrada, sentido ainda desconhecido',
    hook: '[rascunho] Reconhece fragmentos de texto arcano que a maioria ignoraria como rabisco.',
  },
  {
    id: 'culto-do-selo',
    name: 'Culto do Selo',
    description: 'Seita que venera o colapso de Arcane (Ruptura) como revelação, não como perigo.',
    attrBonus: { presenca: 1 },
    startingItem: 'Amuleto quebrado do culto',
    hook: '[rascunho] Ex-membros do Culto podem confiar ou nunca perdoar quem fugiu, dependendo de como o passado é revelado.',
  },
  {
    id: 'fronteira-partida',
    name: 'Fronteira Partida',
    description: 'Região isolada por uma fissura arcana permanente.',
    attrBonus: { reflexo: 1 },
    startingItem: 'Bússola que nunca aponta para o norte',
    hook: '[rascunho] Percebe distorções sutis no ambiente antes da maioria — cresceu perto de uma fissura permanente.',
  },
  {
    id: 'bastiao-caido',
    name: 'Bastião Caído',
    description: 'Antiga casa nobre que guardava um posto contra incursões arcanas — e caiu.',
    attrBonus: { presenca: 1 },
    startingItem: 'Selo partido da família',
    hook: '[rascunho] Reconhecido por remanescentes de outras Casas Bastião, para bem ou para mal.',
  },
];
```

### `src/social/indole.ts`

*(tipo/módulo compartilhado: define `IndoleTrait`/`IndoleState` usados por `src/effects/types.ts` e `src/player/types.ts`)*

```ts
/**
 * Índole (quem o personagem se torna) e Reputação (como o mundo o vê) — dois
 * sistemas distintos. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §9.
 *
 * Regra central (corrigida na revisão 2): eventos moral ou comportamentalmente
 * relevantes PODEM alterar as dimensões de Índole, independentemente de haver
 * testemunha. Ações neutras simplesmente não definem `indoleDelta` — não há
 * nenhuma mudança "automática" por qualquer ação. Reputação só muda quando o
 * evento é conhecido (`witnesses !== 'none'`).
 *
 * As 12 dimensões são a fonte de verdade. `indoleLabel` é só uma síntese de
 * apresentação (ficha, diálogo) — nunca a base de uma condição de jogo; use as
 * dimensões (ou combinações delas) diretamente em `Condition` (ver src/effects/types.ts).
 */

export type IndoleTrait =
  | 'compaixao'
  | 'crueldade'
  | 'altruismo'
  | 'egoismo'
  | 'honra'
  | 'pragmatismo'
  | 'ambicao'
  | 'misericordia'
  | 'lealdade'
  | 'manipulacao'
  | 'impulsividade'
  | 'autocontrole';

export const INDOLE_TRAITS: readonly IndoleTrait[] = [
  'compaixao',
  'crueldade',
  'altruismo',
  'egoismo',
  'honra',
  'pragmatismo',
  'ambicao',
  'misericordia',
  'lealdade',
  'manipulacao',
  'impulsividade',
  'autocontrole',
];

export type IndoleState = Record<IndoleTrait, number>;

export function createInitialIndole(): IndoleState {
  const state = {} as IndoleState;
  for (const trait of INDOLE_TRAITS) state[trait] = 0;
  return state;
}

const INDOLE_MIN = -100;
const INDOLE_MAX = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface IndoleDelta {
  trait: IndoleTrait;
  delta: number;
}

/** Aplica deltas de Índole de forma incondicional (a condicionalidade — se o
 * evento tem peso moral/comportamental — já foi decidida por quem gerou o
 * WorldEvent; ver `resolveWorldEvent`). Retorna um novo estado (imutável). */
export function applyIndoleDelta(state: IndoleState, deltas: IndoleDelta[]): IndoleState {
  const next = { ...state };
  for (const { trait, delta } of deltas) {
    next[trait] = clamp(next[trait] + delta, INDOLE_MIN, INDOLE_MAX);
  }
  return next;
}

export type IndoleLabel =
  | 'Cruel'
  | 'Implacável'
  | 'Benevolente'
  | 'Honrado'
  | 'Oportunista'
  | 'Pragmático'
  | 'Ambíguo';

/** Síntese de apresentação — nunca usar o retorno desta função em condição de
 * jogo (`Condition` usa as dimensões brutas via `IndoleAtLeast`/`IndoleBelow`). */
export function indoleLabel(state: IndoleState): IndoleLabel {
  const warmth =
    state.compaixao + state.altruismo + state.misericordia + state.lealdade -
    (state.crueldade + state.egoismo + state.manipulacao);
  const order = state.honra + state.autocontrole - (state.impulsividade + state.manipulacao);
  const selfInterest = state.ambicao + state.pragmatismo + state.egoismo;

  if (warmth <= -35 && state.crueldade >= 20) return 'Cruel';
  if (warmth < -15 && selfInterest > 15) return 'Implacável';
  if (warmth > 30 && order > 15) return 'Benevolente';
  if (order > 25) return 'Honrado';
  if (selfInterest > 25 && warmth < 0) return 'Oportunista';
  if (selfInterest > 20) return 'Pragmático';
  return 'Ambíguo';
}

// ---- Reputação ----

/** Reputação é por entidade (NPC, facção, vila) — sem lista pré-definida; entradas
 * novas são criadas ao primeiro evento que as referencia. */
export type ReputationState = Record<string, number>;

export function createInitialReputation(): ReputationState {
  return {};
}

export interface ReputationDelta {
  entity: string;
  delta: number;
}

export function applyReputationDelta(
  state: ReputationState,
  deltas: ReputationDelta[]
): ReputationState {
  const next = { ...state };
  for (const { entity, delta } of deltas) {
    next[entity] = clamp((next[entity] ?? 0) + delta, -100, 100);
  }
  return next;
}

// ---- Sistema simples de testemunhas/conhecimento de eventos ----

/**
 * `witnesses` decide quem "sabe" do evento — não é uma simulação social (sem
 * propagação de rumor, sem memória por NPC de terceiros): é uma decisão tomada
 * por quem desenha a quest/diálogo/combate, no momento em que o evento acontece.
 *
 * - 'none': ninguém sabe — só Índole é afetada.
 * - 'public': a comunidade/facção relevante sabe — Reputação é afetada.
 * - string[]: só os NPCs/facções nomeados sabem (ex.: a própria pessoa ajudada).
 */
export type Witnesses = 'none' | 'public' | string[];

export interface WorldEvent {
  id: string;
  /** Omitido/vazio em eventos neutros — presente só quando o evento tem peso
   * moral/comportamental real. Não é "toda ação gera delta". */
  indoleDelta?: IndoleDelta[];
  reputationDelta?: ReputationDelta[];
  witnesses: Witnesses;
}

export interface SocialState {
  indole: IndoleState;
  reputation: ReputationState;
}

export function resolveWorldEvent(state: SocialState, event: WorldEvent): SocialState {
  const indole = event.indoleDelta ? applyIndoleDelta(state.indole, event.indoleDelta) : state.indole;
  const reputation =
    event.witnesses !== 'none' && event.reputationDelta
      ? applyReputationDelta(state.reputation, event.reputationDelta)
      : state.reputation;
  return { indole, reputation };
}
```

### `src/arcane/zone.ts`

*(tipo compartilhado usado por `src/effects/types.ts` — `ArcaneZone`)*

```ts
/**
 * Zonas de Arcane — cada uma com identidade mecânica própria, não apenas graus
 * crescentes de poder. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §4.
 *
 * Fase 1 define só o tipo e o cálculo de zona a partir da Tensão; os mecanismos
 * de gerenciamento/redução de Tensão (descanso, descarga ativa, ambiente) e os
 * bônus/penalidades reais de cada zona são implementados na Fase 5, junto com a
 * especificação de balanceamento (gate obrigatório antes daquele código).
 */
export type ArcaneZone = 'controle' | 'saturacao' | 'ruptura';

export function arcaneZone(tension: number): ArcaneZone {
  if (tension >= 90) return 'ruptura';
  if (tension >= 60) return 'saturacao';
  return 'controle';
}
```

### `src/save/SaveStore.ts`

```ts
/**
 * Adaptador único de persistência. Hoje só implementa localStorage (web); quando
 * o jogo for empacotado via Capacitor, uma segunda implementação (Preferences/
 * Filesystem) entra atrás desta mesma interface, sem o resto do código saber
 * qual back-end está ativo (docs/design/02-STACK-E-ARQUITETURA.md §4).
 *
 * Nunca lança para código que chama get/set/delete — falhas de storage (modo
 * privado, quota, storage bloqueado) são tratadas aqui e reportadas via console,
 * nunca silenciosamente ignoradas nem propagadas como exceção não tratada.
 */
const STORAGE_PREFIX = 'ethurel::';

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  delete(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn('[SaveStore] Falha ao ler localStorage:', err);
      return null;
    }
  }

  set(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, value);
      return true;
    } catch (err) {
      console.warn('[SaveStore] Falha ao gravar localStorage (quota/modo privado?):', err);
      return false;
    }
  }

  delete(key: string): void {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn('[SaveStore] Falha ao remover localStorage:', err);
    }
  }
}

export class SaveStore {
  constructor(private readonly adapter: StorageAdapter = new LocalStorageAdapter()) {}

  load<T>(key: string): T | null {
    const raw = this.adapter.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[SaveStore] Save corrompido em "${key}", ignorando em vez de apagar:`, err);
      return null;
    }
  }

  /** Retorna `true` se a gravação teve sucesso — quem chama decide se avisa o
   * jogador em caso de falha; o SaveStore nunca apaga dado existente sozinho. */
  save<T>(key: string, data: T): boolean {
    return this.adapter.set(key, JSON.stringify(data));
  }

  delete(key: string): void {
    this.adapter.delete(key);
  }
}

export const saveStore = new SaveStore();
```

### `src/save/schema.ts`

```ts
/**
 * Save versionado desde o primeiro estado jogável (docs/design/02-STACK-E-ARQUITETURA.md §4).
 * Cada fase integra progressivamente seus próprios campos a este schema — a Fase 7
 * cuida só de migração/export/import/recuperação de falha e do teste final.
 *
 * Fase 1: só o schema mínimo abaixo existe (prova que o save grava/lê um objeto
 * versionado). Fase 2 acrescenta posição/mapa atual; fases seguintes acrescentam
 * NPCs conhecidos, inventário, quests, combate, etc. — sempre com uma nova
 * interface `SaveDataVN` e uma função de migração nomeada, nunca uma edição
 * silenciosa do shape anterior.
 */
export const CURRENT_SCHEMA_VERSION = 1 as const;

export interface SaveDataV1 {
  schemaVersion: 1;
  /** Contador simples de aberturas do jogo — usado só para provar visualmente
   * que o save persiste entre sessões (ver src/core/BootScene.ts). */
  sessionCount: number;
  createdAt: number;
  updatedAt: number;
}

export type SaveData = SaveDataV1;

export function createEmptySave(): SaveDataV1 {
  const now = Date.now();
  return { schemaVersion: CURRENT_SCHEMA_VERSION, sessionCount: 0, createdAt: now, updatedAt: now };
}
```

### `src/save/migrations/README.md`

*(único outro arquivo dentro de `src/save/`, além de `SaveStore.ts` e `schema.ts` acima)*

````markdown
# Migrações de save

Ainda não há nenhuma migração — só existe `schemaVersion: 1` (Fase 1).

Quando o schema mudar de shape (ex.: ao integrar inventário na Fase 4), a mudança
não edita `SaveDataV1` in-place — cria-se `SaveDataV2` em `src/save/schema.ts` e
uma função nomeada aqui, por exemplo `001_to_002.ts`:

```ts
export function migrate001To002(old: SaveDataV1): SaveDataV2 {
  return { ...old, schemaVersion: 2, inventory: [] };
}
```

A cadeia de migração completa (rodar todas as funções necessárias em sequência
até chegar à versão atual) e o teste de fechar/reabrir após uma migração real
são responsabilidade da Fase 7 (`docs/design/04-VERTICAL-SLICE-E-ROADMAP.md §3`).
````

### `src/ai/NarrativeProvider.ts`

*(interface `NarrativeProvider`)*

```ts
/**
 * Camada de IA como enhancement opcional (docs/design/02-STACK-E-ARQUITETURA.md §5).
 * O jogo precisa ser completo e coerente com esta interface implementada apenas
 * por `LocalNarrativeProvider` (conteúdo autoral, sem rede) — um provider real
 * conectado a um backend só é construído na Fase 9, depois da Fase 8 fechar.
 *
 * Regra permanente: nenhuma implementação desta interface decide HP, dano, XP,
 * loot, estado de quest ou vitória/derrota — isso é sempre código determinístico.
 */
export interface DialogueContext {
  npcId: string;
  location: string;
}

export interface ActionContext {
  location: string;
  nearbyNpcIds: string[];
}

export interface InterpretedAction {
  kind: 'talk' | 'examine' | 'unknown';
  targetId?: string;
}

export interface WorldEventForFlavor {
  id: string;
  location: string;
}

export interface NarrativeProvider {
  enrichDialogue(npcId: string, context: DialogueContext): Promise<string | null>;
  interpretFreeText(text: string, context: ActionContext): Promise<InterpretedAction | null>;
  flavorForEvent(event: WorldEventForFlavor): Promise<string | null>;
}
```

### `src/ai/LocalNarrativeProvider.ts`

```ts
import type {
  ActionContext,
  DialogueContext,
  InterpretedAction,
  NarrativeProvider,
  WorldEventForFlavor,
} from '@/ai/NarrativeProvider';

/**
 * Implementação local e determinística — sem rede. É o provider ativo durante
 * toda a vertical slice (Fases 1-8). Não é um fallback genérico pobre: diálogos,
 * quest e Códice essenciais são escritos à mão nos dados do jogo (src/data/*),
 * não gerados aqui. Este provider só cobre a parte que é opcional por natureza
 * (variação e interpretação de texto livre) e devolve `null`/interpretação
 * simples quando não tem uma resposta melhor — nunca trava o jogo.
 *
 * Fase 1: stub estrutural, sem conteúdo ainda (não há diálogos/eventos até a
 * Fase 3/6). Interpretação de texto livre por palavra-chave é implementada
 * junto com o sistema de diálogo real, na Fase 6.
 */
export class LocalNarrativeProvider implements NarrativeProvider {
  async enrichDialogue(_npcId: string, _context: DialogueContext): Promise<string | null> {
    return null;
  }

  async interpretFreeText(_text: string, _context: ActionContext): Promise<InterpretedAction | null> {
    return { kind: 'unknown' };
  }

  async flavorForEvent(_event: WorldEventForFlavor): Promise<string | null> {
    return null;
  }
}
```

### `src/main.ts`

*(bootstrap principal — ponto de entrada referenciado por `index.html`)*

```ts
import { createGame } from '@/core/game';

const root = document.getElementById('game-root');
if (!root) {
  throw new Error('Elemento #game-root não encontrado em index.html.');
}

createGame(root);
```

### `src/core/game.ts`

*(configuração/bootstrap principal do Phaser)*

```ts
import Phaser from 'phaser';
import { BootScene } from '@/core/BootScene';

/**
 * Config do Phaser. Resolução lógica 320×180 e zoom 3 seguem a especificação
 * inicial de docs/design/02-STACK-E-ARQUITETURA.md §8 — tratada como HIPÓTESE
 * a validar visualmente num Android real na Fase 2, não uma decisão congelada.
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 320,
    height: 180,
    zoom: 3,
    pixelArt: true,
    backgroundColor: '#141a17',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene],
  });
}
```

### `src/core/BootScene.ts`

*(cena mínima criada na Fase 1)*

```ts
import Phaser from 'phaser';
import { saveStore } from '@/save/SaveStore';
import { createEmptySave, type SaveDataV1 } from '@/save/schema';

const DEV_CHECK_SAVE_KEY = 'dev_boot_check';

/**
 * Cena mínima da Fase 1 — prova que o pipeline Phaser+Vite renderiza no
 * navegador e que o SaveStore persiste um objeto versionado entre sessões
 * (feche a aba/app e reabra: "Sessão nº" deve incrementar). Não é a cena de
 * jogo real — mapa/personagem/câmera/colisão são escopo da Fase 2.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const existing = saveStore.load<SaveDataV1>(DEV_CHECK_SAVE_KEY);
    const data: SaveDataV1 = existing ?? createEmptySave();
    data.sessionCount += 1;
    data.updatedAt = Date.now();
    const saved = saveStore.save(DEV_CHECK_SAVE_KEY, data);

    const centerX = this.scale.width / 2;

    this.add
      .text(centerX, 45, 'ETHUREL', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#e8dcc4',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 68, 'Fase 1 — infraestrutura (sem gameplay ainda)', {
        fontFamily: 'sans-serif',
        fontSize: '7px',
        color: '#9aa08c',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 95, `Sessão nº ${data.sessionCount}  ·  save schema v${data.schemaVersion}`, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        color: '#c9b98a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        113,
        saved ? 'save: OK (localStorage)' : 'save: indisponível neste navegador',
        {
          fontFamily: 'sans-serif',
          fontSize: '7px',
          color: saved ? '#8bbf8b' : '#c96a4b',
        }
      )
      .setOrigin(0.5);

    this.add
      .text(centerX, 150, 'Feche e reabra para ver o número da sessão subir.', {
        fontFamily: 'sans-serif',
        fontSize: '6px',
        color: '#6f7568',
      })
      .setOrigin(0.5);
  }
}
```

---

## 3. Resultados de execução

### 3.1. `npm run typecheck`

```
$ npm run typecheck

> ethurel@0.1.0 typecheck
> tsc --noEmit

(sem saída — 0 erros, exit code 0)
```

### 3.2. `npm run build`

```
$ npm run build

> ethurel@0.1.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 12 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                    0.96 kB │ gzip:   0.48 kB
dist/assets/index-QAuI7UmF.js  1,484.70 kB │ gzip: 341.17 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 7.85s
(exit code 0)
```

O aviso de chunk grande é esperado (Phaser é uma biblioteca de ~1.4 MB minificada, 341 KB gzip) — não é um erro, é uma sugestão de otimização para mais adiante (code-splitting), não bloqueante para a Fase 1.

### 3.3. Teste Playwright de persistência de save

Script executado contra `npm run preview` (build de produção servido em `http://localhost:4173`), usando o Chromium pré-instalado do ambiente (`/opt/pw-browsers/chromium-1194`). O teste: carrega a página, lê `localStorage['ethurel::dev_boot_check']`, recarrega duas vezes seguidas, e confirma que `sessionCount` incrementa a cada carregamento mantendo `schemaVersion: 1`.

```
Save após 1ª carga: {"schemaVersion":1,"sessionCount":1,"createdAt":1788705995126,"updatedAt":1788705995126}
Save após reload (2ª carga): {"schemaVersion":1,"sessionCount":2,"createdAt":1788705995126,"updatedAt":1788705996365}
Save após reload (3ª carga): {"schemaVersion":1,"sessionCount":3,"createdAt":1788705995126,"updatedAt":1788705997396}
Erros de console/página capturados: nenhum
RESULTADO: OK — sessionCount incrementou 1 -> 2 -> 3, schemaVersion estável em 1
(exit code 0)
```

### 3.4. `git status`

```
On branch claude/ethurel-reconstrucao-uz59be
Your branch is up to date with 'origin/claude/ethurel-reconstrucao-uz59be'.

nothing to commit, working tree clean
```

*(estado capturado antes da criação deste próprio arquivo `FASE1_VALIDACAO.md`; após criá-lo, ele é adicionado e commitado como passo final desta tarefa.)*

### 3.5. Commits do branch

Lista completa de commits no branch `claude/ethurel-reconstrucao-uz59be`, em ordem cronológica:

| Commit | Data (UTC) | Descrição |
|---|---|---|
| `83aae4b` | 2026-09-06 13:11:36 | Adiciona auditoria e desenho técnico para reconstrução do Ethurel (Fase 0 — documentos de design iniciais) |
| `effa557` | 2026-09-06 13:34:17 | Revisa documentos de design com os 15 ajustes da segunda rodada |
| `1af3e8f` | 2026-09-06 13:49:53 | Aplica os 6 ajustes finais à Revisão 2 antes de iniciar a Fase 1 |
| `7bbd6e5` | 2026-09-06 13:59:22 | **Fase 1: scaffold do projeto, arquitetura de dados e esqueleto de save** (implementação de código da Fase 1) |

Os três primeiros commits são os documentos de design (`docs/design/*`) que precederam a implementação; **o commit `7bbd6e5` é o único que contém a implementação de código da Fase 1** — todos os arquivos listados na seção 1 e reproduzidos na seção 2 deste documento vieram desse commit.
