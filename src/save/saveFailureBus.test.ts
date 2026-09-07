import { describe, it, expect, vi } from 'vitest';
import { emitSaveFailure, subscribeSaveFailure } from '@/save/saveFailureBus';

describe('saveFailureBus', () => {
  it('notifica assinantes quando uma falha é emitida', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSaveFailure(listener);
    emitSaveFailure({ slot: 'slot1', timestamp: 123 });
    expect(listener).toHaveBeenCalledWith({ slot: 'slot1', timestamp: 123 });
    unsubscribe();
  });

  it('emitir null limpa o aviso (sucesso depois de falha)', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSaveFailure(listener);
    emitSaveFailure({ slot: 'slot1', timestamp: 1 });
    emitSaveFailure(null);
    expect(listener).toHaveBeenLastCalledWith(null);
    unsubscribe();
  });

  it('unsubscribe realmente para de notificar', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSaveFailure(listener);
    unsubscribe();
    emitSaveFailure({ slot: 'slot1', timestamp: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('múltiplos assinantes recebem o mesmo evento', () => {
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = subscribeSaveFailure(a);
    const unsubB = subscribeSaveFailure(b);
    emitSaveFailure({ slot: 'slot2', timestamp: 5 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    unsubA();
    unsubB();
  });
});
