# Sprint plan

Status: **approved 2026-10-08; Sprints 1-2 done** (99 tests passing). v2: revised after re-reading
`docs/backend-plan.md` and `docs/model-findings.md` against the actual table `writers`/grants in
`model/daydor_model.json` — this surfaced real prerequisite work the first draft missed (see
"What changed from v1" at the bottom).

## End goal (from `model/source_artifact.html`, `docs/backend-plan.md`, `CLAUDE.md`)

Daydor is an HR platform for SMEs (50-100 employees) where **AI domain agents do the operational
work** — hiring, payroll, benefits, time/leave, performance, learning, ER/offboarding — across
India + US jurisdictions. Postgres, not the application, enforces tenant isolation, column-level
access by data sensitivity (C0-C4), maker-checker approval, consent-gated PII and full audit, so a
buggy or compromised agent cannot bypass the rules. The model defines 82 tables, 6 end-to-end
flows (**hire, payroll, exit, erasure, merit, threshold-crossing**), ~20 hard human gates, and a
soft AI gate service ("Jev") that may only fast-track a decision, never replace human approval on
a hard gate. `docs/backend-plan.md`'s 10 components (session context, write services, queue,
state machines, gates, soft gates, privacy, **jurisdiction packs**, derived structures, adapters)
are the architecture; the 6 flows are what that architecture is *for*.

The backend's job is to make each flow real: a domain service (a "worker" in the model) per
table, wired through the queue and the state-machine runner, gated correctly, auditable, and
tenant-isolated.

## Decisions this plan is built on (confirmed 2026-10-08)

1. **Flow priority: Hire → Payroll → Exit.** Erasure, merit and threshold-crossing are real flows
   in the model but are **backlog**, after Exit ships.
2. **All adapters are mocks for now** (IdP, bank, carriers, E-Verify, tax filing, background
   checks, GL, job boards). Every sprint that touches an adapter builds it behind a narrow
   interface with a fake implementation.
3. **Jev stays a stub / shadow mode.** No real TypeSafe API access yet.
4. **Open-ended, iterate sprint by sprint.** Each sprint is sized to be independently reviewable
   and mergeable; the next sprint gets planned after the current one is approved and merged.

## What "done" means for a sprint

- `alembic upgrade head` + `pytest` green (currently 90 tests, Postgres 16).
- `docs/backend-plan.md`, `docs/model-findings.md` and this file updated: status flipped, new
  findings logged, next steps adjusted.
- A short demo-able capability stated in the sprint's "Exit criteria."

## Reference & admin-owned data — not a gap, no sprint needed

Finding 4 lists 18 tables with no agent writer (`job_profile`, `comp_band`,
`access_role_template`, `benefit_plan`, `leave_policy`, `statutory_rate_rule`, `pt_slab_rule`,
`garnishment_order`, `legal_hold`, ...). Checked each against its `table_acl`: `tenant_hr`/
`tenant_founder`/`tenant_payroll`/`tenant_it` already hold direct `WRITE` on the tenant-owned ones,
and `daydor_ops` already holds direct `WRITE` on the global statutory ones (`statutory_rate_rule`,
`pt_slab_rule` — Daydor, not the tenant, maintains jurisdiction packs). **These are admin-entered
by design, through grants that already exist; no domain service needs to be built.** The only
consequence for sprints below: demos should seed this data with a real `tenant_session(...,
"tenant_hr", ...)` / `"daydor_ops"` insert, not `tests.factories.insert` (which bypasses RLS and is
test-only).

---

## Sprint 0 — Foundations (Done)

- Model loader, DDL generator, platform roles, session context, RLS, grants (migrations 0001-0003)
- Reporting closure, employee directory, access + drift tests
- Postgres job queue, outbox, timers, business-day calendars (0005)
- Gate service: hard gates (DB-enforced maker-checker), write guards, soft-gate scaffolding (0006-0008)
- State-machine runner; the 6 flows as generated skeletons (0009-0010)
- Privacy services: `app.encrypt_pii`/`app.decrypt_pii`, purpose + consent registry, for
  `employee`'s 4 encrypted columns (0011)
- Hire flow step 1: `employee-record-writer` for `employee` + `employment_record` (0012), fixing
  finding 10 (PII columns must start NULL; consent needs the employee row to exist first)

---

## HIRE flow (Sprints 1-5)

Model steps: `position(R) → job_requisition(W) → approval_request(W) → job_posting(W) →
application(W) → screening_result(W, g_aedt) → interview(W) → offer(W, g_offer_band) →
background_check(W, g_bg_adverse) → employee(W) → employment_record(W) → consent_record(W,
dpdp_consent) → document(W) → work_authorization(W) → checklist_task(W) → identity_account(W) →
app_access_grant(W, g_it_offtemplate) → payroll_profile(W) → payslip(W)`

`employee`/`employment_record` done (Sprint 0). `job_profile`/`comp_band`/`access_role_template`
needed along the way are admin-entered (see above), seeded directly, not built as services.

### Sprint 1 — Workflow data-passing + requisition intake (Done)
- **Infra:** `WorkflowEngine._enter` now puts the instance's full `context` dict into every
  entered state's enqueued job payload (`job.payload["context"]`), not just `subject_id` — a
  generic engine fix, not hire-specific, so every future flow gets it for free.
- **Infra:** `src/daydor/adapters/` (an `Adapter`-style convention: a narrow Protocol + a Fake
  implementation per vendor) and `src/daydor/agents/` (a placeholder for the future agentic
  worker harness, not wired into anything yet — see its docstring).
- `position` (read: `confirm_budgeted_seat`, hire flow step 1)
- `job_requisition` writer (`open_requisition`, step 2) and `job_posting` writer
  (`job-posting-publisher`, step 4) in `src/daydor/hire/`
- `requisition-approval-router` (step 3) — thin; the gate check itself lives on the state
  transition (see finding 11 below)
- Hand-written `daydor.hire.workflow.HIRE_DEFINITION` (version 2 of `app.workflow_definition`,
  superseding the generated skeleton for steps 1-4) and `start_hire()`, the orchestration entry
  point
- **Exit criteria (met):** `tests/test_hire_requisition.py` opens a requisition against a real
  `position`, gets it budget-approved through the hard-gate machinery, and publishes a posting —
  driven end to end through `WorkflowEngine` + the real queue, not called directly.

**Two new findings this sprint surfaced** (see `docs/model-findings.md`):
- **Finding 11:** no gate in the model covers requisition budget sign-off. Added
  `g_requisition_budget` as a platform-defined hard gate (`daydor.gates.registry.
  PLATFORM_HARD_GATES`), and placed it on the *outgoing* transition of the approval-routing
  state rather than the generated skeleton's convention (gate on the transition *entering* a
  gated step) — the model's placement reads backwards for this gate (you want approval checked
  after drafting, before posting, not before routing is even allowed to start).
- **Finding 12:** `id` columns never carry an INSERT grant for any role, so a workflow
  instance's subject (fixed at `start()`) can't be a row whose id is allocated after the
  instance starts. `start_hire()` creates `job_requisition` (DB-generated id) *before* starting
  the instance against it; the position-check and requisition-draft steps run synchronously
  ahead of the instance and appear as pass-through states purely for the transition log's audit
  trail. Any later sprint with the same shape (a step before its row exists) needs this pattern.

Also fixed a real, previously-latent bug in `tests/conftest.py`'s `_recreate_database`: it never
passed the port to its admin connection, so on any Postgres setup using a non-default port (ours,
since PG16 runs on 5433 alongside this machine's existing PG14 on 5432) the "fresh test database"
was silently never being recreated — `alembic`'s already-applied-migration bookkeeping then
masked any edit to an already-applied migration's SQL. Harmless for purely additive migrations
(which is all that existed before this sprint), but it would have silently hidden real bugs going
forward. Fixed by passing `port=u.port`.

### Sprint 2 — Screening, interview, offer (Done)
- `application`/`candidate` writer (`candidate-screener`, step 5: `intake_application`) and
  `screening_result` writer (same worker, step 6: `score_application`), gated by `g_aedt` — the
  screener is a deterministic placeholder (`src/daydor/hire/screening.py`), always flagged as
  needing sign-off since it *is* an automated hiring tool
- `interview` writer (`interview-scheduler`, step 7)
- `offer` writer (`offer-letter-generator`, step 8), gated by `g_offer_band` when
  `proposed_base` falls outside the `comp_band`
- Hire workflow definition bumped to version 3 (`0015_hire_workflow_v3.sql`), extending Sprint
  1's graph through offer; `s04_job_posting` no longer auto-advances (see finding 13) --
  `daydor.hire.screening.submit_application` is the real trigger, once a candidate exists
- **Exit criteria (met):** `tests/test_hire_screening.py` applies, screens (parked on `g_aedt`
  until HR signs off), interviews, and offers; an out-of-band offer correctly parks on
  `g_offer_band` for founder approval, an in-band one completes without it.

**One real engine bug found and fixed** (not hire-specific — affects every flow):
`WorkflowEngine._move()` entered the new state using the *old* `inst.context` instead of the
freshly merged context from `fire(..., context_patch=...)`, so a `context_patch` passed on the
same call that advances past a state was silently invisible to that state's own `enter_jobs`.
Sprint 1 never exercised this path (none of its transitions patched context and had `enter_jobs`
in the same `fire()` call); Sprint 2's `candidate_screener_intake` → `candidate_screener_assess`
handoff was the first to need both at once, and failed with a `KeyError` until fixed. Logged as
finding 14.

**Also found:** g_aedt's approver role is `tenant_hr`, not `tenant_founder` (per the model) --
caught by a test that resolved it as the wrong role, not by guessing. Added an `hr_user` to the
`hire_org` test fixture.

### Sprint 3 — Background check, consent, documents
- `background_check` writer (background-check-initiator), gated by `g_bg_adverse`, mock
  background-check vendor adapter
- `consent_record` — employee-granted, gated by `dpdp_consent`; wire to the existing
  `daydor.privacy.pii` consent check so an accepted offer's consent capture is what unblocks PAN/
  bank/Aadhaar collection for the employee created in Sprint 0
- `document` writer (new-hire-doc-collector)
- **Exit criteria:** an adverse background-check finding correctly escalates; consent captured
  here is provably the same consent `app.encrypt_pii` checks.

### Sprint 4 — Work authorization, checklist, identity
- `work_authorization` writer (i9-e-verify-initiator), mock E-Verify adapter, 3-business-day timer
- `checklist_task` writer (onboarding-checklist-builder)
- `identity_account` writer (sso-identity-provisioner), mock IdP adapter
- **Exit criteria:** a new hire gets an onboarding checklist and an SSO identity; the I-9 clock is
  a real `app.timer` row.

### Sprint 5 — Access grant, payroll profile, first payslip
- `app_access_grant` writer (app-access-granter), gated by `g_it_offtemplate`
- `payroll_profile` writer (employee-record-writer) — tax residency, UAN or W-4
- `payslip` writer (payslip-issuer) — first cycle, mock bank adapter
- **Exit criteria: Hire is demoable end to end** — requisition → screening → offer → background
  check → consent/onboarding → access → first payslip, through domain services and the gate/
  queue/workflow machinery.

---

## PAYROLL flow (Sprints 6-9)

Model steps: `timecard/leave_balance/employment_record/statutory_rate_rule/pt_slab_rule/
garnishment_order/benefit_election(R) → payroll_run(W) → payroll_run(R, g_pay_anomaly) →
approval_request(A, g_pay_disburse) → payroll_run(W, disburse) → payslip(W) → payslip_line(W) →
gratuity_accrual_balance(W) → filing_record(W) → gl_journal_entry(W, g_close)`

**This is bigger than it looks.** Four of payroll's seven read-inputs are not admin-entered rows
sitting ready to read — they are themselves written by workers nobody has built yet, and one of
those exposes a real gap (finding 9) that blocks it. Chasing this down is the main correction in
this revision; see Sprint 6 below.

### Sprint 6 — Payroll's own prerequisites: leave accrual, timecards, benefit elections
- `pto-accrual-calculator`: writes `leave_balance`. Without this, "leave_balance(R)" in the payroll
  flow has nothing real to read.
- `time_punch` is employee self-entered directly (table grant `E: WRITE`, same self-service
  pattern as `consent_record` — no service needed). `punch-validator` turns punches into
  `timecard` rows.
- **Resolves finding 9:** `timecard-approval-router` needs a manager-approval gate that doesn't
  exist in the model yet. Add `g_timecard` (and, while here, `g_expense` for the same reason on
  the expense side) to the gate registry with `tenant_manager` as approver — a hand-written
  registry addition, same style as the `approval_request` extensions already in
  `model/extensions.json`. **Push both back into the artifact**, same as finding 10's columns.
- `election-processor`: `benefit_election`, employee self-service (`E: WRITE`), simple.
- **Exit criteria:** an employee can punch time, have it validated into a timecard, get it
  manager-approved through a real gate (not a bypass), accrue leave, and elect a benefit —
  everything Sprint 7's payroll math will read.

### Sprint 7 — Jurisdiction packs & deterministic tax computation
- This is `docs/backend-plan.md` component 8, not yet started at all. `statutory_rate_rule`/
  `pt_slab_rule` are admin-entered (by `daydor_ops`, globally) — Sprint 7 is about writing the
  computation that reads them, not about writing the rows.
- `tax-withholding-calculator`, `garnishment-processor`, `gross-pay-calculator` → `payslip_line`
- Scope the tax logic explicitly as **illustrative** (correct shape, not certified statutory
  compliance) for one India case (PT slab + basic TDS) and one US case (federal + one state
  withholding) — real jurisdiction coverage is its own ongoing effort, not a one-sprint deliverable.
- **Exit criteria:** gross-to-net computes correctly for a hand-checked India employee and a
  hand-checked US employee, pulling real rates from `statutory_rate_rule`/`pt_slab_rule`, not
  hardcoded numbers.

### Sprint 8 — Payroll run, anomaly gate, disbursal
- `payroll-run-builder`: ties Sprints 6-7 together into `payroll_run` + `gratuity_accrual_balance`
- `payroll-anomaly-detector`: soft gate `g_pay_anomaly` in shadow mode (logs to
  `app.gate_evaluation`, always escalates, per the existing fail-closed rule)
- `g_pay_disburse` hard gate (founder approval) + `direct-deposit-disburser` (mock bank adapter),
  using the existing `app.gate_guard` guarded-write pattern
- `payslip-issuer`
- **Exit criteria:** disbursal is provably impossible without an approved `g_pay_disburse`
  request.

### Sprint 9 — Filings and GL
- `tax-filing-submitter`: `filing_record` (ECR, 24Q, 941, W-2, state UI...), mock adapter
- `gl-poster`: `gl_journal_entry`, gated by `g_close`, mock GL adapter
- **Exit criteria: Payroll is demoable end to end** — accrue/punch/elect → compute → anomaly
  screen → founder-approve → disburse → file → post to GL.

---

## EXIT flow (Sprints 10-11)

Model steps: `termination(W) → legal_hold(R, g_legalhold) → checklist(W) → identity_account(W,
g_it_deprov) → device_assignment(W) → leave_balance/gratuity_accrual_balance(R) →
final_settlement(W, g_finalpay) → approval_request(A, g_pay_disburse) → final_settlement(W,
disburse) → cobra_event(W, g_cobra) → vesting_event(R) → termination(W) → employee(W)`

`legal_hold` is admin-entered (`tenant_hr`/`tenant_founder` direct write, see above — no service
needed, just a real row to check against). `vesting_event` is read-only here and may legitimately
be empty (equity/vesting is written by Merit's backlogged `grant-drafter`/`vesting-schedule-
tracker`) — treat an employee with no equity as a normal case, not a bug.

### Sprint 10 — Termination intake, holds, deprovisioning
- `termination` writer (HR admin-initiated)
- Legal-hold check (`g_legalhold`) before anything else proceeds
- `checklist` writer (termination-checklist-builder)
- `identity_account`/`app_access_grant` revocation (deprovisioning-agent), gated by `g_it_deprov`
- `device_assignment` writer (equipment-return-tracker)
- **Exit criteria:** a termination under an active legal hold is provably blocked from IT
  deprovisioning until the hold is cleared.

### Sprint 11 — Final settlement, COBRA, close-out
- `final-pay-calculator`: reads `leave_balance` + `gratuity_accrual_balance` (both real by now,
  from Sprint 6), writes `final_settlement`, gated by `g_finalpay` then `g_pay_disburse` (reuses
  Sprint 8's disbursal pattern, not rebuilt)
- `cobra-trigger-detector`: `cobra_event`, gated by `g_cobra` (US only)
- `vesting-schedule-tracker` (read, may be empty), `rehire-eligibility-flagger`, final `employee`
  close-out (`is_active = false`, `date_of_exit`)
- **Exit criteria: Exit is demoable end to end** — terminate, verify holds, deprovision, settle
  final pay with founder approval, trigger COBRA where applicable.

---

## Cross-cutting hardening (Sprints 12-13)

### Sprint 12 — Grants, constraints, CI
- Narrow `agent_runtime` into per-domain agent roles (finding 3), using the worker → domain map
  that now actually exists from Sprints 1-11
- **Decide finding 2** (employee self-write scope — should HR-owned fields like
  `department_id`/`position_id`/`date_of_exit` stay employee-writable?): this is a product/security
  call, not mine to make silently; bring it to you here with a concrete recommendation
- Enum value lists in the model → generated CHECK constraints (finding 5)
- CI: `alembic upgrade head` + `pytest` against Postgres 16 on every push

### Sprint 13 — Ops scoping, aggregate views, remaining timers, Jev shadow report, model sync
- `daydor_ops` → assigned-tenant table + RLS check (finding 6)
- Aggregate-only (k ≥ 5 suppression) views for level-1 access, starting with EEO-1 (finding 7)
- Remaining statutory timers not already covered: COBRA follow-ups, 409A staleness, work-
  authorization/certification expiry, threshold-crossing deadlines
- Jev shadow-mode comparison report: for every soft gate run in shadow mode so far (`g_aedt`,
  `g_pay_anomaly`), compare `app.gate_evaluation.model_decision` against the human's actual
  decision, so there's real data whenever Jev access becomes available
- **Model artifact sync:** push every local deviation back into `model/source_artifact.html` and
  re-export, in one pass, now that they've all stabilized: finding 1's `approval_request` columns,
  finding 10's nullable PII columns, Sprint 6's `g_timecard`/`g_expense` gates, and whatever Sprint
  12 decides for finding 2. Doing this once, after things settle, beats touching the artifact
  every sprint.

---

## Backlog (after Exit ships; re-prioritize then)

- **Erasure flow** (DPDP data-subject request): anonymize what's erasable, hold what statute
  requires, prove it
- **Merit flow** (comp cycle): review cycle → ratings → calibration → comp-band-validated
  compensation events → new effective-dated `employment_record`, gated by `wage_structure_change`
  and `g_409a` for equity (this is also what eventually populates real `vesting_event` data)
- **Threshold-crossing flow**: headcount crosses a statutory scheme threshold → obligation
  registered → founder-approved → filed, before the deadline
- **Webhook inbox** (component 10): every adapter is a synchronous in-process mock through Sprint
  13, so nothing has needed an inbound-callback path yet. Build it when a real vendor integration
  (the first one that calls back async — e.g. a background-check result or a bank disbursal
  confirmation) actually replaces a mock.

---

## Open risks to revisit as we go

- The hire-flow hand-written definition (Sprint 1) sets the pattern every later flow definition
  follows — worth reviewing carefully before Sprint 2, since mistakes there compound.
- Mocked adapters mean none of this is tested against real vendor failure modes (rate limits,
  partial failures, auth expiry). Flag clearly in each sprint's PR description.
- `g_pay_disburse` appears in both Payroll (Sprint 8) and Exit (Sprint 11) — Sprint 8 builds the
  reusable guarded-disbursal pattern once, Sprint 11 reuses it.
- Sprint 7's tax computation is explicitly illustrative, not compliance-grade — don't let it get
  mistaken for certified payroll tax logic in a demo.

---

## What changed from v1 (after re-reading backend-plan.md / model-findings.md)

- **Payroll grew from 3 sprints to 4.** The original plan assumed `timecard`, `leave_balance` and
  `benefit_election` were just rows to read; checking the model's `writers` lists showed
  `leave_balance` and `timecard` are themselves worker-written, and `timecard`'s approval step
  depends on finding 9 (no gate models the manager as approver) — a real blocker, not a nice-to-
  have, so it's now Sprint 6 instead of hardening-sprint backlog.
- **Jurisdiction packs (component 8) got its own sprint** (7) instead of being folded silently into
  "payroll run compute" — it's real tax-computation work, not data plumbing.
- **Finding 4 resolved as "no work needed," explicitly documented** — the 18 writerless tables
  already have direct grants to human roles; only the demo-seeding convention changes.
- **Finding 2 moved from unstated to an explicit decision point** in Sprint 12, since it's a real
  open product/security question, not something to guess silently.
- **Added a model-artifact-sync pass** (Sprint 13) consolidating findings 1, 9, 10 and whatever
  Sprint 12 decides for finding 2, instead of leaving "push back into the artifact" as a vague,
  never-scheduled line item.
- **Added "webhook inbox" to backlog** (component 10's other half, alongside adapters) — not
  needed while every adapter is a synchronous mock, but it's a real gap once one isn't.
