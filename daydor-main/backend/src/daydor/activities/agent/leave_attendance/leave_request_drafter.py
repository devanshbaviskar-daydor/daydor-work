"""leave_request_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an employee submits a free-text or structured leave request.

Turns a free-text or structured leave request into a structured
`LeaveRequest` draft (`pending_manager_review`) for manager review,
including a balance check against the employee's current `LeaveBalance`.
Read-only/draft by construction: this worker never approves a request or
deducts leave balance itself - approval is `leave_approval_gate`'s job and
debiting is `leave_balance_debiter`'s, both downstream of this draft.

The balance check populates `LeaveRequest.balance_sufficient`, delegated to
`leave_balance_checker` so the sufficiency rule lives in one deterministic
place rather than being re-derived by the agent.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance, LeaveRequest


@dataclass
class LeaveRequestInput:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    request_text: str


@activity.defn
async def draft_leave_request(
    request: LeaveRequestInput, current_balance: LeaveBalance
) -> LeaveRequest:
    """Draft a `LeaveRequest` (status `pending_manager_review`) from a
    free-text or structured leave request, with `balance_sufficient` set via
    `leave_balance_checker` against `current_balance`. Never sets status to
    approved/rejected and never mutates `current_balance`."""
    raise NotImplementedError
