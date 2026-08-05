import { beforeEach, describe, expect, it } from "vitest";
import { useBoardStore, findColumnByCard } from "./store";
import { createSeedBoard } from "./seed";

const get = () => useBoardStore.getState();

beforeEach(() => {
  // Merge-setState resets the data but keeps the action functions.
  useBoardStore.setState(createSeedBoard());
});

describe("seed board", () => {
  it("has five columns", () => {
    expect(get().columns).toHaveLength(5);
  });

  it("every card id maps to a card", () => {
    const { columns, cards } = get();
    const allIds = columns.flatMap((c) => c.cardIds);
    for (const id of allIds) {
      expect(cards[id]).toBeDefined();
    }
  });
});

describe("renameColumn", () => {
  it("renames the target column only", () => {
    const target = get().columns[1];
    get().renameColumn(target.id, "Renamed");
    expect(get().columns[1].title).toBe("Renamed");
    expect(get().columns[0].title).toBe("Backlog");
  });
});

describe("addCard", () => {
  it("appends a new card to the column", () => {
    const col = get().columns[0];
    const before = col.cardIds.length;
    get().addCard(col.id, "New task", "Some details");
    const after = get().columns[0];
    expect(after.cardIds).toHaveLength(before + 1);
    const newId = after.cardIds[after.cardIds.length - 1];
    expect(get().cards[newId]).toMatchObject({ title: "New task", details: "Some details" });
  });
});

describe("deleteCard", () => {
  it("removes the card from its column and the card map", () => {
    const col = get().columns[0];
    const cardId = col.cardIds[0];
    get().deleteCard(cardId);
    expect(get().columns[0].cardIds).not.toContain(cardId);
    expect(get().cards[cardId]).toBeUndefined();
  });
});

describe("moveCard", () => {
  it("moves a card across columns at the given index", () => {
    const [source, dest] = get().columns;
    const cardId = source.cardIds[0];
    get().moveCard(cardId, dest.id, 0);
    expect(get().columns[0].cardIds).not.toContain(cardId);
    expect(get().columns[1].cardIds[0]).toBe(cardId);
  });

  it("reorders within the same column", () => {
    const col = get().columns[0];
    const [first, second] = col.cardIds;
    get().moveCard(first, col.id, 1);
    const ids = get().columns[0].cardIds;
    expect(ids[0]).toBe(second);
    expect(ids[1]).toBe(first);
  });

  it("appends when the index exceeds the column length", () => {
    const [source, dest] = get().columns;
    const cardId = source.cardIds[0];
    get().moveCard(cardId, dest.id, 999);
    const ids = get().columns[1].cardIds;
    expect(ids[ids.length - 1]).toBe(cardId);
  });

  it("does nothing for an unknown card", () => {
    const before = get().columns.map((c) => c.cardIds);
    get().moveCard("does-not-exist", get().columns[0].id, 0);
    expect(get().columns.map((c) => c.cardIds)).toEqual(before);
  });
});

describe("findColumnByCard", () => {
  it("finds the owning column", () => {
    const col = get().columns[2];
    const cardId = col.cardIds[0];
    expect(findColumnByCard(get().columns, cardId)?.id).toBe(col.id);
  });
});
