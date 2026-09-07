import { useState } from 'react';
import type { SaveSlotId } from '@/save/gameSave';
import { TitleScreen } from '@/ui/screens/TitleScreen';
import { CampaignsScreen } from '@/ui/screens/CampaignsScreen';
import { SlotPickerScreen } from '@/ui/screens/SlotPickerScreen';
import { NewGameChoiceScreen } from '@/ui/screens/NewGameChoiceScreen';
import { CharacterCreationScreen } from '@/ui/screens/CharacterCreationScreen';
import { OriginCharacterScreen } from '@/ui/screens/OriginCharacterScreen';
import { SettingsScreen } from '@/ui/screens/SettingsScreen';
import { GameProvider } from '@/app/GameContext';
import { InGameApp } from '@/app/InGameApp';

export type PreGameView =
  | { name: 'title' }
  | { name: 'campaigns' }
  | { name: 'slotPicker'; mode: 'continue' | 'new' }
  | { name: 'newGameChoice'; slot: SaveSlotId }
  | { name: 'characterCreation'; slot: SaveSlotId }
  | { name: 'originPicker'; slot: SaveSlotId }
  | { name: 'settings' }
  | { name: 'game'; slot: SaveSlotId };

export function App() {
  const [view, setView] = useState<PreGameView>({ name: 'title' });

  if (view.name === 'game') {
    return (
      <GameProvider slot={view.slot}>
        <InGameApp onExitToTitle={() => setView({ name: 'title' })} />
      </GameProvider>
    );
  }

  switch (view.name) {
    case 'title':
      return (
        <TitleScreen
          onContinue={() => setView({ name: 'slotPicker', mode: 'continue' })}
          onNewGame={() => setView({ name: 'slotPicker', mode: 'new' })}
          onCampaigns={() => setView({ name: 'campaigns' })}
          onSettings={() => setView({ name: 'settings' })}
        />
      );
    case 'campaigns':
      return (
        <CampaignsScreen
          onBack={() => setView({ name: 'title' })}
          onPlay={() => setView({ name: 'slotPicker', mode: 'new' })}
        />
      );
    case 'slotPicker':
      return (
        <SlotPickerScreen
          mode={view.mode}
          onBack={() => setView({ name: 'title' })}
          onPickContinue={(slot) => setView({ name: 'game', slot })}
          onPickNew={(slot) => setView({ name: 'newGameChoice', slot })}
        />
      );
    case 'newGameChoice':
      return (
        <NewGameChoiceScreen
          onBack={() => setView({ name: 'slotPicker', mode: 'new' })}
          onCustom={() => setView({ name: 'characterCreation', slot: view.slot })}
          onOrigin={() => setView({ name: 'originPicker', slot: view.slot })}
        />
      );
    case 'characterCreation':
      return (
        <CharacterCreationScreen
          slot={view.slot}
          onBack={() => setView({ name: 'newGameChoice', slot: view.slot })}
          onDone={() => setView({ name: 'game', slot: view.slot })}
        />
      );
    case 'originPicker':
      return (
        <OriginCharacterScreen
          slot={view.slot}
          onBack={() => setView({ name: 'newGameChoice', slot: view.slot })}
          onDone={() => setView({ name: 'game', slot: view.slot })}
        />
      );
    case 'settings':
      return <SettingsScreen onBack={() => setView({ name: 'title' })} />;
  }
}
