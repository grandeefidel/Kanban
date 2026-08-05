"use client";

import type { HTMLAttributes } from "react";
import type { Card as CardType } from "@/lib/types";

export function CardContent({
  card,
  onDelete,
  dragHandleProps,
  overlay = false,
}: {
  card: CardType;
  onDelete?: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
  overlay?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-xl border border-black/5 bg-surface p-3.5 ${
        overlay
          ? "rotate-2 shadow-xl shadow-navy/20"
          : "shadow-sm transition-shadow hover:shadow-md"
      }`}
    >
      <div
        {...dragHandleProps}
        className="cursor-grab touch-none pr-6 active:cursor-grabbing"
      >
        <h3 className="text-sm font-semibold leading-snug text-navy">{card.title}</h3>
        {card.details && (
          <p className="mt-1 text-xs leading-relaxed text-gray-text">{card.details}</p>
        )}
      </div>

      {onDelete && (
        <button
          type="button"
          aria-label={`Delete card: ${card.title}`}
          onClick={() => onDelete(card.id)}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-gray-text opacity-0 transition hover:bg-black/5 hover:text-secondary focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
