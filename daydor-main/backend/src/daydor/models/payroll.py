"""Payroll run and payslip models. Placeholder schema only."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from daydor.models.base import TenantScopedModel


class PayrollRunStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    DISBURSED = "disbursed"


class PayslipLineItemType(str, Enum):
    """The per-employee calculator outputs assembled onto a payslip.

    `BENEFIT` is `benefit_payroll_feed`'s flat (not slab-based, not
    percentage-of-gross) deduction line for a confirmed, cost-bearing
    `BenefitElection` (daydor.models.benefits) - zero for a wholly
    employer-funded benefit. Additive to the PF/ESI/PT/TDS lines this run
    already produces; it does not feed PF/ESI's wage base or gratuity's
    (Basic+DA)-based formula.
    """

    PF = "pf"
    ESI = "esi"
    PT = "pt"
    TDS = "tds"
    BENEFIT = "benefit"


class TaxRegimeElection(str, Enum):
    OLD = "old"
    NEW = "new"


class EmploymentRecord(TenantScopedModel):
    """Versioned, effective-dated job/comp history for one employee.

    `Employee` is a person; compensation and job structure change over time
    and must be versioned, not overwritten - a payroll run for March needs
    March's salary structure even after a raise in April changes the
    current one. Immutable once a payroll run has used it: a correction
    creates a new effective-dated version rather than mutating a row a past
    payroll run already relied on.
    """

    employee_id: uuid.UUID
    effective_from: date
    effective_to: date | None = None
    ctc_annual: Decimal
    basic_da_monthly: Decimal
    other_allowances_json: dict = {}
    wage_floor_compliant: bool = False
    tax_regime_election: TaxRegimeElection | None = None


class PayrollRun(TenantScopedModel):
    """One payroll cycle for a tenant (e.g. a calendar month).

    `legal_entity_id` plus `period_start`/`period_end` is the idempotency
    key the run-builder assembly step enforces: a legal entity must not get
    two payroll runs for the same period, however many times the trigger
    fires. Kept distinct from `tenant_id` since a tenant may operate more
    than one legal entity.
    """

    legal_entity_id: uuid.UUID
    period_start: date
    period_end: date
    status: PayrollRunStatus = PayrollRunStatus.DRAFT


class Payslip(TenantScopedModel):
    """One employee's computed payslip within a payroll run."""

    payroll_run_id: uuid.UUID
    employee_id: uuid.UUID
    gross_pay: Decimal
    net_pay: Decimal


class PayslipLineItem(TenantScopedModel):
    """One payslip line item: a statutory deduction (PF, ESI, PT, TDS) or
    a benefit deduction (BENEFIT).

    Written in the same transaction as its parent `Payslip` and
    `PayrollRun` by the run-builder assembly step - a payslip is never
    left without its line items, and a line item never outlives its
    payslip.
    """

    payslip_id: uuid.UUID
    line_type: PayslipLineItemType
    employee_contribution: Decimal = Decimal("0")
    employer_contribution: Decimal = Decimal("0")


class GratuityAccrualBalance(TenantScopedModel):
    """Running per-employee gratuity accrual, updated each payroll period.

    Read (not recomputed from scratch) at exit time by `FinalSettlement`,
    per the Product Spec's requirement that F&F draws on the same gratuity
    accrual figure tracked per-period.
    """

    employee_id: uuid.UUID
    as_of_period: date
    accrued_amount: Decimal
    gratuity_wage_base: Decimal


class FinalSettlement(TenantScopedModel):
    """One employee's full-and-final settlement computed at exit.

    `gratuity_payout` is drawn from `GratuityAccrualBalance`'s running
    balance as of exit, not recomputed from scratch. `disbursed_at` is set
    by the same `salary_disbursement` worker used for routine payroll,
    called with the F&F amount instead of a routine payroll amount.
    """

    employee_id: uuid.UUID
    pending_wages: Decimal
    gratuity_payout: Decimal
    leave_encashment: Decimal
    recoveries: Decimal
    total_settlement: Decimal
    approval_request_id: uuid.UUID
    disbursed_at: datetime | None = None
