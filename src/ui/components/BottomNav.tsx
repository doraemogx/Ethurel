export type InGameTab = 'scene' | 'map' | 'journal' | 'character';

export interface BottomNavProps {
  active: InGameTab;
  onChange: (tab: InGameTab) => void;
}

const TABS: { id: InGameTab; label: string }[] = [
  { id: 'scene', label: 'Cena' },
  { id: 'map', label: 'Mapa' },
  { id: 'journal', label: 'Diário' },
  { id: 'character', label: 'Personagem' },
];

/** Barra inferior fixa (spec §24) — nunca some, nunca cobre o teclado ao
 * digitar "Outra ação..." (a área de texto fica acima dela na SceneScreen). */
export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid rgba(216,211,230,0.15)',
        background: 'rgba(11,10,22,0.85)',
        backdropFilter: 'blur(6px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 4px',
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: active === tab.id ? 'var(--accent-soft)' : 'var(--text-dim)',
            borderTop: active === tab.id ? '2px solid var(--accent-soft)' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
