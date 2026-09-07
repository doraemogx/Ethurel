import type { ItemIcon as ItemIconMotif } from '@/items/types';

const ICON_SRC: Record<ItemIconMotif, string> = {
  ash: '/assets/img/icons/ash.webp',
  thread: '/assets/img/icons/thread.webp',
  trail: '/assets/img/icons/trail.webp',
  shadow: '/assets/img/icons/shadow.webp',
  stone: '/assets/img/icons/stone.webp',
  moss: '/assets/img/icons/moss.webp',
  sigil: '/assets/img/icons/sigil.webp',
  bone: '/assets/img/icons/bone.webp',
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
