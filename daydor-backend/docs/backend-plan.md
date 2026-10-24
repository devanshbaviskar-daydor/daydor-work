# Backend plan

Status: v0.6, Oct 8 2026. Build steps 1-7 done, hire flow Sprints 1-2 done (99 tests passing).
Validated against the 82-table model in `model/daydor_model.json`. Sprint-by-sprint plan and
status: `docs/sprint-plan.md`.

## Principles

1. **The model is the source of truth.** Tables, row-level security, column grants, masked and
   aggregate views are generated from `model/daydor_model.json`. Tests fail on drift.
2. **The database enforces the rules.** Tenant isolation, column access, append-only tables,
   maker-checker and "no disbursal without an approved gate" are enforced in Postgres, so a
   buggy agent or service cannot bypass them.
3. **Agents never write raw SQL.** Each table has one owning domain service. Agents call services
   as their own database role (`agent_<domain>`).
4. **Every write is idempotent.** Agents retry, so commands carry an idempotency key.
5. **Hard gates stay human.** Jev runs only on soft gates, fails closed, and never sees C3/C4 data.

## Components

| # | Component | Decision |
|---|---|---|
| 1 | Session context | `SET LOCAL app.tenant_id / app.role / app.actor / app.purpose` per transaction |
| 2 | Write services | One owner per table, idempotency keys, outbox in the same transaction |
| 3 | Queue and timers | Postgres: `FOR UPDATE SKIP LOCKED` leases, retries with backoff, dead-letter (ADR-001) |
| 4 | State machines | Definitions and transitions stored as data, guarded by gates |
| 5 | Gate service | Registry of the 20 hard gates, `approval_request` as the record, DB-enforced maker-checker |
| 6 | Soft gates (Jev) | Typed questions, calibrated thresholds, `gate_evaluation` log, shadow mode first, fail closed |
| 7 | Privacy | `app.decrypt_pii(column, purpose)` checks consent and writes `audit_log`; per-tenant keys |
| 8 | Jurisdiction packs | Effective-dated `statutory_rate_rule` / `pt_slab_rule`; deterministic payroll code |
| 9 | Derived structures | `reporting_closure`, `employee_directory`, threshold recompute |
| 10 | Adapters | IdP, carriers, bank, E-Verify, tax filing, background checks, GL via outbox and webhook inbox |

## Build order

1. Model export and DDL generator
2. Platform schema: roles, session context functions, RLS, grants
3. Queue, outbox, timers
4. State-machine runner
5. Gate service and Jev soft-gate hook
6. Tests: access matrix, maker-checker, queue semantics, model drift

## Known model gaps (from validation)

Tables with no writing worker in the agent map. Each needs an owner (admin UI, seed, or
human-only service): `job_profile`, `comp_band`, `skill`, `benefit_plan`, `leave_policy`,
`course`, `certification`, `pt_slab_rule`, `statutory_rate_rule`, `retention_policy`,
`legal_hold`, `garnishment_order`, `access_role_template`, `valuation_409a`, `time_punch`,
`performance_review`, `consent_record` (employee-only, by design), `self_identification`
(employee-only, by design).

## Status

| Step | Status |
|---|---|
| 1. Model export and DDL generator | Done |
| 2. Platform schema: roles, session context, RLS, grants | Done |
| 3. Queue, outbox, timers | Done |
| 4. Gate service: hard gates, write guards, Jev soft gates | Done (Jev HTTP client is a stub) |
| 5. State-machine runner | Done (flow definitions are generated skeletons) |
| 6. Tests | 99 passing |
| 7. Privacy services | Done for the 4 encrypted `employee` columns (`0011_privacy.sql`) |
| 8. Hire flow, Sprints 1-2 of docs/sprint-plan.md | Done: position check → requisition → `g_requisition_budget` approval → job posting → application → screening (`g_aedt`) → interview → offer (`g_offer_band`), driven end to end through `WorkflowEngine` (`src/daydor/hire/`, `0012`-`0015`) |

## Next steps

See `docs/sprint-plan.md` for the sprint-by-sprint plan (Hire → Payroll → Exit, then hardening).
Miscellaneous items below aren't yet scheduled to a specific sprint:

1. **Push model deviations back into the artifact**: `approval_request.requested_by_*`/
   `decision_note` (finding 1), `employee`'s nullable PII columns (finding 10),
   `g_requisition_budget` (finding 11) — consolidated into sprint-plan.md Sprint 13.
2. **Decide finding 2** (employee self-write scope) and **finding 9** (manager-approval gates,
   partly resolved for timecards in sprint-plan.md Sprint 6; `g_expense` still open) — both in
   Sprint 12.
3. **Wire Jev** in `src/daydor/gates/jev.py` from TypeSafe's API docs once real API access
   exists; until then soft gates stay in shadow mode (Sprint 13 builds the shadow-vs-human
   comparison report).
4. **Enum value lists** in the model, then generated CHECK constraints (finding 5) — Sprint 12.
5. **Ops tenant assignment** (finding 6) and k ≥ 5 aggregate views starting with EEO-1
   (finding 7) — Sprint 13.
6. **Insert-time PII encryption** for append-only PII columns (`er_case_note.note_body`), once
   the ER case flow is built: needs a column-level INSERT grant plus a pure encrypt-and-return
   function, distinct from the UPDATE-based `app.encrypt_pii` used for `employee`.
7. **Production key management:** replace `app.pii_key`'s dev passphrase (one shared GUC) with
   per-tenant data keys from a KMS; it is the one function that needs to change.
8. **CI:** run `alembic upgrade head` and `pytest` against Postgres 16 on every push — Sprint 12.
