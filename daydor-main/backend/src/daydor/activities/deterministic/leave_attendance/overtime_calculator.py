"""overtime_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after a period's `AttendanceRecord`s are finalized, once
`leave_policy_resolver` has resolved the applicable `LeavePolicyRule`.

Computes overtime hours and amount for one employee over a period per
Karnataka's actual rule: hours beyond `policy.daily_hours_threshold` per day
(a daily trigger, not a 40-hour weekly US-style cap), paid at
`policy.overtime_multiplier`, with `policy.overtime_quarterly_cap_hours`
left unenforced for v1 (captain decision, Domain 4.1). Fixed-formula
arithmetic - no LLM judgment. Feeds Payroll's wage calculation.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from temporalio import activity

from daydor.models.leave_attendance import AttendanceRecord, LeavePolicyRule


@dataclass
class OvertimeResult:
    employee_id: uuid.UUID
    period_start: date
    period_end: date
    overtime_hours: Decimal
    overtime_amount: Decimal


@activity.defn
async def calculate_overtime(
    employee_id: uuid.UUID,
    period_start: date,
    period_end: date,
    attendance_records: list[AttendanceRecord],
    policy: LeavePolicyRule,
    hourly_rate: Decimal,
) -> OvertimeResult:
    """Compute overtime hours and amount for one employee over a period.

    Per-day overtime is `max(0, hours_worked - policy.daily_hours_threshold)`
    for each `AttendanceRecord` in `attendance_records`, summed across the
    period and paid at `hourly_rate * policy.overtime_multiplier`. This is
    Karnataka's daily 9-hour trigger, not a weekly 40-hour US-style
    threshold - `policy.weekly_hours_threshold` exists in the rule but is
    not the overtime trigger for v1. `policy.overtime_quarterly_cap_hours`
    is not applied even when populated, per Domain 4.1's captain decision to
    leave the quarterly cap unenforced for v1.
    """
    raise NotImplementedError
