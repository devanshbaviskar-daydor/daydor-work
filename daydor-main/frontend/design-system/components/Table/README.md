# Table

Rows of records — a payroll register, a leave list — inside a bordered surface, with right-aligned tabular figures.

**Consumer provides:** `columns` (`{key, header, numeric?, align?, width?, render?(row)}`), `rows`; optional `rowKey`, `caption`, `density` (`comfortable` 48px rows, `compact` 36px), `empty`.

- Tables appear when a person asks to see the data ("show me the register"), usually embedded in a Message — they are not the home screen.
- Explain rows that differ inline (a muted second line: "3 days LOP") instead of adding columns.
- Money via `Amount` in `numeric` columns. In the app, wrap with TanStack Table for sorting and filtering.
