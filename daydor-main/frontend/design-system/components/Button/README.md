# Button

Triggers an action; `primary` marks the one thing the view is for.

**Consumer provides:** a label naming the outcome (`children`), `variant` (`primary`, `secondary` default, `ghost`, `danger`), `size` (`sm` 28px in cards and the rail, `md` 36px default, `lg` 44px on phones), `onClick`; optional `icon`, `iconRight` (Lucide names in the bundle), `loading`, `fullWidth`.

- `primary` fills with `action`, so the employee app follows the client's colour; Daydor's own screens read teal.
- One primary per card or dialog. In a DecisionCard: primary = the consequence ("Approve & file"), secondary = Review, ghost = Delegate.
- An irreversible confirm button carries the `lock` icon.
- Keep the label while `loading` so the width doesn't jump.
