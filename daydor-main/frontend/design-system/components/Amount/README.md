# Amount

Formats rupees the Indian way — `₹1,25,000`, lakh and crore grouping — with tabular numerals so columns line up.

**Consumer provides:** `value` as a number of rupees (not paise); optional `compact` (`₹12.49 L`, `₹2.48 Cr` — full value in the tooltip), `paise` (`true` always shows two decimals, `false` never; by default only when non-zero), `size="lg"` for stat tiles and net pay, `tone` (`muted`, `danger`, `success`).

- Every rupee figure in the product goes through `Amount` or `Daydor.formatINR()`; never format money by hand.
- Use `compact` only in summaries and charts, never on payslips, registers or anything someone reconciles.
- Negative values use a true minus (−) and `tone="danger"` only when the negative is a problem (an arrear), not for normal deductions.
- Right-align amounts in tables (`numeric: true` on the column).
