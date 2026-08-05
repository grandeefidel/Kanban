import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCardForm } from "./AddCardForm";

async function openForm() {
  await userEvent.click(screen.getByRole("button", { name: "Add a card" }));
}

describe("AddCardForm", () => {
  it("starts collapsed", () => {
    render(<AddCardForm onAdd={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add a card" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Card title")).not.toBeInTheDocument();
  });

  it("opens the form when the trigger is clicked", async () => {
    render(<AddCardForm onAdd={vi.fn()} />);
    await openForm();
    expect(screen.getByLabelText("Card title")).toBeInTheDocument();
    expect(screen.getByLabelText("Card details")).toBeInTheDocument();
  });

  it("submits the trimmed title and details, then collapses", async () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);
    await openForm();
    await userEvent.type(screen.getByLabelText("Card title"), "  Ship it  ");
    await userEvent.type(screen.getByLabelText("Card details"), "  Today  ");
    await userEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).toHaveBeenCalledWith("Ship it", "Today");
    expect(screen.getByRole("button", { name: "Add a card" })).toBeInTheDocument();
  });

  it("ignores a blank title", async () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);
    await openForm();
    await userEvent.type(screen.getByLabelText("Card title"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Card title")).toBeInTheDocument();
  });

  it("submits on meta+enter from the details field", async () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);
    await openForm();
    await userEvent.type(screen.getByLabelText("Card title"), "Quick add");
    await userEvent.type(screen.getByLabelText("Card details"), "{Meta>}{Enter}{/Meta}");

    expect(onAdd).toHaveBeenCalledWith("Quick add", "");
  });

  it("clears and collapses on cancel", async () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);
    await openForm();
    await userEvent.type(screen.getByLabelText("Card title"), "Discard me");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onAdd).not.toHaveBeenCalled();
    await openForm();
    expect(screen.getByLabelText("Card title")).toHaveValue("");
  });
});
