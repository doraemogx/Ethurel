/**
 * Ancestralidade (Phase 3 §7) — sistema novo, criado do zero para Ethurel, não
 * uma adaptação de raças de D&D. Nenhuma ancestralidade citada em conversas
 * anteriores ("Elfo"/"Moon Elf"/"Forest Elf") era cânone — eram só exemplos de
 * discussão. As 4 abaixo nascem dos próprios pilares já estabelecidos do mundo
 * (pedra/mineral, musgo/floresta, estrada/deslocamento, Arcane/selo), não de
 * arquétipos de fantasia genéricos.
 *
 * Cada ancestralidade pode afetar aparência, atributos (pequeno, no mesmo
 * padrão de `OriginDefinition.attrBonus`), conhecimento inicial, percepção
 * (DC de Percepção Passiva) e reconhecimento por NPCs — nunca só "+1 num
 * atributo e nada mais" (spec §7 rejeita sistemas rasos).
 *
 * Variante só existe onde muda algo de verdade (spec §7): Errantes da Estrada
 * e Marcados do Selo têm variantes que mudam reconhecimento social e leitura
 * de Arcane; nenhuma ancestralidade tem variante decorativa sem diferença.
 */
import type { Attrs } from '@/classes/types';

export interface AncestryVariant {
  id: string;
  name: string;
  description: string;
  /** Ajuste fino sobre o texto de percepção/reconhecimento da ancestralidade-mãe. */
  flavorNote: string;
}

export interface AncestryDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Como afeta a aparência — texto, não asset (nenhum pack cobre 4 ancestralidades × variantes; ver ASSET-CATALOG.md). */
  appearanceNote: string;
  attrBonus: Partial<Attrs>;
  /** Reduz (mais fácil) o DC de Percepção Passiva em cenas deste perfil ambiental — ver src/domain/passiveInsights.ts. */
  perceptionEdge?: { ambientProfile: string; dcReduction: number };
  /** Entrada de conhecimento já confirmada no Diário ao início do jogo. */
  startingKnowledgeId?: string;
  /** Texto que NPCs de Varreth podem usar para reconhecer a ancestralidade — hook para diálogo, não obrigatório de disparar em toda fala. */
  npcRecognitionHook: string;
  variants: AncestryVariant[];
}

export const ANCESTRIES: AncestryDefinition[] = [
  {
    id: 'pedra-funda',
    name: 'Filhos da Pedra-Funda',
    tagline: 'Nascidos onde a rocha ainda lembra o calor da formação do mundo.',
    description:
      'Descendem de comunidades mineiras que se instalaram perto de veios e fissuras nas montanhas ao redor de Varreth, gerações atrás. O corpo aprendeu, devagar, a não entrar em pânico perto de Arcane instável — o que os torna calmos demais, aos olhos de quem não é da pedra.',
    appearanceNote: 'Pele com tom acinzentado sob luz fraca, veias visíveis levemente mais escuras nos braços — quase mineral, nunca doentio.',
    attrBonus: { vigor: 1 },
    perceptionEdge: { ambientProfile: 'cave', dcReduction: 2 },
    npcRecognitionHook: 'Comerciantes de Varreth reconhecem o sotaque de quem cresceu sob a rocha e cobram diferente — para mais confiança ou para mais cautela, depende de quem pergunta.',
    variants: [
      {
        id: 'veio-fundo',
        name: 'Veio-Fundo',
        description: 'Cresceu nos túneis, perto demais dos veios ativos. Raramente se assusta com Saturação — mas também raramente confia rápido em quem não é da pedra.',
        flavorNote: 'Mais resistente à tensão visual de Saturação; mais devagar para confiar em estranhos.',
      },
      {
        id: 'encosta',
        name: 'Encosta',
        description: 'Cresceu nas vilas de superfície das montanhas, não nos túneis. Mais acostumado a lidar com forasteiros — Varreth o recebe como recebe qualquer outro viajante.',
        flavorNote: 'Trato social padrão, sem a desconfiança inicial do Veio-Fundo.',
      },
    ],
  },
  {
    // Nome e as duas variantes ("Guardiões de Raiz"/"Dispersos") são canônicos
    // (Bíblia V7, Livro IV.010-011, 0 conflito — ver docs/canon/CANON_CONFLICTS.md
    // §2 e docs/canon/peoples/povo-do-musgo-antigo.md). A Bíblia confirma o
    // nome e as duas variantes, mas seus textos de "biologia e variação" são
    // template genérico sem detalhe biológico específico — a resposta
    // bioluminescente e as marcas descritas abaixo são invenção da Fase 3
    // (pré-Bíblia), não contradizem o cânone mas também não são confirmadas
    // por ele; preservadas como worldbuilding do jogo, sinalizadas para
    // revisão futura caso surja detalhe biológico canônico específico.
    id: 'musgo-antigo',
    name: 'Povo do Musgo Antigo',
    tagline: 'A Borda dos Musgos os reconhece antes de eles se apresentarem.',
    description:
      'Linhagem que viveu, por gerações, dentro da própria Borda dos Musgos — não perto dela, dentro dela. Carregam uma leve resposta bioluminescente na pele perto de Arcane orgânica, quase imperceptível sob luz do dia, visível à noite ou perto de esporos ativos.',
    appearanceNote: 'Marcas finas, quase como veios de folha seca, na base do pescoço e pulsos — brilham fracamente perto de Arcane orgânica.',
    attrBonus: { presenca: 1 },
    perceptionEdge: { ambientProfile: 'forest', dcReduction: 2 },
    startingKnowledgeId: 'musgo-antigo-costumes',
    npcRecognitionHook: 'Quem vive perto da floresta reconhece as marcas na pele e trata o Musgo Antigo como alguém que "escuta a Borda dos Musgos melhor que qualquer um".',
    variants: [
      {
        // id mantido ('enraizados') por estabilidade de save — só o nome
        // exibido foi corrigido para bater com o cânone ("Guardiões de
        // Raiz", não "Enraizados").
        id: 'enraizados',
        name: 'Guardiões de Raiz',
        description: 'Nunca deixou a Borda dos Musgos. As marcas são nítidas, a resposta à floresta é forte — e sair da região pesa de um jeito que outras ancestralidades não sentem.',
        flavorNote: 'Percepção mais forte em Borda dos Musgos; reconhecimento imediato por quem vive na região.',
      },
      {
        id: 'dispersos',
        name: 'Dispersos',
        description: 'Descende de quem deixou a Borda dos Musgos gerações atrás. As marcas quase sumiram — passa despercebido em Varreth, mas também perdeu parte da ligação original.',
        flavorNote: 'Passa por comum aos olhos da maioria; vantagem de percepção mais discreta.',
      },
    ],
  },
  {
    id: 'errantes-da-estrada',
    name: 'Errantes da Estrada',
    tagline: 'Nenhum lugar é casa; toda estrada é.',
    description:
      'Famílias que atravessam há gerações as rotas entre Varreth, a Estrada Velha e além — nunca se fixam por muito tempo. Leem terreno, clima e estranhos com uma naturalidade que quem vive num só lugar não desenvolve.',
    appearanceNote: 'Roupas em camadas feitas para viagem longa, sempre com algo emprestado ou remendado de outra região — nunca um único estilo fixo.',
    attrBonus: { reflexo: 1 },
    perceptionEdge: { ambientProfile: 'road', dcReduction: 2 },
    npcRecognitionHook: 'Gente de ofício em Varreth, como Tolven, reconhece um Errante pelo jeito de carregar a bagagem antes mesmo de ouvir o nome.',
    variants: [
      {
        id: 'caravaneiros',
        name: 'Caravaneiros',
        description: 'Parte de uma rede ativa de caravanas — chegam a Varreth já sabendo rumores de lugares que ainda não visitaram.',
        flavorNote: 'Chega com boatos de lugares não descobertos; rede de contatos itinerante.',
      },
      {
        id: 'solitarios',
        name: 'Solitários',
        description: 'Viaja sozinho, sem caravana. Sem a rede de boatos dos Caravaneiros, mas mais afiado para perceber perigo na estrada antes que ele chegue perto.',
        flavorNote: 'Sem rede de boatos; leitura de perigo mais apurada, sozinho na estrada.',
      },
    ],
  },
  {
    id: 'marcados-do-selo',
    name: 'Marcados do Selo',
    tagline: 'Nasceram já ouvindo o que a Arcane sussurra antes de ela agir.',
    description:
      'A menor e mais rara das quatro ancestralidades — nascem com uma sensibilidade sutil a flutuações de Arcane, presente mesmo sem qualquer treino ou classe voltada a isso. Não é dom mágico nem poder: é apenas perceber um instante antes dos outros. Alguns são recebidos com curiosidade; outros, com desconfiança aberta.',
    appearanceNote: 'Uma marca discreta, quase um veio fino sob a pele perto do olho ou da têmpora — só visível de perto, ou quando a Tensão Arcana sobe.',
    attrBonus: { mente: 1 },
    perceptionEdge: { ambientProfile: 'fissure', dcReduction: 3 },
    npcRecognitionHook: 'Quem já viu um Marcado do Selo antes reconhece a marca discreta perto do olho — e reage de acordo com a própria história com Arcane, não com regra fixa.',
    variants: [
      {
        id: 'selo-desperto',
        name: 'Selo Desperto',
        description: 'A sensibilidade sempre foi conhecida, desde criança — a marca é visível, e a comunidade sempre soube o que ela significa. Isso trouxe tanto respeito quanto desconfiança.',
        flavorNote: 'Marca claramente visível; NPCs reconhecem e reagem de imediato, para bem ou mal.',
      },
      {
        id: 'selo-latente',
        name: 'Selo Latente',
        description: 'A sensibilidade ficou adormecida a vida inteira e só começou a se manifestar recentemente. A marca ainda é quase invisível — e o próprio personagem ainda não confia totalmente no que sente.',
        flavorNote: 'Marca quase imperceptível; o próprio personagem ainda aprende a confiar na própria percepção.',
      },
    ],
  },
];

export function findAncestry(id: string | undefined): AncestryDefinition | undefined {
  return ANCESTRIES.find((a) => a.id === id);
}

export function findVariant(ancestry: AncestryDefinition | undefined, variantId: string | undefined): AncestryVariant | undefined {
  return ancestry?.variants.find((v) => v.id === variantId);
}
