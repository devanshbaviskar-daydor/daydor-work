# Input

A labelled single-line field with optional hint, error, prefix and suffix — for the few things people still type directly (CTC, PAN, bank details).

**Consumer provides:** `label`, `value`/`onChange` or `defaultValue`, native input props; optional `hint`, `error`, `prefix` ("₹"), `suffix`, `optional`.

- Prefer letting Daydor collect data in conversation or from documents; forms are for confirming and correcting.
- Errors say how to fix it with an example. Validate on blur.
- Sensitive fields (PAN, Aadhaar, bank) are a gated write: saving one creates a DecisionCard, not a silent overwrite.
