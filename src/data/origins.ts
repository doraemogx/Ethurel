/**
 * As 5 origens, preservadas do handoff (Parte 22 — bônus/item confirmados pela
 * auditoria de código da v1). Os textos de `hook` (segredo) são rascunho — a
 * v1 os definia em `ETUREL_CURRENT_SOURCE.html`, não anexado ao handoff; ver
 * nota em `src/characters/types.ts`.
 */
import type { OriginDefinition } from '@/characters/types';

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
