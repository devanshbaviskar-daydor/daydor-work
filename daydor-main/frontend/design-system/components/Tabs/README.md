# Tabs

Underline tabs for switching views inside a page.

**Consumer provides:** `items` (strings or `{label, active?, count?, onClick?}`).

- Four or five tabs at most; counts are neutral totals.
- First tab is always the summary — what Daydor thinks the person should know — then the raw detail.
- In the app, implemented as `src/components/daydor/Tabs.tsx` (plain `role="tablist"`/`role="tab"` markup, not Radix).
