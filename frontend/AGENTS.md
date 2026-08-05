<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend

Next.js 16.2.11 / React 19.2.4 / Tailwind v4 / TypeScript. Currently a frontend-only Kanban demo with all state in memory — no backend, no persistence. Everything below describes the starting point, which later parts of `docs/PLAN.md` replace with API-backed state.

## Layout

```
app/          layout.tsx (Geist fonts, metadata), page.tsx (renders BoardApp), globals.css
components/   Board, BoardApp, Column, Card, CardContent, AddCardForm
lib/          types.ts, store.ts (zustand), seed.ts, store.test.ts
tests/        board.spec.ts (Playwright)
```

## State

`lib/store.ts` is a single zustand store holding the whole board. Shape is in `lib/types.ts`:

- `Board` = `{ columns: Column[], cards: Record<string, Card> }`
- `Column` = `{ id, title, cardIds: string[] }` — cards are referenced by id, not nested
- `Card` = `{ id, title, details }`

The normalised shape matters: a card's column membership lives in that column's `cardIds`, so moving a card means splicing two arrays, never mutating the card. `findColumnByCard` is the lookup helper.

Actions: `renameColumn`, `addCard`, `deleteCard`, `moveCard`. **There is no card-edit action** — the "cards can be edited" requirement is unbuilt, not merely unwired.

`lib/seed.ts` creates 5 columns (Backlog, To Do, In Progress, Review, Done) with deterministic ids (`col-0`, `seed-0-1`) so tests can assert against them. New cards get `crypto.randomUUID()`. Columns are fixed — there is deliberately no add/delete-column action.

## Components

`BoardApp` loads `Board` via `next/dynamic` with `ssr: false`, because dnd-kit needs the DOM. `Board` owns the `DndContext` and the drag handlers; `Column` is a droppable, `Card` is a sortable, and `CardContent` is the presentational card shared between the list and the `DragOverlay`.

Drag calls `moveCard` from both `onDragOver` (cross-column, so the card follows the cursor live) and `onDragEnd` (final placement). Keyboard drag works via `KeyboardSensor`.

Column rename is inline-edit on click: Enter or blur commits, Escape reverts, empty falls back to the old title.

## Test hooks

Components carry attributes that the Playwright specs select on — keep them when editing markup:
`data-testid="column"`, `data-column-title`, `data-column-id`, `data-testid="card"`, `data-card-title`.

## Styling

Tailwind v4 (`@theme` in `globals.css`, no `tailwind.config.js`). Semantic colour tokens map to the project palette in the root `CLAUDE.md` — use `accent`, `primary`, `secondary`, `navy`, `gray-text`, `surface` rather than hex values.

## Commands

```
npm run dev        npm run build       npm run lint
npm test           vitest run (jsdom, setup in vitest.setup.ts)
npm run test:e2e   playwright, boots its own dev server on :3000
```

Vitest only collects `lib/**/*.test.{ts,tsx}` and `components/**/*.test.{ts,tsx}`. The project requires 80% unit coverage — see `docs/PLAN.md`.
