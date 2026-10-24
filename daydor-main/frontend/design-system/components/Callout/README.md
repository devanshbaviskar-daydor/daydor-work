# Callout

A boxed notice inside the conversation for something that went wrong or needs a judgement call but isn't a formal approval gate: a failed run, a conflict between workflows, a data question.

**Consumer provides:** `title`, `tone` (`danger` failure, `warning` conflict or ambiguity, `info`, `neutral`), `children` (what happened, what it means for the person's data, what happens next); optional `eyebrow` (domain and time), `actions` (Buttons), `icon`.

- A failure always states that nothing irreversible happened (or exactly what did), and the next automatic step: "Nothing was submitted and no money moved. I'll retry at 11 am."
- A collision (two workflows on the same employee) says which one Daydor paused and why, then offers the recommended resolution as the primary button: "Keep the exit, void the revision".
- If the resolution is irreversible, use a DecisionCard instead.
