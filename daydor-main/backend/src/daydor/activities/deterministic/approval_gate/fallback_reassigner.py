"""fallback_reassigner activity.

Write-class: deterministic - plain Python, no LLM, automatic retries.
Trigger: the second (grace-period) timer in ApprovalGateEscalationWorkflow
elapses with the gate still pending.

Reassigns an unresolved approval gate to its configured fallback approver:
sets `ApprovalRequest.status = ESCALATED`, `escalated_at`, and
`fallback_approver_user_id`. The fallback approver is supplied by the
calling workflow's input, not read from tenant config here - gate-type ->
fallback-approver policy is a caller concern.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class ReassignmentRequest:
    tenant_id: uuid.UUID
    approval_request_id: uuid.UUID
    fallback_approver_user_id: uuid.UUID


@activity.defn
async def reassign_to_fallback_approver(request: ReassignmentRequest) -> None:
    """Reassign an unresolved approval gate to its configured fallback
    approver. No-op if the gate was resolved before this ran."""
    raise NotImplementedError
