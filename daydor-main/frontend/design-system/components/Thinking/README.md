# Thinking

Shows that Daydor is working right now: a pulsing teal dot, a shimmering one-line status and the latest step.

**Consumer provides:** `label` ("Payroll is computing October…"), optional `steps` (strings; only the latest is shown, with a step count).

- Name the domain and the outcome, not the mechanism: "Compliance is checking PT slabs for Karnataka…", not "Invoking tool get_pt_slab".
- Replace it with the finished Message as soon as the run returns. If it runs longer than ~20 seconds, say so and let the person leave: the result will also appear in the rail.
- Motion stops under `prefers-reduced-motion`; the text alone carries the state.
