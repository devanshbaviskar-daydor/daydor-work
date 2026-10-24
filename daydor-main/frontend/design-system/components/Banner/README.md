# Banner

A full-width strip across the top of the main column for a state that changes what Daydor is allowed to do right now.

**Consumer provides:** `title` (bold, one short sentence), `children` (what it means for the person), `tone` (`paused`, `warning`, `danger`, `info`); optional `action` (`{label, onClick}`), `icon`.

- **paused** — labour inspection, ESI/EPF audit or a legal notice is active: "Labour inspection mode is on. Changes to records and payroll are paused. Reading and reports continue." Every write in the product is blocked until a human ends it.
- **danger** — a statutory obligation is already late (an overdue registration or filing).
- **info** — a standing condition worth knowing, such as running old Acts and new Labour Codes side by side during the transition.
- One banner at a time; the most severe wins. Banners are for system-wide states only; anything about one task belongs in the conversation as a Callout.
