# PageHeader

The top of a lookup page (Payroll, Compliance, a person): eyebrow, title with an optional status, one line of context, up to two actions and optional tabs.

**Consumer provides:** `title`; optional `eyebrow` (string or list: domain, period), `status` (Badge preset), `description`, `actions` (Buttons, primary last), `tabs` (Tabs items), `person` (a name — shows their avatar, for people pages).

- The primary action is the page's one decision ("Approve & release", with the lock if irreversible). Everything else is secondary or lives in ⌘K.
- Description is facts, not instructions: "14 people · pay date 31 Oct".
