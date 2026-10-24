"""Statutory compliance and headcount-threshold models. Placeholder schema only."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel

from daydor.models.base import TenantScopedModel


class StatutoryScheme(str, Enum):
    """India statutory schemes keyed to headcount thresholds."""

    ESI = "esi"  # Employees' State Insurance: >= 10 employees
    GRATUITY = "gratuity"  # Payment of Gratuity Act: >= 10 employees
    POSH = "posh"  # POSH Internal Committee: >= 10 employees
    EPF = "epf"  # Employees' Provident Fund: >= 20 employees


class ThresholdObligation(TenantScopedModel):
    """A tenant's obligation status for one statutory scheme."""

    scheme: StatutoryScheme
    threshold_headcount: int
    is_applicable: bool = False
    crossed_on: date | None = None


class FilingRecord(TenantScopedModel):
    """One statutory filing submission (e.g. PF ECR, ESI contribution)."""

    scheme: StatutoryScheme
    period_start: date
    period_end: date
    due_date: date
    filed_on: date | None = None


class RetentionRecordType(str, Enum):
    """The distinct statutory retention clocks, each anchored to a
    different date - a single `created_at + N years` rule is wrong for
    most of these. See Data Model Design §5.2."""

    TDS = "tds"  # ~8 years from filing date (Income Tax Act)
    PF = "pf"  # 7 years from record creation - captain-confirmed, not 10
    ESI = "esi"  # 5 years from the record's last-entry date (ESI Act)
    GRATUITY = "gratuity"  # service period + 3 years from exit date
    EXPENSE_RECEIPT = "expense_receipt"  # 8 years from record creation - see RETENTION_POLICIES note


class RetentionAnchorField(str, Enum):
    FILED_ON = "filed_on"
    LAST_ENTRY_DATE = "last_entry_date"
    EMPLOYEE_DATE_OF_EXIT = "employee.date_of_exit"
    CREATED_AT = "created_at"


class RetentionPolicy(BaseModel):
    """Reference table: which date field a record's retention clock anchors
    to, and how long the floor is. Pointed at by `document.retention_class`
    and the equivalent concept on `payslip`/`filing_record`, rather than a
    literal duration on each row, so a policy change doesn't require
    touching every row."""

    retention_class: RetentionRecordType
    retention_years: int
    anchor_field: RetentionAnchorField


RETENTION_POLICIES: list[RetentionPolicy] = [
    RetentionPolicy(
        retention_class=RetentionRecordType.TDS,
        retention_years=8,
        anchor_field=RetentionAnchorField.FILED_ON,
    ),
    RetentionPolicy(
        retention_class=RetentionRecordType.PF,
        retention_years=7,
        anchor_field=RetentionAnchorField.CREATED_AT,
    ),
    RetentionPolicy(
        retention_class=RetentionRecordType.ESI,
        retention_years=5,
        anchor_field=RetentionAnchorField.LAST_ENTRY_DATE,
    ),
    RetentionPolicy(
        retention_class=RetentionRecordType.GRATUITY,
        retention_years=3,
        anchor_field=RetentionAnchorField.EMPLOYEE_DATE_OF_EXIT,
    ),
    RetentionPolicy(
        # 8 years, matching TDS's existing retention floor (captain
        # decision, 2026-10-20) - a conservative default, pending
        # primary-source verification against the Income Tax Act's and
        # Companies Act's actual record-keeping requirements for expense/
        # reimbursement records specifically, same as other provisional
        # figures in this repo.
        retention_class=RetentionRecordType.EXPENSE_RECEIPT,
        retention_years=8,
        anchor_field=RetentionAnchorField.CREATED_AT,
    ),
]


class TenantComplianceConfig(TenantScopedModel):
    """Soft per-tenant preference - notification preferences, approver
    overrides, feature flags. Changing a tenant's preference is an UPDATE
    to this row's JSON, never a migration."""

    settings_json: dict = {}


class OffboardingTaskDomain(str, Enum):
    """Which ops function owns a default offboarding task."""

    IT = "it"  # asset return, access/systems revocation
    HR = "hr"  # exit interview, relieving/experience letters
    PAYROLL = "payroll"  # full-and-final settlement, statutory payments
    FINANCE = "finance"  # Form 16 Part A and other tax documentation


class DefaultOffboardingTask(BaseModel):
    """Reference table: India-researched default offboarding tasks, each
    anchored to `employee.date_of_exit` by a day offset (negative = before
    exit, 0 = on exit day, positive = after). `offboarding_checklist_builder`
    consults this as the starting catalog and narrows it to what the
    tenant's `TenantComplianceConfig.settings_json` offboarding policy
    actually applies (e.g. only systems/assets named for that employee),
    per `agents/offboarding/prompt.md` - it is a default, not a fixed
    checklist for every tenant.

    `blocks_full_and_final` marks tasks whose non-completion should hold up
    F&F settlement (e.g. unreturned assets are commonly adjusted against
    F&F dues); it does not mark tasks that are merely statutory deadlines
    of their own, such as gratuity, which runs on its own clock."""

    title: str
    domain: OffboardingTaskDomain
    day_offset: int
    blocks_full_and_final: bool


DEFAULT_OFFBOARDING_TASKS: list[DefaultOffboardingTask] = [
    DefaultOffboardingTask(
        title="Schedule and conduct exit interview",
        domain=OffboardingTaskDomain.HR,
        day_offset=-3,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Revoke system and application access (email, VPN, SaaS tools)",
        domain=OffboardingTaskDomain.IT,
        day_offset=0,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Revoke building/physical access",
        domain=OffboardingTaskDomain.IT,
        day_offset=0,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Collect issued IT assets and equipment (laptop, access card)",
        domain=OffboardingTaskDomain.IT,
        day_offset=0,
        blocks_full_and_final=True,
    ),
    DefaultOffboardingTask(
        title="Issue relieving letter",
        domain=OffboardingTaskDomain.HR,
        day_offset=0,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Issue experience/service letter",
        domain=OffboardingTaskDomain.HR,
        day_offset=7,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Complete full-and-final settlement",
        domain=OffboardingTaskDomain.PAYROLL,
        day_offset=7,
        blocks_full_and_final=True,
    ),
    DefaultOffboardingTask(
        title="Pay gratuity to eligible employees (Payment of Gratuity Act, 5+ years service)",
        domain=OffboardingTaskDomain.PAYROLL,
        day_offset=30,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Issue Form 16 Part A for the relevant quarter once the TDS return is filed",
        domain=OffboardingTaskDomain.FINANCE,
        day_offset=120,
        blocks_full_and_final=False,
    ),
    DefaultOffboardingTask(
        title="Notify broker/insurer of coverage termination for exiting employee",
        domain=OffboardingTaskDomain.HR,
        day_offset=0,
        blocks_full_and_final=False,
    ),
]


class PtSlabRule(BaseModel):
    """Versioned, effective-dated PT slab rule. Not tenant-scoped - the
    rule is the same for every tenant in that state. A rate change is a
    new row with a new `effective_from`, never an edit to an existing one,
    so a payroll run for a past period always recomputes against the slab
    that was actually in force then."""

    state_code: str
    effective_from: date
    effective_to: date | None = None
    slab_min: Decimal
    slab_max: Decimal | None = None
    monthly_amount: Decimal


class EpfRateRule(BaseModel):
    """Versioned, effective-dated EPF wage-ceiling/rate rule. Not tenant-scoped."""

    effective_from: date
    effective_to: date | None = None
    wage_ceiling: Decimal
    employee_rate_percent: Decimal
    employer_rate_percent: Decimal


class EsiRateRule(BaseModel):
    """Versioned, effective-dated ESI wage-ceiling/rate rule. Not tenant-scoped."""

    effective_from: date
    effective_to: date | None = None
    wage_ceiling: Decimal
    employee_rate_percent: Decimal
    employer_rate_percent: Decimal
