"""Leave accrual, attendance, and overtime models. Placeholder schema only."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel

from daydor.models.base import TenantScopedModel


class LeavePolicyRule(BaseModel):
    """Versioned, effective-dated leave and overtime policy rule, keyed by
    state_code - not tenant-scoped, like PtSlabRule/EpfRateRule, since
    India's Shops & Establishments Acts and overtime rules are legislated
    per state rather than per employer. Only Karnataka ("KA") is populated
    for v1. A rule change is a new row with a new `effective_from`, never an
    edit to an existing one, so a past period always recomputes against the
    slab that was actually in force then - see Domain 4.1's note that the
    Labour Codes' OSH rules may change the eligibility threshold and
    overtime cap, and this table is how that lands without touching history.

    `overtime_quarterly_cap_hours` stays null/unenforced for v1 (captain
    decision, 2026-10-20): Karnataka's own OSH state rules are still in
    draft, so the unconfirmed national 144-hour figure is not hard-coded.
    """

    state_code: str
    effective_from: date
    effective_to: date | None = None

    earned_leave_days_per_period: Decimal
    earned_leave_eligibility_days: int
    earned_leave_carry_forward_cap: int
    casual_leave_days_per_year: int
    sick_leave_days_per_year: int

    daily_hours_threshold: Decimal
    weekly_hours_threshold: Decimal
    overtime_multiplier: Decimal
    overtime_quarterly_cap_hours: Decimal | None = None


class LeaveBalance(TenantScopedModel):
    """One employee's leave balances as of a given period, updated by
    `leave_accrual_calculator` as an idempotent upsert per period."""

    employee_id: uuid.UUID
    as_of_period: date
    earned_leave_balance: Decimal
    casual_leave_balance: Decimal
    sick_leave_balance: Decimal


class LeaveType(str, Enum):
    """The leave-type catalog. Maternity is included per the Maternity
    Benefit Act's 26-week entitlement (captain decision, 2026-10-20) even
    though its 50-employee crèche mandate sits above daydor's target range."""

    EARNED = "earned"
    CASUAL = "casual"
    SICK = "sick"
    MATERNITY = "maternity"
    UNPAID = "unpaid"


class LeaveRequestStatus(str, Enum):
    PENDING_MANAGER_REVIEW = "pending_manager_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class LeaveRequest(TenantScopedModel):
    """One employee's request for leave over a date range.

    `balance_sufficient` is informational, not a hard stop - a manager may
    still approve leave beyond an employee's balance as unpaid leave (see
    Domain 4.2's `leave_balance_checker`). `approval_request_id` ties this
    request to the manager-approval gate (Domain 4.3), reused the same way
    `FinalSettlement.approval_request_id` ties into the F&F gate.
    """

    employee_id: uuid.UUID
    leave_type: LeaveType
    date_from: date
    date_to: date
    status: LeaveRequestStatus = LeaveRequestStatus.PENDING_MANAGER_REVIEW
    balance_sufficient: bool | None = None
    approval_request_id: uuid.UUID | None = None


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    HALF_DAY = "half_day"
    ON_LEAVE = "on_leave"


class AttendanceRecord(TenantScopedModel):
    """One employee's attendance for one calendar day. v1 source is manual
    ops entry (captain decision, 2026-10-20) - no biometric/swipe
    integration yet."""

    employee_id: uuid.UUID
    date: date
    status: AttendanceStatus
    hours_worked: Decimal
