"""leave_balance_debiter activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: `leave_approval_gate` applies an `approved` decision to a
`LeaveRequest`.

Deducts an approved `LeaveRequest`'s date-range days from the employee's
current `LeaveBalance` for its `leave_type`. Idempotency-keyed against a
retried approval signal: a retry for a `LeaveRequest` already debited
updates nothing further rather than double-deducting it. Unpaid leave
(`LeaveType.UNPAID`) debits no balance - it exists precisely for the case
where `leave_balance_checker` flagged insufficient balance but the manager
approved anyway (Domain 4.2). Fixed arithmetic over already-known inputs -
no LLM judgment.
"""

from __future__ import annotations

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance, LeaveRequest


@activity.defn
async def debit_leave_balance(
    request: LeaveRequest, balance: LeaveBalance, idempotency_key: str
) -> LeaveBalance:
    """Deduct `request`'s requested days from `balance` for `request.leave_type`
    and return the updated `LeaveBalance`. Idempotent on `idempotency_key`: a
    retried approval signal for a request already debited returns the
    existing balance unchanged rather than deducting twice.
    `LeaveType.UNPAID` requests debit nothing.
    """
    raise NotImplementedError
