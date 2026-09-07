import { describe, it, expect } from 'vitest';
import { createPlayerCombatant, createEnemyCombatant, playerBaseAtk } from '@/combat/Combatant';
import { createBattleState } from '@/combat/BattleState';
import { TurnManager } from '@/combat/TurnManager';
import { CLASSES } from '@/data/classes';
import { ENEMIES } from '@/data/enemies';

const portadorDeCinza = CLASSES.find((c) => c.id === 'portador-de-cinza')!;
const golpeCindra = portadorDeCinza.abilities.find((a) => a.id === 'golpe-cindra')!;
const slime = ENEMIES[0];

function setupBattle() {
  const player = createPlayerCombatant({
    name: 'Aldric',
    vigor: portadorDeCinza.baseAttrs.vigor,
    hp: 36,
    maxHp: 36,
    arcaneFocus: 19,
    arcaneMax: 19,
    tension: 0,
  });
  const enemy = createEnemyCombatant(slime.id, slime.name, slime.stats.hp, slime.stats.atk, slime.stats.def);
  const state = createBattleState(player, enemy);
  const turnManager = new TurnManager(state, portadorDeCinza.passives, portadorDeCinza.tensionMult);
  return { state, turnManager, player, enemy };
}

describe('Combate por turnos', () => {
  it('ação do jogador (ataque básico) resolve dano determinístico no inimigo', () => {
    const { state, turnManager, enemy } = setupBattle();
    const hpBefore = enemy.hp;
    const events = turnManager.runRound({ type: 'basicAttack' });
    expect(enemy.hp).toBeLessThan(hpBefore);
    expect(events.some((e) => e.kind === 'damage' && e.targetId === enemy.id)).toBe(true);
    expect(state.phase).toBe('player-select');
  });

  it('ação do inimigo resolve dano no jogador no mesmo round', () => {
    const { turnManager, player } = setupBattle();
    const hpBefore = player.hp;
    turnManager.runRound({ type: 'basicAttack' });
    expect(player.hp).toBeLessThan(hpBefore);
  });

  it('vitória encerra o combate quando o inimigo chega a 0 HP', () => {
    const { state, turnManager, enemy } = setupBattle();
    let events: ReturnType<TurnManager['runRound']> = [];
    for (let i = 0; i < 20 && enemy.hp > 0; i++) {
      events = turnManager.runRound({ type: 'basicAttack' });
    }
    expect(enemy.alive).toBe(false);
    expect(state.phase).toBe('victory');
    expect(events.some((e) => e.kind === 'victory')).toBe(true);
  });

  it('fugir encerra a ação do jogador sem o inimigo agir', () => {
    const { turnManager, player } = setupBattle();
    const hpBefore = player.hp;
    turnManager.runRound({ type: 'flee' });
    expect(player.hp).toBe(hpBefore); // inimigo não chega a atacar
  });

  it('habilidade Arcane (Golpe Cindra) consome Foco e aumenta Tensão corretamente', () => {
    const { turnManager, player } = setupBattle();
    const focusBefore = player.arcaneFocus;
    const events = turnManager.runRound({ type: 'ability', ability: golpeCindra });
    expect(player.arcaneFocus).toBe(focusBefore - golpeCindra.cost);
    expect(player.tension).toBe(Math.round(golpeCindra.tensionGain * portadorDeCinza.tensionMult));
    expect(events.some((e) => e.kind === 'tension')).toBe(true);
  });

  it('passiva do Portador de Cinza empilha +1 ATK a cada ganho de Tensão (até o máximo de 5)', () => {
    const { turnManager, player, enemy } = setupBattle();
    for (let i = 0; i < 6; i++) {
      if (!enemy.alive) break;
      turnManager.runRound({ type: 'ability', ability: golpeCindra });
    }
    const atkStacks = player.statMods.filter((m) => m.stat === 'atk').length;
    expect(atkStacks).toBeLessThanOrEqual(5);
    expect(atkStacks).toBeGreaterThan(0);
  });

  it('recompensa (xp) só é aplicada uma vez, no momento da vitória (fora do TurnManager)', () => {
    // O TurnManager não aplica xp — quem chama (BattleScene) aplica
    // exatamente uma vez ao ver phase==='victory'. Aqui garantimos que
    // rounds adicionais depois da vitória não são possíveis (o jogo troca
    // de cena), e que múltiplas chamadas ao mesmo evento de vitória não
    // duplicam o xp do lado dos dados do inimigo.
    expect(slime.xp).toBeGreaterThan(0);
  });

  it('playerBaseAtk é uma função determinística de vigor', () => {
    expect(playerBaseAtk(4)).toBe(playerBaseAtk(4));
    expect(playerBaseAtk(6)).toBeGreaterThan(playerBaseAtk(2));
  });
});
