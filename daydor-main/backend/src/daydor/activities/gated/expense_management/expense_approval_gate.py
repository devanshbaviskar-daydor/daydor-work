"""expense_approval_gate activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: the claim's manager (below `manager_approval_threshold`) or the
founder (above it, including above `founder_approval_threshold`'s stricter
founder-only tier), or the configured fallback approver on timeout,
resolves the `ApprovalRequest` opened for a submitted `ExpenseClaim`.

Applies a resolved manager/founder approval or rejection decision to an
`ExpenseClaim`: sets `status` to `approved` or `rejected`. Approver tier is
amount-based, not role-based like `leave_approval_gate`'s manager-only gate
- a claim flagged `requires_manager_approval` by `policy_threshold_validator`
routes to the employee's manager (`ApproverRole.MANAGER`); a claim whose
`amount` exceeds the category rule's `founder_approval_threshold` routes to
the founder (`ApproverRole.FOUNDER`) instead, since this is an operational,
non-statutory gate on company money, same tiering distinction Payroll's own
gates draw between day-to-day and founder-level decisions. No response
escalates after 24-48 hours (captain decision, 2026-10-20), matching Leave &
Attendance's `ApprovalGateEscalationWorkflow` timeout pattern - consistent
timing for structurally similar operational, non-statutory gates. A
rejected claim never reaches `reimbursement_batch_builder`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.expense import ExpenseClaim, ExpenseClaimStatus


@dataclass
class ExpenseApprovalDecision:
    tenant_id: uuid.UUID
    expense_claim_id: uuid.UUID
    approval_request_id: uuid.UUID
    decision: ExpenseClaimStatus
    idempotency_key: str


@activity.defn
async def apply_expense_approval_decision(decision: ExpenseApprovalDecision) -> ExpenseClaim:
    """Apply a resolved manager/founder (or fallback-approver) decision to
    the `ExpenseClaim` named by `decision.expense_claim_id`, setting its
    status to `decision.decision` (`approved` or `rejected`).
    Idempotency-keyed against a retried approval signal; no automatic retry
    on failure."""
    raise NotImplementedError
