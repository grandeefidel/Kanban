# Project Plan

Kanban project management MVP. Read `CLAUDE.md` in the project root for business requirements, technical decisions, colour scheme and coding standards. Read `frontend/AGENTS.md` before touching frontend code.

Work proceeds part by part. Do not start a part until the previous one meets its success criteria.

## Decisions

Settled with the user before planning:

| Question | Decision |
|---|---|
| Database shape | Normalised SQLite tables (users, boards, columns, cards, chat messages). The proposed schema is also written to `docs/schema.json` for Part 5 sign-off. |
| AI board updates | The AI returns the **whole board** in its structured output, not a list of operations. Backend validates and replaces. |
| Chat history | Persisted in the database. Survives reload and container restart. |
| Login | Credentials are `user` / `password`, but authentication runs against a seeded row in the `users` table with a hashed password — not a string comparison. The schema supports multiple users. |
| Session | HTTP-only session cookie issued by FastAPI. No Next.js middleware (static export rules it out). |
| Docker | One image, multi-stage: Node stage builds the static frontend, Python stage runs FastAPI with `uv` and serves the build. |
| Frontend build | Next.js static export (`output: "export"`). No SSR, no server components, no route handlers. |
| Test coverage | **Minimum 80% unit coverage, enforced, on both frontend and backend.** |

## Standing requirements

These apply to every part, not just the ones that name them.

- [ ] Unit test coverage stays at or above 80% — `vitest --coverage` (v8 provider, `thresholds.lines: 80`) and `pytest --cov` (`fail_under = 80`). A part is not done if coverage has dropped below the gate.
- [ ] No emojis anywhere in code, docs, comments or commit messages.
- [ ] Simplest thing that works. No speculative abstraction, no defensive programming for conditions that cannot occur.
- [ ] When something breaks, find the root cause and prove it with evidence before changing code. Do not guess.
- [ ] Commit at the end of each part with a message naming the part.

---

## Part 1: Plan

**Goal:** an approved, detailed plan and accurate frontend documentation.

- [x] Enrich this document with substeps, tests and success criteria per part
- [x] Write `frontend/AGENTS.md` describing the existing frontend code (`frontend/CLAUDE.md` imports it)
- [x] Record the decisions above
- [x] **Gate: user reviews and approves this plan before Part 2 begins** — approved

**Success criteria:** the user has explicitly approved the plan. Met.

---

## Part 2: Scaffolding

**Goal:** a Docker container that starts, serves a static hello-world page at `/`, and answers an API call. No Kanban yet.

- [x] `backend/` — FastAPI app with `uv` (`pyproject.toml`, `uv.lock`), `app/main.py`
- [x] `GET /api/health` returning `{"status": "ok"}`
- [x] Static mount at `/` serving a placeholder `index.html` that fetches `/api/health` and displays the result
- [x] `Dockerfile` — `uv` on Python 3.14, non-root `app` user, `EXPOSE 8000`
- [x] `.dockerignore` (excludes `node_modules`, `.next`, `.git`, `.env`)
- [x] Named volume `kanban-data` mounted at `/data` so the SQLite file survives `docker rm`
- [x] `.env` passed with `--env-file`, never baked into the image
- [x] `scripts/start.sh`, `scripts/stop.sh` (Mac/Linux) and `scripts/start.ps1`, `scripts/stop.ps1` (Windows) — build, run, report the URL, stop and remove cleanly
- [x] `pytest` + `pytest-cov` wired up, coverage gate at 80%

**Running the backend tests:** the host has no `uv`, and `uv` is a container-side tool by decision, so tests run in a dedicated image stage:

```
docker build --target test -t kanban-test . && docker run --rm kanban-test
```

**Tests:** backend unit tests for `/api/health` and for `/` serving the static page; start script brings the container up and `curl localhost:8000/api/health` succeeds; stop script leaves no container and correctly reports the not-running case.

**Success criteria:** on a clean machine, `scripts/start.sh` produces a working page at `http://localhost:8000` showing the health-check result. `pytest` passes at >=80% coverage. **Met** — 2 tests pass at 100% coverage; container runs as `app`; `OPENROUTER_API_KEY` reaches the container from `.env`.

---

## Part 3: Add in Frontend

**Goal:** the existing demo Kanban board served from the container at `/`.

- [ ] Set `output: "export"` in `next.config.ts`, plus `images.unoptimized` if needed
- [ ] Confirm the board still works as a static export — `BoardApp` already uses `dynamic(..., { ssr: false })`
- [ ] Add the Node build stage to the Dockerfile, copy `out/` into the Python stage
- [ ] FastAPI serves `out/` at `/`, with API routes registered **before** the catch-all static mount
- [ ] Add `@vitest/coverage-v8` and the 80% threshold to `vitest.config.ts`
- [ ] Backfill unit tests to reach 80%: `lib/store.ts` (all four actions, `findColumnByCard`, index clamping), `Column` rename commit/revert/empty-title, `AddCardForm` submit/cancel/blank-title, `CardContent` render and delete
- [ ] Point the Playwright `webServer` at the container or a preview server rather than `npm run dev`

**Note:** `app/layout.tsx` uses `next/font/google`, which downloads fonts at build time. The Docker build stage needs network access, or the fonts must be self-hosted.

**Tests:** unit suite >=80% lines; Playwright board spec passes against the containerised app — board renders 5 columns, a card drags between columns, a column renames, a card adds and deletes.

**Success criteria:** `scripts/start.sh` serves the working demo board at `http://localhost:8000`. Both test suites pass.

---

## Part 4: Add in a fake user sign in experience

**Goal:** the board is behind a login.

- [ ] `users` table with `username` and `password_hash`; seed `user` / `password` on first run
- [ ] `POST /api/login` — validates against the table, sets an HTTP-only session cookie
- [ ] `POST /api/logout` — clears the cookie
- [ ] `GET /api/me` — returns the current user or 401
- [ ] Auth dependency protecting board routes
- [ ] Login page in the frontend, styled to the project palette (purple `#753991` submit button)
- [ ] Client-side guard: on load, call `/api/me`; unauthenticated shows login, authenticated shows the board
- [ ] Log out control in the board header

**Tests:** backend — correct credentials set a cookie, wrong credentials return 401, protected routes reject without a cookie, logout invalidates the session. Frontend — login form validation, error display, redirect on success. E2E — visiting `/` shows login, logging in reveals the board, reload keeps you in, logout returns to login.

**Success criteria:** the board is unreachable without logging in. Session survives a page reload. Coverage gate holds.

---

## Part 5: Database modelling

**Goal:** an agreed schema.

- [ ] Propose normalised tables: `users`, `boards`, `columns`, `cards`, `chat_messages`
- [ ] Cards carry an explicit `position` within a column; columns carry a `position` within the board
- [ ] `chat_messages` stores role, content and timestamp per board, so history survives restarts
- [ ] Write the schema to `docs/schema.json`
- [ ] Write `docs/DATABASE.md` — tables, relationships, why normalised over a JSON blob, how ordering is maintained, migration approach
- [ ] **Gate: user signs off on the schema before Part 6 begins**

**Success criteria:** the user has explicitly approved the schema.

---

## Part 6: Backend

**Goal:** working, well-tested board APIs.

- [ ] SQLite schema created on startup if the database file does not exist; seed one board with the 5 columns for the seeded user
- [ ] `GET /api/board` — the current user's board as `{ columns, cards }`, matching the frontend's existing shape
- [ ] `POST /api/cards`, `PATCH /api/cards/{id}`, `DELETE /api/cards/{id}`
- [ ] `POST /api/cards/{id}/move` — target column and index, renumbering positions
- [ ] `PATCH /api/columns/{id}` — rename only; columns are fixed
- [ ] Every route scoped to the session user; a user can never read or write another user's board
- [ ] Pydantic request and response models

**Tests:** unit tests per route covering success, validation failure, 404 on unknown ids, and 401 unauthenticated. Move tests specifically cover: moving within a column, across columns, to index 0, past the end, and that positions stay contiguous. Ownership test: user A cannot touch user B's cards. Fresh-database test: deleting the file and restarting recreates and reseeds it.

**Success criteria:** `pytest` passes at >=80% coverage with every route exercised. The database is created from nothing on first run.

---

## Part 7: Frontend + Backend

**Goal:** a genuinely persistent Kanban board.

- [ ] API client module in `frontend/lib/`
- [ ] Replace the seeded zustand store with state loaded from `GET /api/board`
- [ ] Wire `addCard`, `deleteCard`, `moveCard`, `renameColumn` to their endpoints
- [ ] **Build the missing card edit** — action, endpoint wiring, and inline edit UI on the card
- [ ] Optimistic updates for drag (dragging must stay smooth), with rollback on failure
- [ ] Loading and error states
- [ ] `lib/seed.ts` is now only used by tests, or is deleted

**Tests:** unit tests for the API client with fetch mocked, including error paths; store tests for optimistic update and rollback. E2E against the container: add a card, edit it, drag it across columns, rename a column, delete a card — then reload and confirm every change persisted; restart the container and confirm again.

**Success criteria:** every board change survives both a page reload and a container restart. Drag stays visually smooth. Coverage gate holds.

---

## Part 8: AI connectivity

**Goal:** proven OpenRouter connectivity, including structured outputs.

- [ ] Read `OPENROUTER_API_KEY` from the environment; fail loudly at startup if missing
- [ ] OpenRouter client calling `openai/gpt-oss-120b`
- [ ] `POST /api/ai/test` — asks "what is 2+2", returns the answer
- [ ] **Second probe: confirm the model honours a `json_schema` structured output**, since Part 9 depends on it

**Risk:** if `openai/gpt-oss-120b` does not support structured outputs on OpenRouter, fall back to prompt-enforced JSON with strict server-side Pydantic validation and a single retry on parse failure. Decide this here, not in Part 9.

**Tests:** unit tests with the OpenRouter call mocked (success, timeout, 401, malformed response). One manual live check recorded in the part's commit message. Never commit the API key or hit the live API from the test suite.

**Success criteria:** `/api/ai/test` returns 4 against the live API, and a schema-constrained response parses cleanly.

---

## Part 9: AI board updates

**Goal:** the AI can answer questions about the board and rewrite it.

- [ ] `POST /api/chat` — takes the user's message, loads the board plus stored history
- [ ] Prompt includes the full board JSON, the conversation history and the user's question
- [ ] Structured output: `{ reply: string, board: Board | null }` — `board` is the complete new board, or null when no change is needed
- [ ] Validate the returned board before persisting: ids well-formed, no orphan cards, column set unchanged (columns are fixed and cannot be added or removed), every `cardIds` entry present in `cards`
- [ ] Reject invalid boards rather than persisting them; tell the user the update failed
- [ ] Persist the board change and both chat messages in one transaction
- [ ] `GET /api/chat` — returns stored history

**Tests:** mocked-AI unit tests for reply-only, reply-plus-valid-board, and reply-plus-invalid-board (orphan card, missing column, duplicate id, unknown card id) — invalid boards must leave the database untouched. History persistence across restart. Ownership scoping on both chat routes.

**Success criteria:** with a mocked AI, "move the accessibility card to Done" persists correctly and a malformed board is rejected with the database unchanged. Chat history survives a restart. Coverage gate holds.

---

## Part 10: AI chat sidebar

**Goal:** the finished app.

- [ ] Sidebar chat panel, collapsible, styled to the project palette
- [ ] Message list distinguishing user and AI, loaded from `GET /api/chat` on mount
- [ ] Input with send, disabled while a response is in flight, plus a thinking indicator
- [ ] When the response includes a board update, refresh the board automatically — no manual reload
- [ ] Error state when a call fails or an update is rejected
- [ ] Responsive: the sidebar must not break the board's horizontal scroll
- [ ] Keyboard accessible, focus states visible, contrast checked

**Tests:** unit tests for the chat component — render history, send, loading state, error state, board refresh on update. E2E with the AI mocked at the network layer: open sidebar, send a message, see the reply, see a card move on the board without reloading. One manual live end-to-end check against the real model.

**Success criteria:** a user logs in, sees their persisted board, asks the AI to create and move cards, watches the board update live, reloads, and finds everything still there. Full suite green at >=80% coverage on both sides. `README.md` documents setup and the start/stop scripts, minimally.
