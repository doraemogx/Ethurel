/**
 * Itens estruturados (docs/design/03-GAMEPLAY-E-COMBATE.md §5). A arquitetura é
 * extensível, mas a implementação da vertical slice fica deliberadamente pequena
 * (6-10 itens reais) — conteúdo populado na Fase 4, junto com inventário/equipamento.
 * Fase 1 entrega só o tipo (`src/items/types.ts`) e este array vazio e tipado.
 */
import type { Item } from '@/items/types';

export const ITEMS: Item[] = [];
