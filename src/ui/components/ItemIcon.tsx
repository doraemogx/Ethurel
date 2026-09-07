import type { ItemIcon as ItemIconMotif } from '@/items/types';
import { IMG } from '@/ui/assetPath';

const ICON_SRC: Record<ItemIconMotif, string> = {
  ash: `${IMG}/icons/ash.webp`,
  thread: `${IMG}/icons/thread.webp`,
  trail: `${IMG}/icons/trail.webp`,
  shadow: `${IMG}/icons/shadow.webp`,
  stone: `${IMG}/icons/stone.webp`,
  moss: `${IMG}/icons/moss.webp`,
  sigil: `${IMG}/icons/sigil.webp`,
  bone: `${IMG}/icons/bone.webp`,
};

/** Ícone de item (Phase 3 §21) — recorte real do atlas do Pack #10 (OpenGameArt
 * RPG Icons Set, ver ASSET-CATALOG.md), um por motivo de item (os mesmos 8
 * motivos já usados por classe/partícula — reaproveita o vocabulário visual
 * existente em vez de inventar 21 ícones únicos para 21 itens). */
export function ItemIcon({ motif, size = 28, color = '#c9b6f0' }: { motif: ItemIconMotif; size?: number; color?: string }) {
  return (
    <div
      className="item-icon-frame"
      style={{ width: size, height: size, borderColor: `${color}55`, boxShadow: `0 0 10px ${color}22 inset` }}
    >
      <img src={ICON_SRC[motif]} alt="" width={size} height={size} loading="lazy" />
    </div>
  );
}
