import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardApp } from "./BoardApp";

describe("BoardApp", () => {
  it("lazy-loads the board on the client", async () => {
    render(<BoardApp />);
    expect(
      await screen.findByRole("heading", { name: "Kanban Board", level: 1 })
    ).toBeInTheDocument();
  });
});
