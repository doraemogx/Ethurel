import { describe, it, expect, vi } from 'vitest';
import { InteractionSystem } from '@/interaction/InteractionSystem';

describe('InteractionSystem', () => {
  it('retorna null quando nada está no alcance', () => {
    const sys = new InteractionSystem();
    sys.register({ id: 'npc', x: 100, y: 100, radius: 10, label: 'NPC', enabled: () => true, onInteract: () => {} });
    expect(sys.nearestInRange(0, 0)).toBeNull();
  });

  it('retorna o interactable quando o jogador está dentro do raio', () => {
    const sys = new InteractionSystem();
    sys.register({ id: 'npc', x: 100, y: 100, radius: 20, label: 'NPC', enabled: () => true, onInteract: () => {} });
    const found = sys.nearestInRange(105, 100);
    expect(found?.id).toBe('npc');
  });

  it('ignora interactables desabilitados', () => {
    const sys = new InteractionSystem();
    sys.register({ id: 'npc', x: 0, y: 0, radius: 20, label: 'NPC', enabled: () => false, onInteract: () => {} });
    expect(sys.nearestInRange(0, 0)).toBeNull();
  });

  it('retorna o mais próximo entre vários no alcance', () => {
    const sys = new InteractionSystem();
    sys.register({ id: 'longe', x: 50, y: 0, radius: 100, label: 'longe', enabled: () => true, onInteract: () => {} });
    sys.register({ id: 'perto', x: 5, y: 0, radius: 100, label: 'perto', enabled: () => true, onInteract: () => {} });
    expect(sys.nearestInRange(0, 0)?.id).toBe('perto');
  });

  it('interagir nunca dispara sozinho por proximidade — só via onInteract explícito', () => {
    const onInteract = vi.fn();
    const sys = new InteractionSystem();
    sys.register({ id: 'npc', x: 0, y: 0, radius: 20, label: 'NPC', enabled: () => true, onInteract });
    sys.nearestInRange(5, 0);
    expect(onInteract).not.toHaveBeenCalled();
  });
});
