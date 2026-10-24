# Badge

A small status label — a tone, an icon and a word — so status never depends on colour alone.

**Consumer provides:** a `status` preset, or `tone` (`neutral`, `success`, `warning`, `danger`, `info`, `brand`) plus `children`; optional `icon` (a name, or `false`).

| Area | Status → tone |
| --- | --- |
| Agent work | `needs-you` → warning · `running` → info · `done` → success · `failed` → danger |
| Approvals | `pending` → warning · `approved` → success · `rejected` → danger · `withdrawn` → neutral |
| Deadlines | `upcoming` → neutral |
| Hiring | `shortlist` → success · `hold` → neutral · `awaiting-consent` → info |
| Requests & profile | `manager-review` ("With manager") → neutral · `in-review` → info |
| Payroll & compliance | `draft` → neutral · `processing` → info · `paid` → success · `overdue` → danger · `filed` → success |
| Benefits | `active` → success · `pending_confirmation` ("Pending confirmation") → warning |

- Use presets so a state looks identical everywhere; add a preset here rather than styling one-off badges.
- One or two words, sentence case. Never clickable.
