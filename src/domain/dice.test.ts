import { describe, it, expect } from 'vitest';
import { rollD20, checkD20, opposedCheckD20, computeMaxHp, computeMaxFocus, type RandomSource } from '@/domain/dice';

/** RandomSource determinístico: sempre devolve o mesmo valor 0..1. */
function fixed(value: number): RandomSource {
  return () => value;
}

/** Sequência de valores 0..1 consumidos em ordem — para vantagem/desvantagem
 * (2 rolagens) e testes opostos. */
function sequence(values: number[]): RandomSource {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe('rollD20', () => {
  it('rola 1..20 corretamente a partir de um random 0..1', () => {
    expect(rollD20(0, 'normal', fixed(0)).chosenRoll).toBe(1);
    expect(rollD20(0, 'normal', fixed(0.999)).chosenRoll).toBe(20);
  });

  it('soma o modificador ao total', () => {
    const result = rollD20(3, 'normal', fixed(0.5)); // 0.5*20=10 -> +1 = 11
    expect(result.chosenRoll).toBe(11);
    expect(result.total).toBe(14);
  });

  it('vantagem escolhe o maior dos dois dados', () => {
    const result = rollD20(0, 'advantage', sequence([0.05, 0.9])); // rolls 2 e 19
    expect(result.rawRolls).toEqual([2, 19]);
    expect(result.chosenRoll).toBe(19);
  });

  it('desvantagem escolhe o menor dos dois dados', () => {
    const result = rollD20(0, 'disadvantage', sequence([0.05, 0.9]));
    expect(result.chosenRoll).toBe(2);
  });

  it('detecta crítico (natural 20) e falha crítica (natural 1)', () => {
    expect(rollD20(0, 'normal', fixed(0.999)).isCriticalSuccess).toBe(true);
    expect(rollD20(0, 'normal', fixed(0)).isCriticalFailure).toBe(true);
  });
});

describe('checkD20', () => {
  it('sucesso quando total >= DC', () => {
    const result = checkD20(5, 14, 'normal', fixed(0.5)); // roll 11 + 5 = 16 >= 14
    expect(result.success).toBe(true);
  });

  it('falha quando total < DC', () => {
    const result = checkD20(0, 14, 'normal', fixed(0.1)); // roll ~3
    expect(result.success).toBe(false);
  });

  it('natural 20 sempre sucede, mesmo contra DC absurda', () => {
    const result = checkD20(-10, 30, 'normal', fixed(0.999));
    expect(result.success).toBe(true);
  });

  it('natural 1 sempre falha, mesmo com modificador altíssimo', () => {
    const result = checkD20(100, 5, 'normal', fixed(0));
    expect(result.success).toBe(false);
  });
});

describe('opposedCheckD20', () => {
  it('quem tira o maior total vence; empate favorece o defensor', () => {
    const result = opposedCheckD20(0, 0, 'normal', 'normal', sequence([0.9, 0.9]));
    expect(result.attacker.total).toBe(result.defender.total);
    expect(result.attackerWins).toBe(false);
  });

  it('atacante vence quando seu total é maior', () => {
    const result = opposedCheckD20(5, 0, 'normal', 'normal', sequence([0.5, 0.5]));
    expect(result.attackerWins).toBe(true);
  });
});

describe('fórmulas preservadas (HP/Foco)', () => {
  it('HP = 16 + Vigor*4', () => {
    expect(computeMaxHp(4)).toBe(32);
    expect(computeMaxHp(0)).toBe(16);
  });

  it('Foco = 10 + Mente*4', () => {
    expect(computeMaxFocus(3)).toBe(22);
    expect(computeMaxFocus(0)).toBe(10);
  });
});
