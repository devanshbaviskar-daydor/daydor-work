# ProfileField

One field of an employee's own profile, showing which of three kinds of change it needs.

**Consumer provides:** `label`, `value`, `tier` (`direct`, `review`, `gated`), optional `pending` (text when a change is in review), `onEdit`, `actionLabel`.

- `direct` — address, emergency contact, tax regime: a quiet **Edit**, saved immediately.
- `review` — PAN or Aadhaar corrections: **Request change**; while waiting it shows an "In review" badge and when it was sent. HR checks it before it changes.
- `gated` — salary bank account: the label carries the lock in the `irreversible` colour; **Change** leads to the `VerifyCode` step.
- Group fields by tier under plain headings ("Change any time", "Checked by HR before it changes", "Protected").
