/**
 * Bestiário desta vertical slice — só o inimigo do primeiro encontro (a
 * anomalia perto da Raiz Rompida, ver quest "O que a raiz sussurrou").
 * Números são hipótese de trabalho, mesmo status das habilidades em
 * src/data/classes.ts (gate de balanceamento formal fica para depois).
 * Sprite: `Assets/Battle Sprites/Living/slime.png` (ansimuz, CC0) — uma
 * criatura orgânica de olho único e tentáculos, coerente com "algo reage
 * discretamente ao Arcane" sem precisar explicar a causa definitiva.
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
    sprite: 'ansimuz-slime',
    animations: { idle: 'static', attack: 'static', hit: 'tint-flash', death: 'fade-out' },
  },
];
