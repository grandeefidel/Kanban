import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardContent } from "./CardContent";

const card = { id: "c1", title: "Write the spec", details: "Two pages, no more." };

describe("CardContent", () => {
  it("renders the title and details", () => {
    render(<CardContent card={card} />);
    expect(screen.getByRole("heading", { name: "Write the spec" })).toBeInTheDocument();
    expect(screen.getByText("Two pages, no more.")).toBeInTheDocument();
  });

  it("omits the details paragraph when details are empty", () => {
    render(<CardContent card={{ ...card, details: "" }} />);
    expect(screen.queryByText("Two pages, no more.")).not.toBeInTheDocument();
  });

  it("renders no delete button when onDelete is not given", () => {
    render(<CardContent card={card} />);
    expect(screen.queryByRole("button", { name: /Delete card/ })).not.toBeInTheDocument();
  });

  it("calls onDelete with the card id", async () => {
    const onDelete = vi.fn();
    render(<CardContent card={card} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card: Write the spec" }));
    expect(onDelete).toHaveBeenCalledWith("c1");
  });

  it("applies the overlay styling when dragging", () => {
    const { container } = render(<CardContent card={card} overlay />);
    expect(container.firstElementChild?.className).toContain("rotate-2");
  });
});
