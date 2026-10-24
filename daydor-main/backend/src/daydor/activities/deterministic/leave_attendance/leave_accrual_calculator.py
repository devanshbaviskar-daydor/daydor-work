"""leave_accrual_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: periodic accrual run (e.g. monthly), once `leave_policy_resolver`
has resolved the applicable `LeavePolicyRule` for the period.

Computes linear earned/casual/sick leave accrual for one employee for one
period and upserts the result into `LeaveBalance`. Fixed-formula
arithmetic - no LLM judgment. Idempotent per `(employee_id, as_of_period)`:
a retry for a period already accrued updates that same row rather than
double-crediting it.
"""

from __future__ import annotations

import uuid
from datetime import date

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance, LeavePolicyRule


@activity.defn
async def calculate_leave_accrual(
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    as_of_period: date,
    policy: LeavePolicyRule,
    prior_balance: LeaveBalance | None,
    days_worked_since_joining: int,
) -> LeaveBalance:
    """Compute this period's EL/CL/SL accrual and upsert `LeaveBalance`.

    Earned leave accrues only once `days_worked_since_joining` meets
    `policy.earned_leave_eligibility_days`, at
    `policy.earned_leave_days_per_period` per period, and the resulting
    earned-leave balance is capped at `policy.earned_leave_carry_forward_cap`
    - any accrual that would exceed the cap is not credited, per Domain 4.1.
    Casual and sick leave accrue up to their respective
    `casual_leave_days_per_year`/`sick_leave_days_per_year` entitlements and
    lapse rather than carry forward, per Domain 4.1.

    Idempotent upsert: a retry for the same `(employee_id, as_of_period)`
    recomputes and overwrites that period's row rather than accruing on top
    of it.
    """
    raise NotImplementedError
