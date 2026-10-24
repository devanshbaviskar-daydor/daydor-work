# Tailwind setup

1. `tailwind.config.js`: `presets: [require('./design-system/tailwind/daydor.preset.js')]`.
2. Import `design-system/tailwind/globals.css` once in your root layout (it pulls in `tokens/tokens.css`).
3. Set `data-theme="light"` or `"dark"` on `<html>`. Employee app for a client: wrap it in `data-theme="client-<id>"` with that client's four `action` values.
4. Use token names as classes: `bg-surface`, `text-ink-muted`, `border-line`, `text-irreversible`, `bg-warning-soft`, `rounded-lg`, `shadow-md`, `text-reading`, `max-w-conversation`, `w-rail`.

Tailwind v4 instead of v3: skip the preset and declare `@theme inline { --color-surface: var(--surface); … }` for each colour in `tokens/tokens.json`, plus spacing, radius and shadow.
