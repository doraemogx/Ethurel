import { SigilMark } from '@/ui/components/ArcaneSigil';
import type { ItemIcon as ItemIconMotif } from '@/items/types';

export function ItemIcon({ motif, size = 28, color = '#c9b6f0' }: { motif: ItemIconMotif; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="18" fill="rgba(216,211,230,0.06)" stroke="rgba(216,211,230,0.2)" strokeWidth="1" />
      <SigilMark motif={motif} color={color} />
    </svg>
  );
}
