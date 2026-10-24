# Message

One turn in the conversation: the person's message as a quiet bubble on the right, Daydor's as plain prose on the left with its avatar and a one-line eyebrow.

**Consumer provides:** `from` (`'daydor'` default, or `'user'`), `children` (paragraphs, and optionally embedded `DecisionCard`, `Receipt` or `Table`), `domain` (the domain orchestrator that did the work — "Payroll", "Compliance"), `time`, `streaming` while tokens arrive.

- Daydor is always one voice. The domain appears only as a quiet label in the eyebrow; never show worker names (`wage-calculator`) in a message — they belong in the Receipt.
- Lead with the outcome in the first sentence, then the one or two facts that explain it. If the reply needs more than ~3 short paragraphs, put the detail in a Receipt or a Table, not in prose.
- Bold only the single figure or phrase the reader must not miss.
- When an answer leads to a gate, end the message with the `DecisionCard` itself — don't make the person go find it in the rail.
- Daydor's messages have no bubble: prose on canvas reads calmer and lets embedded cards sit flush.
