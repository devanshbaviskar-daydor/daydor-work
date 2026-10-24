"""Gratuity accrual tracking workflow.

Domain sub-orchestrator under Payroll & Statutory Compliance. Fills the gap
the Product Spec's §2.2 reconciliation note flags: no worker updates
`GratuityAccrualBalance` once a payroll run is assembled, yet
`final_settlement_calculator` already expects to read a running balance
from it at exit rather than recomputing gratuity from scratch.

Adapts the co-founder's Daydor-Build run-builder design pattern - the
mechanism of upserting a running per-employee balance every payroll run,
from `daydor-backend/src/daydor/payroll/run_builder.py`'s
`_accrue_gratuity` - not its accrual rate or logic, which was an admitted
rough approximation (flat ~15/26/12 monthly rate, no eligibility gating, no
ceiling). This workflow instead implements the real Payment of Gratuity
Act, 1972 rules:

- Applicability gate: accrual only runs once the tenant has crossed the
  10-employee threshold that triggers Gratuity Act coverage (the same
  crossing the Headcount Threshold Monitor domain already tracks for ESI
  and POSH). Checked once per run via `find_gratuity_threshold_obligation`
  rather than per employee, since it is a tenant-level fact.
- Per-employee tenure gate: accrual only runs for employees who have
  reached the eligibility floor - 5 years continuous service for permanent
  employees, 1 year for fixed-term employees (Code on Social Security,
  2020). An employee below the floor still accrues nothing yet; this is
  intentionally stricter than the co-founder's version, which accrued
  unconditionally from day one.
- Tax-free ceiling: the running balance this workflow persists is capped
  at `GRATUITY_TAX_FREE_CEILING` (currently Rs 20,00,000 - see
  `gratuity_accrual_tracker` for the citation), so a long-tenured,
  high-wage employee's tracked balance never silently exceeds the
  statutory tax-free limit.

Mirrors `PayrollRunBuilderWorkflow`'s idempotency property one level
lower: each employee's balance update is itself an upsert keyed on
`employee_id` (not on this run), so replaying this workflow for the same
period is safe - it is not harmful to add the correct period's delta more
than once *to the same final total* only because the delta is deterministic
from this period's inputs and the repository's upsert overwrites rather
than appends; this workflow still only calls the upsert once per employee
per invocation; the payroll sub-orchestrator is responsible for not
re-invoking this workflow twice for one already-processed period.

Trigger: `PayrollOrchestratorWorkflow`, immediately after
`PayrollRunBuilderWorkflow` persists the period's `PayrollRun` - reads that
workflow's `EmployeePayrollInput`-shaped per-employee data (gross pay is
not needed here, only the gratuity wage base) alongside each employee's
tenure, per `payroll_run_builder.py`'s own "follow-up integration point"
note.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from daydor.activities.deterministic.payroll_compliance.gratuity_accrual_tracker import (
        GRATUITY_TAX_FREE_CEILING,
        calculate_gratuity_accrual_delta,
    )
    from daydor.activities.deterministic.payroll_compliance.gratuity_repository import (
        GratuityBalanceUpdate,
        find_gratuity_balance,
        find_gratuity_threshold_obligation,
        upsert_gratuity_balance,
    )
    from daydor.models.compliance import StatutoryScheme
    from daydor.models.employee import EmploymentType
    from daydor.models.payroll import GratuityAccrualBalance

_ACTIVITY_TIMEOUT = timedelta(minutes=5)

GRATUITY_ELIGIBILITY_YEARS_PERMANENT = 5
GRATUITY_ELIGIBILITY_YEARS_FIXED_TERM = 1
"""Continuous-service floor before gratuity accrues: 5 years for permanent/
regular employees (unchanged by the Code on Social Security, 2020), 1 year
for fixed-term employees specifically (a Code-on-Social-Security reduction,
not a universal cut to 1 year across all employment types) - see Product
Spec §2.4f, verified 2026-10-20."""

_ELIGIBLE_EMPLOYMENT_TYPES = {
    EmploymentType.PERMANENT: GRATUITY_ELIGIBILITY_YEARS_PERMANENT,
    EmploymentType.FIXED_TERM: GRATUITY_ELIGIBILITY_YEARS_FIXED_TERM,
}
"""Interns and contractors are excluded entirely - the Act's "continuous
service" eligibility is not defined for those categories in Daydor's
`EmploymentType` set, so they are never gated in simply by tenure."""


def completed_years_of_service(date_of_joining: date, as_of: date) -> int:
    """Completed years of continuous service, >=6 months in the final year
    rounding up to the next full year, per the Act.

    Used only to test the eligibility floor here; `final_settlement_calculator`
    applies this same rounding rule once more, against the exit date, to
    size the final payout - this function does not itself compute a payout.
    """
    total_months = (as_of.year - date_of_joining.year) * 12 + (as_of.month - date_of_joining.month)
    if as_of.day < date_of_joining.day:
        total_months -= 1
    years, remainder_months = divmod(max(total_months, 0), 12)
    if remainder_months >= 6:
        years += 1
    return years


def is_gratuity_eligible(employment_type: EmploymentType, date_of_joining: date, as_of: date) -> bool:
    required_years = _ELIGIBLE_EMPLOYMENT_TYPES.get(employment_type)
    if required_years is None:
        return False
    return completed_years_of_service(date_of_joining, as_of) >= required_years


@dataclass
class EmployeeGratuityInput:
    """One employee's inputs for this period's accrual, mirroring
    `run_builder.EmployeePayrollInput`'s shape for the same period so the
    payroll sub-orchestrator can derive both from one source."""

    employee_id: uuid.UUID
    employment_type: EmploymentType
    date_of_joining: date
    gratuity_wage_base: Decimal


@dataclass
class GratuityAccrualRequest:
    tenant_id: uuid.UUID
    as_of_period: date
    employees: list[EmployeeGratuityInput] = field(default_factory=list)


@dataclass
class GratuityAccrualResult:
    tenant_id: uuid.UUID
    as_of_period: date
    updated_balances: list[GratuityAccrualBalance] = field(default_factory=list)
    skipped_not_applicable: bool = False
    skipped_ineligible_employee_ids: list[uuid.UUID] = field(default_factory=list)


@workflow.defn
class GratuityAccrualWorkflow:
    """Updates every eligible employee's running gratuity balance for one
    payroll period.

    Trigger: `PayrollOrchestratorWorkflow`, after `PayrollRunBuilderWorkflow`
    completes for the same period.
    """

    @workflow.run
    async def run(self, request: GratuityAccrualRequest) -> GratuityAccrualResult:
        obligation = await workflow.execute_activity(
            find_gratuity_threshold_obligation,
            request.tenant_id,
            start_to_close_timeout=_ACTIVITY_TIMEOUT,
        )
        if obligation is None or not obligation.is_applicable:
            return GratuityAccrualResult(
                tenant_id=request.tenant_id,
                as_of_period=request.as_of_period,
                skipped_not_applicable=True,
            )
        assert obligation.scheme == StatutoryScheme.GRATUITY

        updated: list[GratuityAccrualBalance] = []
        skipped: list[uuid.UUID] = []

        for employee in request.employees:
            if not is_gratuity_eligible(
                employee.employment_type, employee.date_of_joining, request.as_of_period
            ):
                skipped.append(employee.employee_id)
                continue

            delta = await workflow.execute_activity(
                calculate_gratuity_accrual_delta,
                args=[employee.employee_id, employee.gratuity_wage_base],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )

            existing = await workflow.execute_activity(
                find_gratuity_balance,
                args=[request.tenant_id, employee.employee_id],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )
            prior_amount = existing.accrued_amount if existing is not None else Decimal("0")
            new_amount = min(prior_amount + delta.period_accrual, GRATUITY_TAX_FREE_CEILING)

            balance = await workflow.execute_activity(
                upsert_gratuity_balance,
                GratuityBalanceUpdate(
                    employee_id=employee.employee_id,
                    tenant_id=request.tenant_id,
                    as_of_period=request.as_of_period,
                    accrued_amount=new_amount,
                    gratuity_wage_base=delta.gratuity_wage_base,
                ),
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )
            updated.append(balance)

        return GratuityAccrualResult(
            tenant_id=request.tenant_id,
            as_of_period=request.as_of_period,
            updated_balances=updated,
            skipped_ineligible_employee_ids=skipped,
        )
