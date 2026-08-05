import { describe, expect, it } from "vitest";
import { columnIdOf, indexInColumn, crossColumnMove, finalMove } from "./drag";
import type { Column } from "./types";

const columns: Column[] = [
  { id: "col-0", title: "Backlog", cardIds: ["a1", "a2", "a3"] },
  { id: "col-1", title: "To Do", cardIds: ["b1", "b2"] },
  { id: "col-2", title: "Done", cardIds: [] },
];

describe("columnIdOf", () => {
  it("returns the id itself when it is a column", () => {
    expect(columnIdOf(columns, "col-1")).toBe("col-1");
  });

  it("returns the owning column when it is a card", () => {
    expect(columnIdOf(columns, "b2")).toBe("col-1");
  });

  it("returns undefined for an unknown id", () => {
    expect(columnIdOf(columns, "nope")).toBeUndefined();
  });
});

describe("indexInColumn", () => {
  it("appends when dropping on the column itself", () => {
    expect(indexInColumn(columns, "col-0", "col-0")).toBe(3);
  });

  it("returns the position of the card being dropped onto", () => {
    expect(indexInColumn(columns, "col-0", "a2")).toBe(1);
  });

  it("appends when the card is not in that column", () => {
    expect(indexInColumn(columns, "col-1", "a1")).toBe(2);
  });

  it("returns 0 for an unknown column", () => {
    expect(indexInColumn(columns, "missing", "a1")).toBe(0);
  });

  it("appends into an empty column", () => {
    expect(indexInColumn(columns, "col-2", "col-2")).toBe(0);
  });
});

describe("crossColumnMove", () => {
  it("moves onto the hovered card in another column", () => {
    expect(crossColumnMove(columns, "a1", "b2")).toEqual({ toColumnId: "col-1", toIndex: 1 });
  });

  it("appends when hovering an empty column", () => {
    expect(crossColumnMove(columns, "a1", "col-2")).toEqual({ toColumnId: "col-2", toIndex: 0 });
  });

  it("does nothing within the same column", () => {
    expect(crossColumnMove(columns, "a1", "a3")).toBeNull();
  });

  it("does nothing when there is nothing underneath", () => {
    expect(crossColumnMove(columns, "a1", null)).toBeNull();
  });

  it("does nothing for an unknown target", () => {
    expect(crossColumnMove(columns, "a1", "ghost")).toBeNull();
  });

  it("does nothing for an unknown card being dragged", () => {
    expect(crossColumnMove(columns, "ghost", "b1")).toBeNull();
  });
});

describe("finalMove", () => {
  it("reorders within the same column", () => {
    expect(finalMove(columns, "a3", "a1")).toEqual({ toColumnId: "col-0", toIndex: 0 });
  });

  it("moves across columns", () => {
    expect(finalMove(columns, "a1", "b1")).toEqual({ toColumnId: "col-1", toIndex: 0 });
  });

  it("does nothing when dropped outside any column", () => {
    expect(finalMove(columns, "a1", null)).toBeNull();
    expect(finalMove(columns, "a1", "ghost")).toBeNull();
  });
});
