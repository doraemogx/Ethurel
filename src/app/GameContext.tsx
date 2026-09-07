import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SaveDataV6 } from '@/save/schema';
import { createEmptySaveV6 } from '@/save/schema';
import { loadSlot, scheduleSave, flushSave, forceSave, type SaveSlotId } from '@/save/gameSave';
import { narrativeEngine } from '@/narrative/NarrativeEngine';

interface GameContextValue {
  slot: SaveSlotId;
  save: SaveDataV6;
  /** Muta o save via um recipe (immer-like manual: recebe o rascunho,
   * modifica in place) e agenda gravação debounced. */
  update: (recipe: (draft: SaveDataV6) => void) => void;
  /** Como `update`, mas grava imediatamente — usar em eventos que não podem
   * se perder (fim de combate, decisão de quest). */
  updateAndPersist: (recipe: (draft: SaveDataV6) => void) => void;
  narrativeEngine: typeof narrativeEngine;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ slot, children }: { slot: SaveSlotId; children: ReactNode }) {
  const [save, setSave] = useState<SaveDataV6>(() => loadSlot(slot));
  const saveRef = useRef(save);
  saveRef.current = save;

  const update = useCallback(
    (recipe: (draft: SaveDataV6) => void) => {
      setSave((prev) => {
        const draft = structuredClone(prev);
        recipe(draft);
        scheduleSave(slot, draft);
        return draft;
      });
    },
    [slot]
  );

  const updateAndPersist = useCallback(
    (recipe: (draft: SaveDataV6) => void) => {
      setSave((prev) => {
        const draft = structuredClone(prev);
        recipe(draft);
        forceSave(slot, draft);
        return draft;
      });
    },
    [slot]
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave(slot, saveRef.current);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [slot]);

  return <GameContext.Provider value={{ slot, save, update, updateAndPersist, narrativeEngine }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame() usado fora de <GameProvider>.');
  return ctx;
}

export function emptySaveForPreview(): SaveDataV6 {
  return createEmptySaveV6();
}
