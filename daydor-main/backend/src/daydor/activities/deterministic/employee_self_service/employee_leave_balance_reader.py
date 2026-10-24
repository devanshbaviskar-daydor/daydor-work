"""employee_leave_balance_reader activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee opens the Leave screen on the Employee Self-Service
Portal, or `employee_qa_agent` asks a leave-balance question on their
behalf.

Pure read over the already-merged Leave & Attendance domain's `LeaveBalance`
table, scoped to the caller's own `employee_id`. No new data model: this
worker reads the existing `LeaveBalance` rows `leave_accrual_calculator`
maintains, it does not write or derive anything. Must be called only with
an `employee_id` that `self_service_scope_guard` has already cleared for
the active session - this worker does not re-check scope itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance


@dataclass
class LeaveBalanceQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""


@activity.defn
async def read_employee_leave_balance(query: LeaveBalanceQuery) -> LeaveBalance | None:
    """Return `query.employee_id`'s most recent `LeaveBalance` row (by
    `as_of_period`), or `None` if none exists yet. Read-only: never mutates
    a `LeaveBalance`, and never reads another employee's balance - callers
    must pass an `employee_id` already cleared by
    `self_service_scope_guard`."""
    raise NotImplementedError
