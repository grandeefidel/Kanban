# Kanban Board

A single-board Kanban app: five renamable columns, drag-and-drop cards, add and delete cards. Client-rendered, no persistence.

## Stack

Next.js (App Router) - TypeScript - Tailwind CSS - dnd-kit - Motion - Zustand - Vitest - Playwright.

## Setup

```bash
npm install
npx playwright install chromium   # once, for e2e tests
```

## Develop

```bash
npm run dev        # http://localhost:3000
```

## Test

```bash
npm test           # unit tests (Vitest) for the board store
npm run test:e2e   # integration tests (Playwright)
```

## Build

```bash
npm run build
npm start
```
