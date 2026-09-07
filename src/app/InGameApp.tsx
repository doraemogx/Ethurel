import { useState } from 'react';
import { BottomNav, type InGameTab } from '@/ui/components/BottomNav';
import { SceneScreen } from '@/ui/screens/SceneScreen';
import { MapScreen } from '@/ui/screens/MapScreen';
import { CharacterScreen } from '@/ui/screens/CharacterScreen';
import { useGame } from '@/app/GameContext';

export interface InGameAppProps {
  onExitToTitle: () => void;
}

/** Casca do jogo em si (spec §24): cena/mapa/personagem por baixo, barra
 * inferior fixa por cima — nunca o inverso. Cada aba é sua própria
 * `.screen` (fundo/vinheta próprios); isto só empilha e comuta. */
export function InGameApp({ onExitToTitle }: InGameAppProps) {
  const { save } = useGame();
  const [tab, setTab] = useState<InGameTab>('scene');

  if (!save.character) {
    // Guarda defensiva: nunca deveria acontecer (só se chega aqui após
    // criação/seleção de personagem), mas evita uma tela em branco confusa.
    onExitToTitle();
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {tab === 'scene' && <SceneScreen />}
        {tab === 'map' && <MapScreen />}
        {tab === 'character' && <CharacterScreen />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
