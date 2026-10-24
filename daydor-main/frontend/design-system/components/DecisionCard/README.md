# DecisionCard

An approval gate asking a human to decide: what's ready, what happens if they approve, why a human must decide, how much and by when.

**Consumer provides:** `title` (the action in imperative: "File the October PF return"), `domain`, `gate` (gate type from the catalog: "Statutory filing", "Maker-checker", "Sensitive data change"), `writeClass`, `summary` (what's ready and what approval does, ≤2 sentences), `figures` (`{label, value, note?}`; numbers render as Amount), `why` (the law or policy behind the gate), `deadline` (Deadline props), `approveLabel`, `reviewLabel`, `onApprove`, `onReview`, `onDelegate` (or `false`), optional `pace` (`'routine'` for 24–48h gates like leave and expenses), `note` (shown instead of the deadline: "Asked yesterday · no rush", "With Rohit · comes to you Thu if he hasn't decided"), `escalation` (one line in danger shown above the title when a decision is stuck — e.g. "Delegated to Rohit 3 days ago — no response"), `children`.
Variants: `compact` (a rail row: domain, title, deadline, lock — with `selected`, `onOpen`), and `state: 'approved'|'declined'|'delegated'` with `resolvedNote` (a one-line record that stays in the conversation).

- One card = one decision. Batch only identical gates ("Approve 4 leave requests") and say so in the title.
- The approve button names the consequence: "Approve & file", "Release ₹12,48,600" — never just "Approve" on an irreversible gate.
- Irreversible approvals open a `Dialog` with its `irreversible` strip before anything happens. Reversible ones act immediately and offer Undo.
- Every gate offers Delegate — the spec's single-approver bottleneck needs a backup path. Delegation is one-off: it hands *this* decision to one person (pick them with `Select`), moves the card to their Needs you list, and leaves a `state: 'delegated'` record ("Delegated to Rohit · just now") for the delegator. No standing rules.
- On phones the card goes full-width, actions wrap, and an irreversible approval confirms in the bottom-sheet `Dialog` with device re-auth.
- Never more than three open cards in view; the rail holds the rest.

- A decision that sits past its deadline, or with a delegate who hasn't acted, moves to a **Stuck** section of the rail with an `escalation` line, and offers "Take it back" and "Remind". Time-sensitive statutory gates escalate before the deadline, never after.

- **Routine gates** (leave, expense claims) use `pace: 'routine'`: no shadow, no deadline colour, and a `note` saying who has it and when it escalates. They must never look as urgent as a filing or a disbursement. Routine requests reach the founder only as the employee's manager or after the 24–48h escalation.
- **Rare commitments** (benefit plan setup) are not DecisionCards at all: they live on their settings page, with a reminder after a week and no fallback approver.
