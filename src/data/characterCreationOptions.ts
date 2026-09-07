/**
 * Princípio / Desejo / Medo / Limite — recuperados do
 * `ETUREL_PROJECT_HANDOFF.md` (Parte 22), texto exato preservado. Ver
 * docs/design/11-LEGACY-RECOVERY.md.
 *
 * Seed de Índole: o handoff confirma que Princípio e Desejo somavam valores
 * iniciais (deltas "entre 4 e 16") a certos traços, e dá dois exemplos
 * exatos: o princípio "Uma promessa nunca deve ser quebrada" (honra +16) e o
 * desejo "Vingança contra quem tirou algo seu" (impulsividade +8, crueldade
 * +4) — usados aqui literalmente. Os demais deltas são **[PROPOSTA]**,
 * seguindo o mesmo padrão (mesma faixa, mesma lógica de mapear cada frase ao
 * traço mais óbvio) — o handoff não anexou a tabela completa original.
 */
import type { IndoleDelta } from '@/social/indole';

export interface CreationOption {
  id: string;
  text: string;
  indoleSeed?: IndoleDelta[];
}

export const PRINCIPLES: CreationOption[] = [
  { id: 'protect-weak', text: 'Os fracos precisam ser protegidos, custe o que custar.', indoleSeed: [{ trait: 'compaixao', delta: 12 }, { trait: 'autocontrole', delta: 4 }] },
  { id: 'survive-first', text: 'Sobreviver vem antes de qualquer ideal.', indoleSeed: [{ trait: 'pragmatismo', delta: 14 }, { trait: 'egoismo', delta: 6 }] },
  { id: 'knowledge-any-cost', text: 'Conhecimento vale qualquer preço, mesmo o mais alto.', indoleSeed: [{ trait: 'ambicao', delta: 10 }, { trait: 'pragmatismo', delta: 8 }] },
  { id: 'promise-unbroken', text: 'Uma promessa nunca deve ser quebrada.', indoleSeed: [{ trait: 'honra', delta: 16 }] },
  { id: 'power-belongs', text: 'Poder pertence a quem consegue conquistá-lo e sustentá-lo.', indoleSeed: [{ trait: 'ambicao', delta: 14 }, { trait: 'egoismo', delta: 6 }] },
  { id: 'no-one-alone', text: 'Ninguém se salva sozinho — lealdade é tudo.', indoleSeed: [{ trait: 'lealdade', delta: 16 }] },
];

export const DESIRES: CreationOption[] = [
  { id: 'power-never-powerless', text: 'Poder suficiente para nunca mais ser impotente', indoleSeed: [{ trait: 'ambicao', delta: 10 }, { trait: 'impulsividade', delta: 4 }] },
  { id: 'unique-knowledge', text: 'Conhecimento que ninguém mais possui', indoleSeed: [{ trait: 'ambicao', delta: 8 }, { trait: 'pragmatismo', delta: 6 }] },
  { id: 'answer-to-no-one', text: 'Liberdade para não responder a mais ninguém', indoleSeed: [{ trait: 'egoismo', delta: 8 }, { trait: 'autocontrole', delta: 4 }] },
  { id: 'recognition', text: 'Reconhecimento por aquilo que fez', indoleSeed: [{ trait: 'ambicao', delta: 8 }, { trait: 'honra', delta: 4 }] },
  { id: 'revenge', text: 'Vingança contra quem tirou algo seu', indoleSeed: [{ trait: 'impulsividade', delta: 8 }, { trait: 'crueldade', delta: 4 }] },
  { id: 'belonging', text: 'Um lugar a que finalmente pertença', indoleSeed: [{ trait: 'lealdade', delta: 8 }, { trait: 'compaixao', delta: 4 }] },
  { id: 'redemption', text: 'Redenção por algo que não consegue esquecer', indoleSeed: [{ trait: 'misericordia', delta: 8 }, { trait: 'autocontrole', delta: 4 }] },
  { id: 'wealth', text: 'Riqueza suficiente para nunca mais temer a fome', indoleSeed: [{ trait: 'pragmatismo', delta: 10 }, { trait: 'egoismo', delta: 4 }] },
  { id: 'hidden-truth', text: 'A verdade sobre algo que esconderam de você', indoleSeed: [{ trait: 'ambicao', delta: 6 }, { trait: 'impulsividade', delta: 6 }] },
];

export const FEARS: CreationOption[] = [
  { id: 'fail-dependents', text: 'Fracassar quando alguém depender de você' },
  { id: 'abandoned', text: 'Ser abandonado(a) quando mais precisar' },
  { id: 'lose-arcane-control', text: 'Perder o controle sobre a própria Arcane' },
  { id: 'discovered', text: 'Ser descoberto(a) por quem você realmente é' },
  { id: 'return-origin', text: 'Ter que voltar para o lugar de onde veio' },
  { id: 'become-despised', text: 'Tornar-se exatamente como alguém que despreza' },
];

export const LIMITS: CreationOption[] = [
  { id: 'no-harm-child', text: 'Nunca farei mal a uma criança, aconteça o que acontecer.' },
  { id: 'no-betray-trust', text: 'Nunca vou trair quem confiou em mim primeiro.' },
  { id: 'no-arcane-helpless', text: 'Nunca vou usar Arcane contra alguém indefeso.' },
  { id: 'no-leave-wounded', text: 'Nunca vou abandonar alguém ferido para trás.' },
  { id: 'no-sell-word', text: 'Nunca vou vender minha palavra por dinheiro.' },
  { id: 'no-become-enemy', text: 'Nunca vou me tornar aquilo que jurei destruir.' },
];
