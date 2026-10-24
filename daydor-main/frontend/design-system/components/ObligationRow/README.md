# ObligationRow

One statutory deadline in the compliance calendar: date block, obligation, authority, amount and status.

**Consumer provides:** `date` ("15 Nov"), `title` ("PF return (ECR) — October"), `authority` ("EPFO"), optional `period`, `note`, `amount`, `status` (`filed`, `upcoming`, `needs-you`, `overdue`, `pending`).

- Rows that need the person get a `warning-soft` ground; overdue ones `danger-soft`. Everything else stays plain so the two stand out.
- Group by month; within a month, by date.
- Opening a `needs-you` row opens its DecisionCard.
