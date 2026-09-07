/**
 * Emblema heráldico por ancestralidade (Rodada de Recuperação §6) — SVG
 * original, desenhado para comunicar CADA povo, não um ícone de item
 * genérico emprestado (ash/moss/trail/sigil do vocabulário de
 * classe/inventário, usado na fase anterior por falta de alternativa
 * melhor). Mesmo espírito minimalista do `ArcaneSigil` (geometria simples,
 * nunca ilustração procedural complexa) — mas com um desenho próprio por
 * povo, não reaproveitado de outro sistema.
 */
export interface AncestryEmblemProps {
  ancestryId: string;
  color: string;
  size?: number;
}

export function AncestryEmblem({ ancestryId, color, size = 120 }: AncestryEmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ overflow: 'visible' }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeOpacity="0.3" strokeWidth="1.2" />
      <EmblemMark ancestryId={ancestryId} color={color} />
    </svg>
  );
}

function EmblemMark({ ancestryId, color }: { ancestryId: string; color: string }) {
  switch (ancestryId) {
    case 'pedra-funda':
      // Montanha facetada partida por um veio — "rocha que lembra o calor
      // da formação do mundo", corpo que não entra em pânico perto de
      // Arcane instável.
      return (
        <g stroke={color} strokeWidth="2.2" strokeLinejoin="round" fill="none">
          <path d="M50 20 L78 68 L58 68 L50 56 L42 68 L22 68 Z" />
          <path d="M50 20 L54 42 L46 50 L52 68" strokeWidth="1.4" strokeOpacity="0.75" />
        </g>
      );
    case 'musgo-antigo':
      // Samambaia/veio de folha com pontos bioluminescentes — resposta da
      // pele perto de Arcane orgânica.
      return (
        <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M50 78 C50 60 50 46 50 26" />
          <path d="M50 62 C42 58 36 50 34 40" />
          <path d="M50 62 C58 58 64 50 66 40" />
          <path d="M50 46 C44 43 40 37 38 30" />
          <path d="M50 46 C56 43 60 37 62 30" />
          <circle cx="50" cy="24" r="2.6" fill={color} stroke="none" />
          <circle cx="34" cy="39" r="1.8" fill={color} stroke="none" opacity="0.85" />
          <circle cx="66" cy="39" r="1.8" fill={color} stroke="none" opacity="0.85" />
        </g>
      );
    case 'errantes-da-estrada':
      // Estrada que se bifurca e uma estrela de rumo — "nenhum lugar é
      // casa, toda estrada é".
      return (
        <g stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M50 80 L50 54" />
          <path d="M50 54 L30 24" />
          <path d="M50 54 L70 24" />
          <circle cx="50" cy="54" r="3" fill={color} stroke="none" />
          <path d="M30 24 L34 30 M30 24 L24 26" strokeWidth="1.6" opacity="0.8" />
          <path d="M70 24 L66 30 M70 24 L76 26" strokeWidth="1.6" opacity="0.8" />
        </g>
      );
    case 'marcados-do-selo':
      // Selo circular com uma fenda — "nasceram já ouvindo o que a Arcane
      // sussurra antes de ela agir", sensibilidade sutil, não poder.
      return (
        <g stroke={color} fill="none">
          <circle cx="50" cy="50" r="22" strokeWidth="2" />
          <circle cx="50" cy="50" r="12" strokeWidth="1.4" opacity="0.75" />
          <path d="M50 28 L50 20 M50 80 L50 72 M28 50 L20 50 M80 50 L72 50" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M62 38 L70 30" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default:
      return <circle cx="50" cy="50" r="6" fill={color} stroke="none" />;
  }
}
