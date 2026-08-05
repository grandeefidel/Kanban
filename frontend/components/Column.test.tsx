import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { Column } from "./Column";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";

const cards: CardType[] = [
  { id: "c1", title: "First", details: "" },
  { id: "c2", title: "Second", details: "" },
];

const column: ColumnType = { id: "col-0", title: "Backlog", cardIds: ["c1", "c2"] };

function renderColumn(overrides: Partial<Parameters<typeof Column>[0]> = {}) {
  const props = {
    column,
    cards,
    onRename: vi.fn(),
    onAddCard: vi.fn(),
    onDeleteCard: vi.fn(),
    ...overrides,
  };
  render(
    <DndContext>
      <Column {...props} />
    </DndContext>
  );
  return props;
}

describe("Column", () => {
  it("renders the title, its cards and the card count", () => {
    renderColumn();
    expect(screen.getByRole("button", { name: "Backlog" })).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows the empty state when there are no cards", () => {
    renderColumn({ column: { ...column, cardIds: [] }, cards: [] });
    expect(screen.getByText("Drop cards here")).toBeInTheDocument();
  });

  it("commits a rename on Enter", async () => {
    const { onRename } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Rename column Backlog");
    await userEvent.clear(input);
    await userEvent.type(input, "Icebox{Enter}");
    expect(onRename).toHaveBeenCalledWith("col-0", "Icebox");
  });

  it("commits a rename on blur", async () => {
    const { onRename } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Rename column Backlog");
    await userEvent.clear(input);
    await userEvent.type(input, "Later");
    await userEvent.tab();
    expect(onRename).toHaveBeenCalledWith("col-0", "Later");
  });

  it("reverts on Escape without renaming", async () => {
    const { onRename } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Rename column Backlog");
    await userEvent.clear(input);
    await userEvent.type(input, "Throwaway{Escape}");
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Backlog" })).toBeInTheDocument();
  });

  it("falls back to the old title when the new one is blank", async () => {
    const { onRename } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Rename column Backlog");
    await userEvent.clear(input);
    await userEvent.type(input, "   {Enter}");
    expect(onRename).toHaveBeenCalledWith("col-0", "Backlog");
  });

  it("adds a card scoped to this column", async () => {
    const { onAddCard } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Add a card" }));
    await userEvent.type(screen.getByLabelText("Card title"), "New one");
    await userEvent.click(screen.getByRole("button", { name: "Add card" }));
    expect(onAddCard).toHaveBeenCalledWith("col-0", "New one", "");
  });

  it("deletes a card by id", async () => {
    const { onDeleteCard } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "Delete card: First" }));
    expect(onDeleteCard).toHaveBeenCalledWith("c1");
  });
});
