# RunRow

One line of agent activity in the rail: what's running, waiting, done or failed.

**Consumer provides:** `title` (outcome-phrased: "Sent 14 payslips"), `state` (`running`, `waiting`, `done`, `failed`), optional `domain`, `meta` (time or step), `progress` (0–100).

- Running gets the live teal dot; done fades to muted text — finished work should recede.
- `waiting` means blocked on a person or third party; say on whom.
- `failed` always says what happens next ("retrying at 11 am", "needs you") — never a bare error.
- Show at most ~5 done rows, then "N more".
