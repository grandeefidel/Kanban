import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Card } from "./Card";

const card = { id: "c1", title: "Draggable card", details: "With details" };

function renderCard() {
  return render(
    <DndContext>
      <SortableContext items={[card.id]}>
        <Card card={card} onDelete={vi.fn()} />
      </SortableContext>
    </DndContext>
  );
}

describe("Card", () => {
  it("renders its content", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: "Draggable card" })).toBeInTheDocument();
    expect(screen.getByText("With details")).toBeInTheDocument();
  });

  it("exposes the test hooks the e2e specs select on", () => {
    renderCard();
    const el = screen.getByTestId("card");
    expect(el).toHaveAttribute("data-card-title", "Draggable card");
  });

  it("is not dimmed when it is not being dragged", () => {
    renderCard();
    expect(screen.getByTestId("card").className).not.toContain("opacity-40");
  });
});
