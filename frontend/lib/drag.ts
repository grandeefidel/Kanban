import type { Column } from "./types";
import { findColumnByCard } from "./store";

export type Move = { toColumnId: string; toIndex: number };

/** dnd-kit reports the thing under the cursor, which is either a column or a card. */
export function columnIdOf(columns: Column[], id: string): string | undefined {
  if (columns.some((c) => c.id === id)) return id;
  return findColumnByCard(columns, id)?.id;
}

/** Where a drop onto `overId` lands within `columnId`. Dropping on the column itself appends. */
export function indexInColumn(columns: Column[], columnId: string, overId: string): number {
  const column = columns.find((c) => c.id === columnId);
  if (!column) return 0;
  if (overId === columnId) return column.cardIds.length;
  const idx = column.cardIds.indexOf(overId);
  return idx === -1 ? column.cardIds.length : idx;
}

/** During a drag, the card follows the cursor only when it crosses into another column. */
export function crossColumnMove(
  columns: Column[],
  activeId: string,
  overId: string | null
): Move | null {
  if (!overId) return null;
  const from = columnIdOf(columns, activeId);
  const to = columnIdOf(columns, overId);
  if (!from || !to || from === to) return null;
  return { toColumnId: to, toIndex: indexInColumn(columns, to, overId) };
}

/** On drop, the card moves wherever it landed, including reordering within its own column. */
export function finalMove(
  columns: Column[],
  activeId: string,
  overId: string | null
): Move | null {
  if (!overId) return null;
  const to = columnIdOf(columns, overId);
  if (!to) return null;
  return { toColumnId: to, toIndex: indexInColumn(columns, to, overId) };
}
