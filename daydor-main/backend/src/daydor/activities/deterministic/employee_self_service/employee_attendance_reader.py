"""employee_attendance_reader activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee opens the Attendance screen on the Employee
Self-Service Portal, or `employee_qa_agent` asks an attendance question on
their behalf.

Pure read over the already-merged Leave & Attendance domain's
`AttendanceRecord` table, scoped to the caller's own `employee_id`. No new
data model: this worker reads the existing `AttendanceRecord` rows ops
enters manually, it does not write or derive anything. Must be called only
with an `employee_id` that `self_service_scope_guard` has already cleared
for the active session - this worker does not re-check scope itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import activity

from daydor.models.leave_attendance import AttendanceRecord


@dataclass
class AttendanceQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""
    date_from: date
    date_to: date


@activity.defn
async def read_employee_attendance(query: AttendanceQuery) -> list[AttendanceRecord]:
    """Return `query.employee_id`'s `AttendanceRecord` rows between
    `query.date_from` and `query.date_to` inclusive, ordered by date.
    Read-only: never mutates an `AttendanceRecord`, and never reads another
    employee's attendance - callers must pass an `employee_id` already
    cleared by `self_service_scope_guard`."""
    raise NotImplementedError
