"""leave_balance_checker activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `leave_request_drafter` while drafting a `LeaveRequest`.

Flags whether a draft `LeaveRequest`'s date range exceeds the employee's
current `LeaveBalance` for its `leave_type`. Informational only - a manager
may still approve a request that fails this check as unpaid leave (Domain
4.2) - so this worker never blocks or rejects a request itself, only sets
the sufficiency flag the manager sees at `leave_approval_gate`. Fixed
arithmetic over already-known inputs - no LLM judgment.
"""

from __future__ import annotations

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance, LeaveRequest


@activity.defn
async def check_leave_balance(request: LeaveRequest, balance: LeaveBalance) -> bool:
    """Return whether `balance` covers `request`'s requested days for its
    `leave_type`. Informational: the caller sets `LeaveRequest.balance_sufficient`
    from this result but it never blocks approval - a manager may still
    approve a balance-insufficient request as unpaid leave."""
    raise NotImplementedError
