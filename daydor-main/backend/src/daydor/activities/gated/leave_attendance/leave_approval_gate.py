"""leave_approval_gate activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: the employee's manager (or, on timeout, the configured fallback
approver) resolves the `ApprovalRequest` opened for a balance-checked
`LeaveRequest`.

Applies a resolved manager approval/rejection decision to a `LeaveRequest`:
sets `status` to `approved` or `rejected`. The approver is the employee's
manager (`ApproverRole.MANAGER`), not the founder - a day-to-day operational
decision (team coverage, fairness), not a legal or money-movement one
(Domain 4.3). No automatic 1-hour escalation: this gate's
`ApprovalGateEscalationWorkflow` instance is started with a 24-48 hour
`first_timeout_seconds` (captain decision, Domain 4.3) rather than the
universal 1-hour pattern, since a late leave approval has no statutory
urgency. A rejected request never reaches `leave_balance_debiter`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.leave_attendance import LeaveRequest, LeaveRequestStatus


@dataclass
class LeaveApprovalDecision:
    tenant_id: uuid.UUID
    leave_request_id: uuid.UUID
    approval_request_id: uuid.UUID
    decision: LeaveRequestStatus
    idempotency_key: str


@activity.defn
async def apply_leave_approval_decision(decision: LeaveApprovalDecision) -> LeaveRequest:
    """Apply a resolved manager (or fallback-approver) decision to the
    `LeaveRequest` named by `decision.leave_request_id`, setting its status
    to `decision.decision` (`approved` or `rejected`). Idempotency-keyed
    against a retried approval signal; no automatic retry on failure."""
    raise NotImplementedError
