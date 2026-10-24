# StageBoard

The hiring pipeline: one column per stage, a CandidateCard per person, so the founder sees at a glance who is where and what is stuck.

**Consumer provides:** `stages` (`{key, label, count?, empty?}` — Applied, Screening, Interview, Offer, Background check, Hired), `items` (CandidateCard props plus `stage`).

- One board per role (Tabs above it switch roles). Columns scroll horizontally on narrow screens; on phones, show the role as a list grouped by stage instead.
- `count` is the true total for the stage; the column may show only the cards that matter (anything blocked or recent) — Applied often holds dozens that Daydor is still screening.
- Moving a candidate is an agent action (or a person's decision recorded through a DecisionCard), not drag-and-drop. The board is for seeing, not operating.
- Gates (offer outside band) still surface as a DecisionCard above the board and in Home's Needs you.
