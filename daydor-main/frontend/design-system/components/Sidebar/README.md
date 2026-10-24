# Sidebar

The founder's desktop navigation: wordmark and workspace switcher, the "Ask or go to…" command trigger, ten destinations, and the signed-in person.

**Consumer provides:** `items` (`{key, label, icon, href?, active?, count?, countTone?: 'warning'}`), `workspace` (client company name), `user` (`{name, role}`), `onAsk` (opens CommandBar); optional `footerItems` (no default — renders nothing when omitted).

- Ten destinations, in this order: **Home** (count = decisions waiting, warning tone), **People**, **Hiring**, **Leave & attendance**, **Payroll**, **Expenses**, **Compliance**, **Documents**, **Benefits**, **Settings**. Sidebar has no nested-item support, so Benefits and Settings are both top-level rather than Benefits living under Settings. Onboarding and the headcount monitor surface through Home and People, not their own entries.
- Only Home carries an attention count. Other counts are neutral totals, or nothing.
- 232px wide on desktop; below 1024px it collapses behind a menu button and the phone uses `TabBar`.
- The active item uses `surface-sunken` and an `action`-coloured icon.
