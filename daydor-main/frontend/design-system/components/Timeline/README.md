# Timeline

The history of a record — everything agents and people did to one employee, newest first. This is the person-level audit trail.

**Consumer provides:** `items` (`{text, by?: 'daydor'|'person', name? (for people), domain?, time, writeClass?}`).

- Agent entries show the Daydor avatar and the domain; human approvals show the person's initials. Agents and humans interleave so the "who approved what" story reads top to bottom.
- Show write class on writes only. Reads never appear here.
- Each entry links to its Receipt and audit ID in the app.
