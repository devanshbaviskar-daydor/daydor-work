# Daydor frontend

The founder-facing Daydor app: React + TypeScript + Vite, Tailwind v4 and
shadcn/ui (Radix), built on the Daydor design system vendored at
`design-system/`.

## Design system

`design-system/` is copied in from the design team's source of truth — see
its own `README.md` for principles, content voice and visual rules, and
`CLAUDE.md.snippet` for the rules every change must follow. Component
guidelines live in `design-system/components/<Name>/README.md`; visual
references are in `design-system/reference/previews/*.html`.

`design-system/reference/bundle.js` / `bundle.css` are reference-only — the
real components live in `src/components/daydor/`, built on shadcn/ui
primitives in `src/components/ui/` and styled with Tailwind utilities mapped
to the design tokens in `design-system/tokens/tokens.json` (wired into
Tailwind via `src/index.css`'s `@theme inline` block — see
`design-system/tailwind/README.md`).

## Data layer

Screens read through a typed interface per domain (e.g. `src/data/homeSource.ts`,
`src/data/expensesSource.ts`, `src/data/leaveSource.ts`) rather than fetching
directly, so the mock implementations used today (`src/data/mockHomeSource.ts`,
`src/data/mockExpensesSource.ts`, `src/data/mockLeaveSource.ts`) can be swapped
for a real API client later without changing any component.

## Scripts

```
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint      # oxlint
```
