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
