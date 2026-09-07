/**
 * Bestiário desta vertical slice — só o inimigo do primeiro encontro (a
 * anomalia perto da Raiz Rompida, ver quest "O que a raiz sussurrou").
 * Números são hipótese de trabalho, mesmo status das habilidades em
 * src/data/classes.ts (gate de balanceamento formal fica para depois).
 * Sem arte final — representado na UI por um motivo visual orgânico
 * (silhueta/gradiente), nunca pixel art procedural (spec §65).
 */
import type { Enemy } from '@/combat/types';

export const ENEMIES: Enemy[] = [
  {
    id: 'limo-da-fissura',
    name: 'Limo da Fissura',
    family: 'anomalia',
    level: 1,
    stats: { hp: 22, atk: 4, def: 1 },
    abilities: [],
    behavior: 'agressivo',
    lootTable: [],
    xp: 15,
    arcaneAffinity: 'controle',
    visualKey: 'limo-da-fissura',
  },
];
