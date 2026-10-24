# CommandBar

The ⌘K palette: one box to ask Daydor a question, jump to a person or page, or start an action.

**Consumer provides:** `groups` (`{label, items: [{icon, label, hint?, writeClass?}]}` — typically People, Actions, Go to), `onSelect(item)` (an item with `ask: true` means "send this text to Daydor"), `onClose`; optional `defaultQuery`, `inline` (docs only).

- Typing always offers **Ask Daydor: "…"** first, so the palette is never a dead end.
- Actions show their write class: guarded actions a shield, irreversible a lock. Selecting an irreversible action opens its DecisionCard; it never runs from the palette.
- Arrow keys move, Enter opens, Esc closes. Opened by ⌘K / Ctrl+K anywhere, or the sidebar's "Ask or go to…".
- In the app, build it on shadcn `Command` (cmdk) with this styling.
