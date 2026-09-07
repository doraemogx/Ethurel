import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { IMG } from '@/ui/assetPath';

export interface CampaignsScreenProps {
  onBack: () => void;
  onPlay: () => void;
}

/**
 * Campanhas (Phase 3 §5) — Ethurel tem exatamente UMA campanha jogável nesta
 * fatia vertical (spec §29: fatia vertical, não campanha completa). Esta
 * tela existe para dar contexto antes de "Novo Jogo", não para fingir que
 * há mais conteúdo do que existe — o aviso "em breve" é literal, não um
 * placeholder decorativo escondendo ausência de conteúdo.
 */
export function CampaignsScreen({ onBack, onPlay }: CampaignsScreenProps) {
  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('village')} backgroundImage={`${IMG}/backgrounds/varreth-tavern.webp`} />
      <div className="screen__content">
        <h2 className="map-title" style={{ marginBottom: 16 }}>Campanhas</h2>
        <div className="creation-detail-panel" style={{ marginBottom: 10 }}>
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>Capítulo 1 — O que a raiz sussurrou</p>
          <p style={{ margin: 0, color: 'var(--text-dim)' }}>
            Varreth, na Borda dos Musgos. Uma raiz rompeu perto da clareira leste — nada cresce direito por perto, e os
            bichos evitam o lugar. Escolha quem você é e descubra o que aconteceu.
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center', margin: '4px 0 0' }}>
          Mais campanhas, em breve.
        </p>
        <div className="stack" style={{ marginTop: 'auto', paddingTop: 16 }}>
          <MysticButton variant="primary" onClick={onPlay}>Jogar este capítulo</MysticButton>
          <MysticButton variant="ghost" onClick={onBack}>Voltar</MysticButton>
        </div>
      </div>
    </div>
  );
}
