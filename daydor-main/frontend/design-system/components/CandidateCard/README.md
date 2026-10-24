# CandidateCard

One candidate on the hiring board: name, source or next event, Daydor's screening signal, and the one thing blocking them.

**Consumer provides:** `name`, optional `meta` ("Applied 2d ago · Naukri", "Round 2 · Thu 15 Oct, 4 pm"), `signal` (Badge preset: `shortlist`, `hold`, `rejected`, `awaiting-consent`…), `signalNote` (why, in a few words), `blocker` (`{kind, text}`), `selected`, `onOpen`.

Blocker kinds read differently on purpose:
- `you` — warning, filled dot: a decision is waiting on someone inside the company ("Above band — needs you").
- `external` — info, clock: waiting on someone **outside** the company, usually the candidate ("Waiting on Kavya to consent · sent 2 days ago"). Nobody here can approve it; Daydor follows up.
- `agent` — live teal dot: Daydor is working ("Daydor is screening").
- `done` — success check: handed to the next domain ("Handed to Onboarding").

- Screening signals are recommendations; the card shows them as Daydor's view with a reason, never as a decision.
