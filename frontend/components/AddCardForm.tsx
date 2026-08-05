"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function AddCardForm({
  onAdd,
}: {
  onAdd: (title: string, details: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function reset() {
    setTitle("");
    setDetails("");
    setOpen(false);
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, details.trim());
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-text transition hover:bg-black/5 hover:text-navy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a card
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-1 rounded-xl border border-primary/30 bg-surface p-2.5 shadow-sm"
      >
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          aria-label="Card title"
          className="w-full rounded-md bg-transparent px-1 py-1 text-sm font-semibold text-navy outline-none placeholder:text-gray-text/70"
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="Add more details..."
          aria-label="Card details"
          rows={2}
          className="mt-1 w-full resize-none rounded-md bg-transparent px-1 py-1 text-xs leading-relaxed text-gray-text outline-none placeholder:text-gray-text/70"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
          >
            Add card
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-text transition hover:text-navy"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
