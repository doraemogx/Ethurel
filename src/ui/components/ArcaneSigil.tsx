import type { ArcaneZone } from '@/arcane/zone';
import { arcaneResonance, type ArcaneIdentity } from '@/arcane/identity';

export interface ArcaneSigilProps {
  identity: ArcaneIdentity;
  zone: ArcaneZone;
  size?: number;
}

/**
 * Sigilo pessoal do personagem — nunca ilustração detalhada, sempre
 * geometria simples (spec Fase 2 §37: atmosfera, não desenho procedural
 * complexo). O motivo vem do tema de classe; a cor reage à zona Arcana.
 */
export function ArcaneSigil({ identity, zone, size = 40 }: ArcaneSigilProps) {
  const color = arcaneResonance(zone);
  const pulseClass = zone === 'ruptura' ? 'sigil--ruptura' : zone === 'saturacao' ? 'sigil--saturacao' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`arcane-sigil ${pulseClass}`.trim()}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1" />
      <SigilMark motif={identity.motif} color={color} />
    </svg>
  );
}

export function SigilMark({ motif, color }: { motif: ArcaneIdentity['motif']; color: string }) {
  switch (motif) {
    case 'ash':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none">
          <path d="M20 8 L23 20 L20 32 L17 20 Z" />
          <circle cx="20" cy="20" r="2" fill={color} stroke="none" />
        </g>
      );
    case 'thread':
      return (
        <g stroke={color} strokeWidth="1.2" fill="none">
          <path d="M9 14 Q20 10 31 14" />
          <path d="M9 20 Q20 24 31 20" />
          <path d="M9 26 Q20 22 31 26" />
        </g>
      );
    case 'trail':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none">
          <path d="M10 30 L18 20 L14 16 L26 10" />
          <circle cx="26" cy="10" r="1.6" fill={color} stroke="none" />
        </g>
      );
    case 'shadow':
      return (
        <g fill={color} fillOpacity="0.55" stroke="none">
          <path d="M20 8 A12 12 0 1 0 20 32 A9 9 0 1 1 20 8 Z" />
        </g>
      );
    case 'stone':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none">
          <path d="M20 9 L30 16 L26 29 L14 29 L10 16 Z" />
        </g>
      );
    case 'moss':
      return (
        <g stroke={color} strokeWidth="1.3" fill="none">
          <path d="M20 30 C20 22 14 20 14 13" />
          <path d="M20 30 C20 22 26 20 26 13" />
          <circle cx="14" cy="12" r="1.4" fill={color} stroke="none" />
          <circle cx="26" cy="12" r="1.4" fill={color} stroke="none" />
          <circle cx="20" cy="9" r="1.4" fill={color} stroke="none" />
        </g>
      );
    case 'sigil':
      return (
        <g stroke={color} strokeWidth="1.2" fill="none">
          <circle cx="20" cy="20" r="8" />
          <path d="M20 12 L20 28 M12 20 L28 20" />
        </g>
      );
    case 'bone':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M12 20 L28 14" />
          <path d="M12 20 L28 26" />
          <circle cx="12" cy="20" r="2" />
          <circle cx="28" cy="14" r="2" />
          <circle cx="28" cy="26" r="2" />
        </g>
      );
    default:
      return <circle cx="20" cy="20" r="4" fill={color} stroke="none" />;
  }
}
