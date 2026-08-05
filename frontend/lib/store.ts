import { create } from "zustand";
import type { Board, Column } from "./types";
import { createSeedBoard } from "./seed";

function newId(): string {
  return crypto.randomUUID();
}

export function findColumnByCard(columns: Column[], cardId: string): Column | undefined {
  return columns.find((col) => col.cardIds.includes(cardId));
}

export type BoardStore = Board & {
  renameColumn: (columnId: string, title: string) => void;
  addCard: (columnId: string, title: string, details: string) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;
};

export const useBoardStore = create<BoardStore>((set) => ({
  ...createSeedBoard(),

  renameColumn: (columnId, title) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === columnId ? { ...col, title } : col
      ),
    })),

  addCard: (columnId, title, details) =>
    set((state) => {
      const id = newId();
      return {
        cards: { ...state.cards, [id]: { id, title, details } },
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, cardIds: [...col.cardIds, id] } : col
        ),
      };
    }),

  deleteCard: (cardId) =>
    set((state) => {
      const cards = { ...state.cards };
      delete cards[cardId];
      return {
        cards,
        columns: state.columns.map((col) =>
          col.cardIds.includes(cardId)
            ? { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) }
            : col
        ),
      };
    }),

  moveCard: (cardId, toColumnId, toIndex) =>
    set((state) => {
      const from = findColumnByCard(state.columns, cardId);
      if (!from) return state;

      const columns = state.columns.map((col) => {
        if (col.id === from.id) {
          return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
        }
        return col;
      });

      const target = columns.find((col) => col.id === toColumnId);
      if (!target) return state;

      const clampedIndex = Math.max(0, Math.min(toIndex, target.cardIds.length));
      const nextCardIds = [...target.cardIds];
      nextCardIds.splice(clampedIndex, 0, cardId);

      return {
        columns: columns.map((col) =>
          col.id === toColumnId ? { ...col, cardIds: nextCardIds } : col
        ),
      };
    }),
}));
