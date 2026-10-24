import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

import pytest
from temporalio import activity
from temporalio.client import WorkflowHandle
from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from daydor.activities.deterministic.payroll_compliance.esi_calculator import (
    ESIContributionResult,
)
from daydor.activities.deterministic.payroll_compliance.payroll_run_repository import (
    PayrollRunAssembly,
    PayrollRunKey,
)
from daydor.activities.deterministic.payroll_compliance.pf_calculator import (
    PFContributionResult,
)
from daydor.activities.deterministic.payroll_compliance.pt_calculator import (
    PTDeductionResult,
)
from daydor.activities.deterministic.payroll_compliance.tds_calculator import (
    TDSDeductionResult,
)
from daydor.models.payroll import PayrollRun, PayrollRunStatus
from daydor.workflows.payroll_compliance.run_builder import (
    EmployeePayrollInput,
    PayrollRunBuilderRequest,
    PayrollRunBuilderWorkflow,
)

TASK_QUEUE = "payroll-run-builder-test-queue"


def _request(**overrides) -> PayrollRunBuilderRequest:
    defaults = dict(
        tenant_id=uuid.uuid4(),
        legal_entity_id=uuid.uuid4(),
        period_start=date(2026, 1, 1),
        period_end=date(2026, 1, 31),
        employees=[
            EmployeePayrollInput(
                employee_id=uuid.uuid4(),
                state_code="MH",
                tax_regime="new",
                gross_pay=Decimal("50000"),
            )
        ],
    )
    defaults.update(overrides)
    return PayrollRunBuilderRequest(**defaults)


def _run_for(key: PayrollRunKey) -> PayrollRun:
    now = datetime.now(timezone.utc)
    return PayrollRun(
        tenant_id=key.tenant_id,
        legal_entity_id=key.legal_entity_id,
        period_start=key.period_start,
        period_end=key.period_end,
        status=PayrollRunStatus.DRAFT,
        created_at=now,
        updated_at=now,
    )


class RecordingActivities:
    """Stand-ins for the real (NotImplementedError) deterministic
    activities, recording each call so the test can assert on idempotency,
    fan-out, and the double-check without depending on the calculators' or
    repository's eventual real implementation."""

    def __init__(self) -> None:
        self.existing_run: PayrollRun | None = None
        self.find_calls: list[PayrollRunKey] = []
        self.persisted: list[PayrollRunAssembly] = []
        self.pf_calls: list[uuid.UUID] = []
        self.esi_calls: list[uuid.UUID] = []
        self.pt_calls: list[uuid.UUID] = []
        self.tds_calls: list[uuid.UUID] = []

    @activity.defn(name="find_existing_payroll_run")
    async def find_existing_payroll_run(self, key: PayrollRunKey) -> PayrollRun | None:
        self.find_calls.append(key)
        return self.existing_run

    @activity.defn(name="persist_payroll_run")
    async def persist_payroll_run(self, assembly: PayrollRunAssembly) -> PayrollRun:
        self.persisted.append(assembly)
        return assembly.run

    @activity.defn(name="calculate_pf_contribution")
    async def calculate_pf_contribution(
        self, employee_id: uuid.UUID, gross_pay: Decimal
    ) -> PFContributionResult:
        self.pf_calls.append(employee_id)
        return PFContributionResult(
            employee_id=employee_id,
            employee_contribution=Decimal("1800"),
            employer_contribution=Decimal("1800"),
        )

    @activity.defn(name="calculate_esi_contribution")
    async def calculate_esi_contribution(
        self, employee_id: uuid.UUID, gross_pay: Decimal
    ) -> ESIContributionResult:
        self.esi_calls.append(employee_id)
        return ESIContributionResult(
            employee_id=employee_id,
            is_eligible=False,
            employee_contribution=Decimal("0"),
            employer_contribution=Decimal("0"),
        )

    @activity.defn(name="calculate_pt_deduction")
    async def calculate_pt_deduction(
        self, employee_id: uuid.UUID, state_code: str, gross_pay: Decimal
    ) -> PTDeductionResult:
        self.pt_calls.append(employee_id)
        return PTDeductionResult(employee_id=employee_id, state_code=state_code, amount=Decimal("200"))

    @activity.defn(name="calculate_tds_deduction")
    async def calculate_tds_deduction(
        self, employee_id: uuid.UUID, gross_pay: Decimal, tax_regime: str
    ) -> TDSDeductionResult:
        self.tds_calls.append(employee_id)
        return TDSDeductionResult(employee_id=employee_id, amount=Decimal("500"))

    def activities(self) -> list:
        return [
            self.find_existing_payroll_run,
            self.persist_payroll_run,
            self.calculate_pf_contribution,
            self.calculate_esi_contribution,
            self.calculate_pt_deduction,
            self.calculate_tds_deduction,
        ]


@pytest.fixture
async def env():
    async with await WorkflowEnvironment.start_time_skipping(
        data_converter=pydantic_data_converter
    ) as environment:
        yield environment


async def _start(
    environment: WorkflowEnvironment, request: PayrollRunBuilderRequest
) -> WorkflowHandle:
    return await environment.client.start_workflow(
        PayrollRunBuilderWorkflow.run,
        request,
        id=f"payroll-run-builder-{uuid.uuid4()}",
        task_queue=TASK_QUEUE,
    )


async def test_no_existing_run_computes_and_persists_once(env):
    activities = RecordingActivities()
    request = _request()
    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[PayrollRunBuilderWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert len(activities.find_calls) == 2
    assert len(activities.persisted) == 1
    assert len(activities.pf_calls) == 1
    assert len(activities.esi_calls) == 1
    assert len(activities.pt_calls) == 1
    assert len(activities.tds_calls) == 1

    assembly = activities.persisted[0]
    assert len(assembly.payslips) == 1
    assert len(assembly.line_items) == 4
    assert result.legal_entity_id == request.legal_entity_id


async def test_existing_run_found_upfront_short_circuits(env):
    activities = RecordingActivities()
    request = _request()
    activities.existing_run = _run_for(request.to_key())

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[PayrollRunBuilderWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert len(activities.find_calls) == 1
    assert activities.persisted == []
    assert activities.pf_calls == []
    assert result.legal_entity_id == request.legal_entity_id


async def test_concurrent_run_detected_after_compute_skips_persist(env):
    activities = RecordingActivities()
    request = _request()
    concurrent_run = _run_for(request.to_key())

    call_count = 0
    original = activities.find_existing_payroll_run

    @activity.defn(name="find_existing_payroll_run")
    async def find_existing_payroll_run(key: PayrollRunKey) -> PayrollRun | None:
        nonlocal call_count
        call_count += 1
        activities.find_calls.append(key)
        if call_count >= 2:
            return concurrent_run
        return None

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[PayrollRunBuilderWorkflow],
        activities=[
            find_existing_payroll_run,
            activities.persist_payroll_run,
            activities.calculate_pf_contribution,
            activities.calculate_esi_contribution,
            activities.calculate_pt_deduction,
            activities.calculate_tds_deduction,
        ],
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert call_count == 2
    assert activities.persisted == []
    assert result == concurrent_run
