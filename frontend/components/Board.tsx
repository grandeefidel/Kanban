"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useBoardStore } from "@/lib/store";
import { crossColumnMove, finalMove } from "@/lib/drag";
import { Column } from "./Column";
import { CardContent } from "./CardContent";

export function Board() {
  const columns = useBoardStore((s) => s.columns);
  const cards = useBoardStore((s) => s.cards);
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const addCard = useBoardStore((s) => s.addCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const moveCard = useBoardStore((s) => s.moveCard);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    const move = crossColumnMove(columns, String(active.id), over ? String(over.id) : null);
    if (move) moveCard(String(active.id), move.toColumnId, move.toIndex);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const move = finalMove(columns, String(active.id), over ? String(over.id) : null);
    if (move) moveCard(String(active.id), move.toColumnId, move.toIndex);
  }

  const activeCard = activeId ? cards[activeId] : null;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-black/5 bg-surface/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-accent" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight text-navy">Kanban Board</h1>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <main className="board-scroll flex flex-1 gap-4 overflow-x-auto px-6 py-6">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={column.cardIds.map((id) => cards[id])}
              onRename={renameColumn}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
            />
          ))}
        </main>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeCard ? <CardContent card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
