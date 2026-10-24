# FactList

Label–value pairs for a record's details.

**Consumer provides:** `items` (`{label, value (number → Amount), mono?, locked?}`), optional `columns` (1 or 2).

- `mono` for identifiers (UAN, PAN, employee ID). Mask sensitive numbers: `HDFC ···· 4821`, `ABCPR····F`.
- `locked` adds a small lock: changing that field (bank, PAN, Aadhaar, UAN) is a gated write under the DPDP Act and creates a DecisionCard, never an inline edit.
