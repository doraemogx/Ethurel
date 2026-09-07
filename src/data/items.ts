/**
 * Catálogo real de itens (Fase 2 §32) — cobre todos os itens iniciais de
 * classe/origem já referenciados em `src/data/classes.ts`/`src/data/origins.ts`
 * como texto solto. Chave = nome exato do item (evita um refactor arriscado
 * de `startingItem`/`startingItems` de string para id agora); item não
 * catalogado ainda é exibido com um fallback elegante (spec §32), nunca
 * quebra a UI. A IA nunca cria itens fora deste catálogo (spec §38).
 */
import type { Item } from '@/items/types';

export const ITEMS: Item[] = [
  { id: 'lamina-curta', name: 'Lâmina curta de bordas irregulares', type: 'equipamento', icon: 'ash', description: 'Forjada às pressas, mais afiada do que deveria ser.' },
  { id: 'bandagens-ritualizadas', name: 'Bandagens ritualizadas', type: 'consumivel', icon: 'ash', description: 'Tecido tratado com cinza — estanca ferimentos que carregam um pouco de Arcane junto.' },
  { id: 'cajado-vidro-fumo', name: 'Cajado dobrável de vidro-fumo', type: 'equipamento', icon: 'thread', description: 'Dobra-se ao meio para caber numa bolsa; nunca perde o fio quando desdobrado.' },
  { id: 'caderno-de-padroes', name: 'Caderno de padrões incompletos', type: 'artefato', icon: 'thread', description: 'Diagramas próprios, nenhum terminado — cada página é uma pergunta em aberto.' },
  { id: 'arco-curto-carcaz', name: 'Arco curto e carcaz', type: 'equipamento', icon: 'trail', description: 'Leve, feito para terreno difícil, não para força bruta.' },
  { id: 'kit-armadilhas-fenda', name: 'Kit de armadilhas de fenda', type: 'equipamento', icon: 'trail', description: 'Peças que se armam sozinhas perto de distorção arcana.' },
  { id: 'adagas-negras', name: 'Par de adagas negras', type: 'equipamento', icon: 'shadow', description: 'Não refletem luz nenhuma — nem a da lua.' },
  { id: 'fragmento-do-contrato', name: 'Fragmento do contrato (nunca totalmente lido)', type: 'artefato', icon: 'shadow', description: 'As cláusulas que faltam incomodam mais do que as que já foram lidas.' },
  { id: 'escudo-do-juramento', name: 'Escudo entalhado com o símbolo do juramento', type: 'equipamento', icon: 'stone', description: 'O entalhe se aqueceu de leve na noite em que o juramento foi feito. Nunca mais esfriou de todo.' },
  { id: 'corrente-de-contencao', name: 'Corrente de contenção arcana', type: 'equipamento', icon: 'stone', description: 'Feita para prender algo maior do que uma pessoa.' },
  { id: 'cajado-de-raizes', name: 'Cajado entrelaçado com raízes vivas', type: 'equipamento', icon: 'moss', description: 'Continua crescendo, devagar, mesmo cortado da terra.' },
  { id: 'bolsa-de-esporos', name: 'Bolsa de esporos secos', type: 'consumivel', icon: 'moss', description: 'Liberam um cheiro doce quando triturados — e algo mais, perto de Arcane.' },
  { id: 'cordas-marcadas', name: 'Cordas marcadas com símbolos apagados', type: 'equipamento', icon: 'sigil', description: 'Os símbolos foram raspados de propósito. Ainda funcionam.' },
  { id: 'mascara-sem-rosto', name: 'Máscara de pano sem rosto', type: 'equipamento', icon: 'sigil', description: 'Quem a usa para de ser reconhecido — mesmo por quem conhece bem.' },
  { id: 'ossos-entalhados', name: 'Punhado de ossos entalhados', type: 'equipamento', icon: 'bone', description: 'Cada um tem uma pergunta gravada por baixo. Nenhuma resposta é garantida.' },
  { id: 'fragmentos-de-sorte', name: 'Bolsa de fragmentos de sorte', type: 'consumivel', icon: 'bone', description: 'Pequenos ossos de animais que nunca existiram do jeito que os fragmentos sugerem.' },
  { id: 'fragmento-de-couraca', name: 'Fragmento de couraça queimada', type: 'artefato', icon: 'ash', description: 'De uma batalha que Cinzas Longas nunca terminou de contar.' },
  { id: 'pagina-cifrada', name: 'Página cifrada, sentido ainda desconhecido', type: 'artefato', icon: 'thread', description: 'Salva do Arquivo Vertido antes que a água a reclamasse. Ninguém mais a leu.' },
  { id: 'amuleto-quebrado', name: 'Amuleto quebrado do culto', type: 'artefato', icon: 'sigil', description: 'Metade de um símbolo do Culto do Selo. A outra metade nunca foi encontrada.' },
  { id: 'bussola-sem-norte', name: 'Bússola que nunca aponta para o norte', type: 'artefato', icon: 'trail', description: 'Sempre aponta para outro lugar — nunca o mesmo lugar duas vezes.' },
  { id: 'selo-partido', name: 'Selo partido da família', type: 'artefato', icon: 'stone', description: 'Ainda reconhecível por quem restou das Casas Bastião.' },
];

export function findItemByName(name: string): Item | undefined {
  return ITEMS.find((i) => i.name === name);
}
