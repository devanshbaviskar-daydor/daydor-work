# Receipt

The collapsible "how I got here" under an answer or decision: every step agents took, what they read and wrote, the sources and the audit ID.

**Consumer provides:** `steps` (`{kind: 'read'|'write'|'gate'|'done', text, domain?, worker?, time?}`), optional `label`, `duration`, `writeClass` (the most consequential class among the steps), `sources` (SourceChip props), `auditId`, `defaultOpen`.

- Collapsed by default. A founder should be able to trust the outcome without opening it, and verify it in one click.
- Each step is one plain sentence a CA could read. Worker names appear here, in `code`, as secondary metadata — this is the only place the agent hierarchy shows by default.
- Step marks follow write class: eye for reads, shield for reversible writes, lock on irreversible-soft for a gate.
- Always end with the audit ID — it's what makes an EPFO/ESIC audit response defensible.
