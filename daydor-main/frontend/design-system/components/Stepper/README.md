# Stepper

Progress through a lifecycle — a payroll run, an onboarding, an exit — showing what agents have finished, where a human is needed and what's next.

**Consumer provides:** `steps` (`{label, state: 'done'|'current'|'waiting'|'blocked'|'upcoming', meta?, writeClass?, children?}`), `orientation` (`horizontal` default; `vertical` for longer flows with detail under each step).

- `current` = waiting on a person (warning ring); `waiting` = waiting on a third party; `blocked` = something went wrong (danger) — its `meta` says what and what Daydor did about it.
- Mark the human gate with `writeClass: 'irreversible'` so the lock shows on the step.
- `meta` names the domain doing the step in vertical steppers ("IT · laptop ships 30 Oct") — that's how the hierarchy shows without an org chart.
- Horizontal for 4–6 steps of a run; vertical for anything longer or cross-domain (onboarding, F&F).
