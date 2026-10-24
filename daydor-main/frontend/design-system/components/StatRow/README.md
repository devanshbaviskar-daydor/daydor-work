# StatRow

A row of 3–4 key figures, each with a one-line comparison.

**Consumer provides:** `items` (`{label, value (number → Amount), delta?, deltaTone?: 'warning'|'success'}`).

- Every figure gets context ("+₹38,200 vs Sep", "same as Sep"); a bare number is a dashboard trope.
- Use `warning` for a change worth a look, `success` for a clean record. Never red/green for up/down by itself — up isn't good or bad for payroll.
- Sits in a panel at the top of a page, below the stepper.
