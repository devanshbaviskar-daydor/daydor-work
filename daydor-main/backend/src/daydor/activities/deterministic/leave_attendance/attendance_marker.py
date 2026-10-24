"""attendance_marker activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: manual ops attendance entry for v1 (Domain 4.4 captain decision -
no biometric/swipe integration yet), and approved-leave records landing for
a given date.

Records one employee's attendance status for one calendar day and owns the
attendance/leave lock-state transition that Payroll's `wage_calculator`
reads as an input - this domain owns that lock, not Payroll (captain
decision, Domain 4.2). Fixed, schema-driven write - no LLM judgment.
"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from temporalio import activity

from daydor.models.leave_attendance import AttendanceRecord, AttendanceStatus


@activity.defn
async def mark_attendance(
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    date_: date,
    status: AttendanceStatus,
    hours_worked: Decimal,
) -> AttendanceRecord:
    """Record one employee's attendance for one day and advance the
    attendance/leave lock state for that day.

    Idempotent on `(employee_id, date_)`: a retry or correction for a day
    already recorded updates that same row rather than inserting a
    duplicate. Locking the day (so `wage_calculator` can safely read it as a
    finalized input) is this activity's responsibility, not Payroll's.
    """
    raise NotImplementedError
