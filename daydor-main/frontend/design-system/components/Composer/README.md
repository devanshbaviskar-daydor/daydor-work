# Composer

Where a person asks Daydor something or tells it what to do — a growing textarea with attach, a scope picker and a send button.

**Consumer provides:** `onSend(text)`; optional `value`/`onChange` (controlled), `placeholder`, `scope` (label of the current scope: "All of HR", "Payroll", "Priya Raghavan"), `suggestions` (2–4 starter prompts shown only while empty), `busy` (Daydor is answering), `footnote`.

- Enter sends, Shift+Enter adds a line.
- Suggestions are verbs about the person's real state ("Run October payroll"), not generic capabilities ("Ask me anything!").
- Keep the footnote as the system's standing promise: "Daydor asks before anything irreversible — money, filings or access."
- On the employee app there is no `scope`: Daydor only ever answers about the person themselves. Use the placeholder "Ask about your pay, leave or documents…".
- Docked at the bottom of the conversation column, max width `conversation-max`.
