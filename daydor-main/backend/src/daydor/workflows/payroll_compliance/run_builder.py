"""Payroll run-builder assembly workflow.

Domain sub-orchestrator under Payroll & Statutory Compliance. The missing
assembly step that joins each employee's four per-employee calculator
outputs (PF, ESI, PT, TDS) into one `PayrollRun` with its `Payslip` and
`PayslipLineItem` rows, written together in a single transaction.

Adapts the co-founder's Daydor-Build run-builder design pattern - not its
code or calculator math, which stays Daydor's own - for three properties:

- Idempotent on `(legal_entity_id, period_start, period_end)`: a legal
  entity must not get two payroll runs for the same period no matter how
  many times the trigger fires. Checked via `find_existing_payroll_run`
  before the compute phase starts.
- Transactional multi-table persistence: the run, every payslip, and every
  payslip line item are written together in one transaction via
  `persist_payroll_run`, so a crash mid-assembly never leaves a run without
  its payslips or a payslip without its line items.
- Concurrency-safe double-check: `find_existing_payroll_run` is called
  again after the (potentially slow, per-employee) compute phase and once
  more inside `persist_payroll_run`'s own transaction immediately before
  the insert, so two concurrent trigger attempts for the same period can
  race through the first check but still converge on one persisted run.

Calls the four statutory calculators (`calculate_pf_contribution`,
`calculate_esi_contribution`, `calculate_pt_deduction`,
`calculate_tds_deduction`) by their declared interfaces for each employee's
gross pay. Those calculators, and `calculate_wages` that produces the gross
pay this workflow passes them, remain `NotImplementedError` stubs; this
assembly step is complete and testable independent of their implementation.

Integration point: `GratuityAccrualWorkflow` (workflows/payroll_compliance/
gratuity_accrual.py) reads this module's `EmployeePayrollInput` shape to
update `GratuityAccrualBalance` once a run is assembled - do not change
that shape without checking that workflow.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from daydor.activities.deterministic.payroll_compliance.esi_calculator import (
        calculate_esi_contribution,
    )
    from daydor.activities.deterministic.payroll_compliance.payroll_run_repository import (
        PayrollRunAssembly,
        PayrollRunKey,
        find_existing_payroll_run,
        persist_payroll_run,
    )
    from daydor.activities.deterministic.payroll_compliance.pf_calculator import (
        calculate_pf_contribution,
    )
    from daydor.activities.deterministic.payroll_compliance.pt_calculator import (
        calculate_pt_deduction,
    )
    from daydor.activities.deterministic.payroll_compliance.tds_calculator import (
        calculate_tds_deduction,
    )
    from daydor.models.payroll import (
        PayrollRun,
        Payslip,
        PayslipLineItem,
        PayslipLineItemType,
    )

_ACTIVITY_TIMEOUT = timedelta(minutes=5)


@dataclass
class EmployeePayrollInput:
    """One employee's already-computed gross pay and the inputs the
    statutory calculators need, for one payroll period.

    `calculate_wages` (producing `gross_pay` from salary structure and
    attendance) runs upstream of this assembly step, one orchestration
    layer up - not repeated here - so the run-builder's own interface
    stays independent of wage computation changes.
    """

    employee_id: uuid.UUID
    state_code: str
    tax_regime: str
    gross_pay: Decimal


@dataclass
class PayrollRunBuilderRequest:
    """Input to `PayrollRunBuilderWorkflow.run`.

    Kept distinct from `PayrollRunKey` (the activities' narrower
    idempotency-key shape) so the workflow's public input can carry the
    per-employee compute inputs without widening that key.
    """

    tenant_id: uuid.UUID
    legal_entity_id: uuid.UUID
    period_start: date
    period_end: date
    employees: list[EmployeePayrollInput] = field(default_factory=list)

    def to_key(self) -> PayrollRunKey:
        return PayrollRunKey(
            tenant_id=self.tenant_id,
            legal_entity_id=self.legal_entity_id,
            period_start=self.period_start,
            period_end=self.period_end,
        )


@workflow.defn
class PayrollRunBuilderWorkflow:
    """Assembles one legal entity's payroll run for one period.

    Trigger: the payroll sub-orchestrator (`PayrollOrchestratorWorkflow`),
    once every employee's gross pay for the period is available.
    """

    @workflow.run
    async def run(self, request: PayrollRunBuilderRequest) -> PayrollRun:
        key = request.to_key()

        existing = await workflow.execute_activity(
            find_existing_payroll_run,
            key,
            start_to_close_timeout=_ACTIVITY_TIMEOUT,
        )
        if existing is not None:
            return existing

        payslips: list[Payslip] = []
        line_items: list[PayslipLineItem] = []
        run_id = workflow.uuid4()

        for employee in request.employees:
            payslip_id = workflow.uuid4()

            pf_result = await workflow.execute_activity(
                calculate_pf_contribution,
                args=[employee.employee_id, employee.gross_pay],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )
            esi_result = await workflow.execute_activity(
                calculate_esi_contribution,
                args=[employee.employee_id, employee.gross_pay],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )
            pt_result = await workflow.execute_activity(
                calculate_pt_deduction,
                args=[employee.employee_id, employee.state_code, employee.gross_pay],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )
            tds_result = await workflow.execute_activity(
                calculate_tds_deduction,
                args=[employee.employee_id, employee.gross_pay, employee.tax_regime],
                start_to_close_timeout=_ACTIVITY_TIMEOUT,
            )

            net_pay = (
                employee.gross_pay
                - pf_result.employee_contribution
                - esi_result.employee_contribution
                - pt_result.amount
                - tds_result.amount
            )

            payslips.append(
                Payslip(
                    tenant_id=request.tenant_id,
                    payroll_run_id=run_id,
                    employee_id=employee.employee_id,
                    gross_pay=employee.gross_pay,
                    net_pay=net_pay,
                    id=payslip_id,
                    created_at=workflow.now(),
                    updated_at=workflow.now(),
                )
            )
            line_items.extend(
                [
                    PayslipLineItem(
                        tenant_id=request.tenant_id,
                        payslip_id=payslip_id,
                        line_type=PayslipLineItemType.PF,
                        employee_contribution=pf_result.employee_contribution,
                        employer_contribution=pf_result.employer_contribution,
                        created_at=workflow.now(),
                        updated_at=workflow.now(),
                    ),
                    PayslipLineItem(
                        tenant_id=request.tenant_id,
                        payslip_id=payslip_id,
                        line_type=PayslipLineItemType.ESI,
                        employee_contribution=esi_result.employee_contribution,
                        employer_contribution=esi_result.employer_contribution,
                        created_at=workflow.now(),
                        updated_at=workflow.now(),
                    ),
                    PayslipLineItem(
                        tenant_id=request.tenant_id,
                        payslip_id=payslip_id,
                        line_type=PayslipLineItemType.PT,
                        employee_contribution=pt_result.amount,
                        created_at=workflow.now(),
                        updated_at=workflow.now(),
                    ),
                    PayslipLineItem(
                        tenant_id=request.tenant_id,
                        payslip_id=payslip_id,
                        line_type=PayslipLineItemType.TDS,
                        employee_contribution=tds_result.amount,
                        created_at=workflow.now(),
                        updated_at=workflow.now(),
                    ),
                ]
            )

        existing = await workflow.execute_activity(
            find_existing_payroll_run,
            key,
            start_to_close_timeout=_ACTIVITY_TIMEOUT,
        )
        if existing is not None:
            return existing

        run = PayrollRun(
            id=run_id,
            tenant_id=request.tenant_id,
            legal_entity_id=request.legal_entity_id,
            period_start=request.period_start,
            period_end=request.period_end,
            created_at=workflow.now(),
            updated_at=workflow.now(),
        )

        return await workflow.execute_activity(
            persist_payroll_run,
            PayrollRunAssembly(run=run, payslips=payslips, line_items=line_items),
            start_to_close_timeout=_ACTIVITY_TIMEOUT,
        )
