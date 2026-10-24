# AttendanceGrid

A week of attendance for a team: one row per person, one cell per day.

**Consumer provides:** `days` (`{label, sub?, today?}`), `people` (`{name, marks}` where `marks` is one letter per day: `P` present, `A` absent, `H` half day, `L` on leave, `O` weekly off or holiday, `-` upcoming); optional `legend` (default on).

- Present is the quietest cell (a teal dot); absence, leave and half days carry a letter and colour, so the eye lands on the exceptions.
- Today's column header is marked. Future days are dashed outlines.
- Show the people with exceptions first and collapse the rest ("+ 7 more, all in today").
- Each cell has a text label for screen readers; never rely on colour alone.
