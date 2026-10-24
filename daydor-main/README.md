# daydor

Daydor is a managed HR, payroll, and statutory-compliance service for Indian
companies with roughly 8-25 employees. A small Daydor ops team, backed by
narrow AI agents and deterministic compliance engines, runs the full employee
lifecycle - hiring, onboarding, payroll, and statutory filings - on behalf of
each company. The founder approves anything involving money, a government
filing, or a change to a person's record, except day-to-day operational
decisions like leave approval, which go to the requesting employee's
manager.

## Runtime stack

- **Temporal** orchestrates every workflow: approval gates, timers, and
  irreversible actions all need durable execution that survives process
  restarts and lets a human approval arrive asynchronously, sometimes hours
  after a workflow started.
- **LangGraph** implements agent steps, confined to read-only/draft work and
  run only inside Temporal activities. An agent step never performs a write
  directly - it drafts output for a human or a deterministic activity to act
  on.
- **Postgres** holds all state, with `tenant_id` required on every table from
  day one (see Tenancy below).
- **MCP servers** front the external systems Daydor's workers need: Core HR
  records, payroll inputs (attendance, leave, salary structure), and a
  document vault for statutory filings and other compliance documents.

## Write-class tiers

Every write in Daydor falls into exactly one of three tiers, each a distinct
kind of Temporal activity with its own retry semantics:

| Tier | What it is | Retries | Example |
| --- | --- | --- | --- |
| **deterministic** | Plain Python Temporal activity, no LLM | Automatic | Wage, PF, ESI, PT, TDS calculators |
| **agent (read-only/draft)** | Temporal activity wrapping a short LangGraph run, schema-checked output | Automatic (it's still read-only) | Drafting a compliance checklist or a filing payload for review |
| **gated irreversible** | Separate Temporal activity, runs only after a human-approval Temporal signal, idempotency-keyed | None - a failure needs a human to look, not a retry | Salary disbursement, statutory filing submission |

The split exists because these three kinds of work fail differently. A
deterministic calculation failing mid-run is safe to retry. An agent draft
failing is safe to retry too - nothing happened yet. A gated action failing
partway through a bank transfer or a government filing is not safe to retry
blindly; it needs an idempotency key and a human looking at the outcome.

## Domains in this pass

This scaffold stubs out the first three domains, in priority order:

1. **Headcount Threshold Monitor** - tracks employee count against India's
   10-employee (ESI, Gratuity Act, mandatory POSH Internal Committee) and
   20-employee (EPF) legal thresholds. This is the product's core
   differentiator: no competitor demoed (Keka, greytHR) could explain or
   monitor these thresholds. Also watches `deadline_at` on approved
   registration `ApprovalRequest` rows and escalates before the statutory
   filing deadline is breached.
2. **Payroll & Statutory Compliance** - wage calculation, PF/ESI/PT/TDS
   computation and filing, and salary disbursement. Split into two
   sub-orchestrators, Payroll (wage calc + disbursal) and Compliance
   (filings, thresholds, registrations), because they fail differently: a
   wage error is caught before disbursal, while a missed filing deadline is a
   penalty that has already happened.
3. **Onboarding** - the cross-domain conductor for a hire event. It owns no
   data itself; it sequences calls into Core HR, Headcount Threshold
   Monitor, and Payroll & Compliance.

Alongside these, **Offboarding** is stubbed as a cross-domain conductor for
the exit flow (access removal, asset return, and a founder-approved final
settlement), following the same pattern as Onboarding. It owns the
`FinalSettlement` record but otherwise sequences calls into other domains,
reusing Payroll & Compliance's `salary_disbursement` worker for payout.

**Leave & Attendance** was moved into v1 scope on 2026-10-20 following a
business-logic gap audit. It owns leave accrual (`LeaveBalance`,
state-law-keyed `LeavePolicyRule`), leave requests, and daily attendance
(`AttendanceRecord`), and computes overtime against Karnataka's daily
9-hour-threshold rule rather than a weekly US-style cap. It owns the
attendance/leave lock-state that Payroll's `wage_calculator` reads as a
finalized input, not Payroll. v1 attendance entry is manual ops entry only -
no biometric/swipe integration yet.

**Recruitment & Applicant Tracking** was moved into v1 scope on 2026-10-20
following a business-logic gap audit against the co-founder's repo. It owns
`JobRequisition` (idempotent per `Position`), tenant-scoped `CompBand` (a
per-company decision, unlike statutory PT/EPF rates), the
`Candidate`/`Application` pipeline through screening, and the
offer-through-hire-handoff stage - `Offer` comp-band enforcement, the
mandatory appointment letter, background checks, and hire confirmation.
`requisition_opener` surfaces a read-only heads-up against the Headcount
Threshold Monitor's existing `ThresholdObligation` rows - no new gate or
write-path. `Candidate.retention_deadline` is DPDP's 180-day candidate-data
clock, started from rejection/inactivity rather than application date, and
enforced by `candidate_data_retention_sweeper` with a 48-hour pre-erasure
notice. A background check requires its own DPDP consent from the candidate
(`background_check_consent_gate`), kept as a separate `ConsentRecord` from
any post-hire consent the same person grants later as an employee. The
mandatory written appointment letter (Industrial Relations Code and OSH
Central Rules 2026, effective 21 Nov 2025) is drafted by
`appointment_letter_generator` for founder/ops review; delivery to and
acceptance by the candidate is a separate, deferred mechanism to be resolved
alongside the Employee Self-Service Portal's design.

**Expense Management** was moved into v1 scope on 2026-10-20 following a
business-logic gap audit against the co-founder's repo, and was designed
from first principles since neither reference repo had usable logic here.
It owns `ExpenseClaim` drafting, receipt extraction, versioned/effective-dated
`ExpenseCategoryRule` resolution, policy-threshold flagging (manager vs.
founder approval, missing-receipt), the amount-based `expense_approval_gate`,
and assembling approved claims into a `ReimbursementBatch`. Reimbursement
feeds directly into the next `PayrollRun` (captain decision, Option A,
2026-10-20) rather than an independent disbursement path, reusing Payroll &
Compliance's `salary_disbursement` worker. Leave Travel Allowance is out of
scope here - it is a payroll allowance against the employee's declared tax
regime, not a receipt-backed reimbursement.

**Benefits Administration** was also moved into v1 scope on 2026-10-20
following the same business-logic gap audit. It owns a closed catalog of
voluntary group benefits scoped to what's actually common at an 8-25
employee SME (`BenefitPlan`, `BenefitCostSplitRule` - Group Mediclaim, Group
Personal Accident, Group Term Life only; meal vouchers stay a CTC-structuring
choice under `EmploymentRecord.other_allowances_json`, not an election) and
each employee's enrollment (`BenefitElection`). v1 is internal tracking
only - no API integration with a benefits broker/insurer platform.

**Employee Self-Service Portal**, the fifth and final domain moved into v1
scope on 2026-10-20, closes out that business-logic gap audit. Its
magic-link authentication scaffold landed first as a prerequisite (PR #19):
magic-link only, scoped narrowly to `UserRole.EMPLOYEE_SELF_SERVICE`
(`backend/src/daydor/models/ess_auth.py`) - founder/ops/admin logins are
out of scope and have no session mechanism of their own yet.
`request_magic_link` and `verify_magic_link` never reveal whether a given
email matched a user, and a `MagicLinkToken` is single-use and stores only
its hash, never the raw token. Every Portal worker resolves "who is
asking" via `session_validator` rather than a request parameter, since a
request parameter is attacker-controlled. Token delivery is email only
(SMS deferred, captain decision, 2026-10-20) and has no transactional-email
provider wired up yet.

The Portal's own workers (read-only `employee_attendance_reader`,
`employee_leave_balance_reader`, `employee_payslip_reader`,
`employee_document_reader`, and the `employee_qa_agent`) are scoped per
request by `self_service_scope_guard` to the asking employee's own
records. Profile changes split into three write paths by consequence, not
data sensitivity alone (Domain 6.2, `daydor.models.ess_profile`):
direct-write fields (personal address, emergency contact, marital status,
`tax_regime_election`) are applied immediately by `profile_field_writer`
with no gate; DPDP-sensitive fields (Aadhaar last-4/e-KYC reference, PAN)
go through `profile_update_drafter` into a `ProfileFieldChangeRequest` ops
review queue, not an `ApprovalRequest` gate; and bank-detail changes are
gated irreversible - `bank_detail_change_drafter` drafts a
`BankDetailChangeRequest` that `bank_detail_verification_gate` applies only
after self-service OTP/micro-deposit verification resolves its linked
`ApprovalRequest`. That gate reuses the cross-domain `ApprovalRequest`
mechanism via a new `ApproverRole.EMPLOYEE_SELF`, which resolves
automatically rather than through a human approver, for consistency with
every other gated action (captain decision, 2026-10-20).

## Integration circuit breakers

Each MCP integration (`core_hr`, `payroll_inputs`, `document_vault`) has its
own closed/open/half-open circuit breaker, tracked in
`daydor.models.integration.IntegrationCircuitBreakerState` - a dedicated
table, not a `TenantComplianceConfig.settings_json` entry, since this is
shared infra state protecting the integration itself rather than a
per-tenant preference. Five consecutive failures opens the breaker for 60
seconds by default, after which a single probe call is allowed through. See
`backend/src/daydor/mcp/circuit_breaker.py` for Daydor's own implementation of the
state machine; it is not a port of any third-party or shared component.

## Tenancy

Daydor runs as a managed service today - Daydor's own ops team operates it
for each design-partner company, not self-serve. The data layer is
multi-tenant-ready from day one regardless (`tenant_id` required on every
table), since self-serve SaaS is the likely later direction and retrofitting
tenancy into an existing schema is far more expensive than building it in
from the start.

## Approval gates

A gated-irreversible activity runs only after a human-approval Temporal
signal. Timeout escalation is two-stage and driven by
`ApprovalGateEscalationWorkflow` (`backend/src/daydor/workflows/approval_gate/orchestrator.py`):
if the assigned approver doesn't respond within the first timeout, relevant
parties are notified without changing who may resolve the gate; if it's
still unresolved after a further grace period, the gate is reassigned to a
fallback approver rather than queuing indefinitely.

## Data residency

Temporal Cloud India regions only: Mumbai as primary, Hyderabad (`ap-south-2`)
as standby for multi-region failover. No Aadhaar, PAN, or bank payload should
require leaving India. See `docs/local-dev.md` for the intended local
development configuration.

## Record retention

Five statutory/record retention clocks apply, each anchored to a different
date: TDS (~8 years from filing), PF (7 years from record creation,
captain-confirmed), ESI (5 years from last-entry date), Gratuity (service
period + 3 years from exit date), and Expense Receipts (8 years from record
creation, a provisional figure pending primary-source verification). See
`daydor.models.compliance.RETENTION_POLICIES` for the authoritative table.

Temporal Cloud's own workflow-history retention window is shorter than the
longest of these floors, so `backend/src/daydor/archival/pipeline.py` holds a
placeholder for the scheduled export pipeline that will move completed
workflow histories to longer-term, India-resident storage before they
expire. `backend/src/daydor/archival/cold_storage.py` is a separate, structural
placeholder for archiving aged-out Postgres table rows (audit log, payroll
runs, payslips) into same-instance cold-storage tables once they leave the
hot partition but are still inside their retention floor.

## Status

This is a skeleton pass: directory structure, typed stubs, and interfaces
only. No calculators, no agent logic, and no MCP server implementation are
implemented yet.

See `docs/local-dev.md` for local setup.
