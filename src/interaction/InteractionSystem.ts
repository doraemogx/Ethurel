import type { Interactable } from '@/interaction/Interactable';

/**
 * Não acoplado à Scene — só recebe posição do jogador e devolve o
 * Interactable mais próximo dentro do raio (ou null). Quem desenha o
 * indicador/botão (InteractionPrompt) e quem decide o que "interagir"
 * significa (diálogo, exame, etc.) fica em outras peças.
 */
export class InteractionSystem {
  private readonly interactables: Interactable[] = [];

  register(interactable: Interactable): void {
    this.interactables.push(interactable);
  }

  unregister(id: string): void {
    const idx = this.interactables.findIndex((i) => i.id === id);
    if (idx !== -1) this.interactables.splice(idx, 1);
  }

  nearestInRange(playerX: number, playerY: number): Interactable | null {
    let best: Interactable | null = null;
    let bestDist = Infinity;
    for (const it of this.interactables) {
      if (!it.enabled()) continue;
      const dist = Math.hypot(it.x - playerX, it.y - playerY);
      if (dist <= it.radius && dist < bestDist) {
        best = it;
        bestDist = dist;
      }
    }
    return best;
  }
}
