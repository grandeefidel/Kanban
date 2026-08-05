"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";
import { Card } from "./Card";
import { AddCardForm } from "./AddCardForm";

export function Column({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
}: {
  column: ColumnType;
  cards: CardType[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);

  function commit() {
    const trimmed = draft.trim();
    onRename(column.id, trimmed || column.title);
    setDraft(trimmed || column.title);
    setEditing(false);
  }

  return (
    <section data-testid="column" data-column-title={column.title} className="flex w-72 shrink-0 flex-col">
      <header className="mb-2 flex items-center gap-2 px-1">
        <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(column.title);
                setEditing(false);
              }
            }}
            aria-label={`Rename column ${column.title}`}
            className="min-w-0 flex-1 rounded-md border border-primary/40 bg-surface px-1.5 py-0.5 text-sm font-bold text-navy outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(column.title);
              setEditing(true);
            }}
            className="flex-1 truncate text-left text-sm font-bold uppercase tracking-wide text-navy"
            title="Click to rename"
          >
            {column.title}
          </button>
        )}
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold text-gray-text">
          {cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        data-column-id={column.id}
        className={`column-scroll flex max-h-[calc(100vh-11rem)] flex-1 flex-col gap-2 overflow-y-auto rounded-2xl p-2 transition-colors ${
          isOver ? "bg-primary/10" : "bg-black/[0.03]"
        }`}
      >
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <p className="select-none px-2 py-3 text-center text-xs text-gray-text/70">
            Drop cards here
          </p>
        )}

        <AddCardForm onAdd={(title, details) => onAddCard(column.id, title, details)} />
      </div>
    </section>
  );
}
