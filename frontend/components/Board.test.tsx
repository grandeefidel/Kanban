import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "./Board";
import { useBoardStore } from "@/lib/store";
import { createSeedBoard } from "@/lib/seed";

beforeEach(() => {
  useBoardStore.setState(createSeedBoard());
});

describe("Board", () => {
  it("renders the heading and the five seeded columns", () => {
    render(<Board />);
    expect(screen.getByRole("heading", { name: "Kanban Board", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByTestId("column")).toHaveLength(5);
  });

  it("renders every seeded card", () => {
    render(<Board />);
    const cardCount = useBoardStore.getState().columns.flatMap((c) => c.cardIds).length;
    expect(screen.getAllByTestId("card")).toHaveLength(cardCount);
  });

  it("adds a card through the store", async () => {
    render(<Board />);
    const backlog = screen.getByText("Backlog").closest("section")!;
    await userEvent.click(within(backlog).getByRole("button", { name: "Add a card" }));
    await userEvent.type(within(backlog).getByLabelText("Card title"), "Fresh task");
    await userEvent.click(within(backlog).getByRole("button", { name: "Add card" }));

    expect(screen.getByText("Fresh task")).toBeInTheDocument();
    const titles = Object.values(useBoardStore.getState().cards).map((c) => c.title);
    expect(titles).toContain("Fresh task");
  });

  it("deletes a card through the store", async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card: Set up analytics" }));

    expect(screen.queryByText("Set up analytics")).not.toBeInTheDocument();
    const titles = Object.values(useBoardStore.getState().cards).map((c) => c.title);
    expect(titles).not.toContain("Set up analytics");
  });

  it("renames a column through the store", async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole("button", { name: "Review" }));
    const input = screen.getByLabelText("Rename column Review");
    await userEvent.clear(input);
    await userEvent.type(input, "QA{Enter}");

    expect(useBoardStore.getState().columns[3].title).toBe("QA");
  });
});
