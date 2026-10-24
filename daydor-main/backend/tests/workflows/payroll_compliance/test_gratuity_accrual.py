import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

import pytest
from temporalio import activity
from temporalio.client import WorkflowHandle
from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from daydor.activities.deterministic.payroll_compliance.gratuity_accrual_tracker import (
    GRATUITY_TAX_FREE_CEILING,
    GratuityAccrualDelta,
)
from daydor.activities.deterministic.payroll_compliance.gratuity_repository import (
    GratuityBalanceUpdate,
)
from daydor.models.compliance import StatutoryScheme, ThresholdObligation
from daydor.models.employee import EmploymentType
from daydor.models.payroll import GratuityAccrualBalance
from daydor.workflows.payroll_compliance.gratuity_accrual import (
    EmployeeGratuityInput,
    GratuityAccrualRequest,
    GratuityAccrualWorkflow,
    completed_years_of_service,
    is_gratuity_eligible,
)

TASK_QUEUE = "gratuity-accrual-test-queue"


def _obligation(tenant_id: uuid.UUID, *, is_applicable: bool) -> ThresholdObligation:
    now = datetime.now(timezone.utc)
    return ThresholdObligation(
        tenant_id=tenant_id,
        scheme=StatutoryScheme.GRATUITY,
        threshold_headcount=10,
        is_applicable=is_applicable,
        crossed_on=date(2025, 1, 1) if is_applicable else None,
        created_at=now,
        updated_at=now,
    )


def _balance(
    tenant_id: uuid.UUID, employee_id: uuid.UUID, accrued_amount: Decimal
) -> GratuityAccrualBalance:
    now = datetime.now(timezone.utc)
    return GratuityAccrualBalance(
        tenant_id=tenant_id,
        employee_id=employee_id,
        as_of_period=date(2025, 12, 31),
        accrued_amount=accrued_amount,
        gratuity_wage_base=Decimal("30000"),
        created_at=now,
        updated_at=now,
    )


class RecordingActivities:
    def __init__(self) -> None:
        self.obligation: ThresholdObligation | None = None
        self.existing_balances: dict[uuid.UUID, GratuityAccrualBalance] = {}
        self.delta_by_employee: dict[uuid.UUID, Decimal] = {}
        self.upserted: list[GratuityBalanceUpdate] = []
        self.delta_calls: list[uuid.UUID] = []
        self.find_balance_calls: list[uuid.UUID] = []

    @activity.defn(name="find_gratuity_threshold_obligation")
    async def find_gratuity_threshold_obligation(
        self, tenant_id: uuid.UUID
    ) -> ThresholdObligation | None:
        return self.obligation

    @activity.defn(name="calculate_gratuity_accrual_delta")
    async def calculate_gratuity_accrual_delta(
        self, employee_id: uuid.UUID, gratuity_wage_base: Decimal
    ) -> GratuityAccrualDelta:
        self.delta_calls.append(employee_id)
        amount = self.delta_by_employee.get(employee_id, Decimal("1442.31"))
        return GratuityAccrualDelta(
            employee_id=employee_id,
            period_accrual=amount,
            gratuity_wage_base=gratuity_wage_base,
        )

    @activity.defn(name="find_gratuity_balance")
    async def find_gratuity_balance(
        self, tenant_id: uuid.UUID, employee_id: uuid.UUID
    ) -> GratuityAccrualBalance | None:
        self.find_balance_calls.append(employee_id)
        return self.existing_balances.get(employee_id)

    @activity.defn(name="upsert_gratuity_balance")
    async def upsert_gratuity_balance(
        self, update: GratuityBalanceUpdate
    ) -> GratuityAccrualBalance:
        self.upserted.append(update)
        now = datetime.now(timezone.utc)
        return GratuityAccrualBalance(
            tenant_id=update.tenant_id,
            employee_id=update.employee_id,
            as_of_period=update.as_of_period,
            accrued_amount=update.accrued_amount,
            gratuity_wage_base=update.gratuity_wage_base,
            created_at=now,
            updated_at=now,
        )

    def activities(self) -> list:
        return [
            self.find_gratuity_threshold_obligation,
            self.calculate_gratuity_accrual_delta,
            self.find_gratuity_balance,
            self.upsert_gratuity_balance,
        ]


@pytest.fixture
async def env():
    async with await WorkflowEnvironment.start_time_skipping(
        data_converter=pydantic_data_converter
    ) as environment:
        yield environment


async def _start(
    environment: WorkflowEnvironment, request: GratuityAccrualRequest
) -> WorkflowHandle:
    return await environment.client.start_workflow(
        GratuityAccrualWorkflow.run,
        request,
        id=f"gratuity-accrual-{uuid.uuid4()}",
        task_queue=TASK_QUEUE,
    )


def _permanent_employee(employee_id: uuid.UUID, years_ago: int) -> EmployeeGratuityInput:
    return EmployeeGratuityInput(
        employee_id=employee_id,
        employment_type=EmploymentType.PERMANENT,
        date_of_joining=date(2026 - years_ago, 1, 1),
        gratuity_wage_base=Decimal("30000"),
    )


async def test_not_applicable_below_headcount_threshold_skips_all_employees(env):
    tenant_id = uuid.uuid4()
    activities = RecordingActivities()
    activities.obligation = _obligation(tenant_id, is_applicable=False)
    request = GratuityAccrualRequest(
        tenant_id=tenant_id,
        as_of_period=date(2026, 1, 31),
        employees=[_permanent_employee(uuid.uuid4(), years_ago=10)],
    )

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[GratuityAccrualWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert result.skipped_not_applicable is True
    assert activities.delta_calls == []
    assert activities.upserted == []


async def test_ineligible_employee_tenure_is_skipped(env):
    tenant_id = uuid.uuid4()
    activities = RecordingActivities()
    activities.obligation = _obligation(tenant_id, is_applicable=True)
    ineligible_id = uuid.uuid4()
    request = GratuityAccrualRequest(
        tenant_id=tenant_id,
        as_of_period=date(2026, 1, 31),
        employees=[_permanent_employee(ineligible_id, years_ago=2)],
    )

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[GratuityAccrualWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert result.skipped_ineligible_employee_ids == [ineligible_id]
    assert activities.delta_calls == []
    assert activities.upserted == []


async def test_eligible_employee_accrues_onto_existing_balance(env):
    tenant_id = uuid.uuid4()
    activities = RecordingActivities()
    activities.obligation = _obligation(tenant_id, is_applicable=True)
    employee_id = uuid.uuid4()
    activities.existing_balances[employee_id] = _balance(tenant_id, employee_id, Decimal("50000"))
    activities.delta_by_employee[employee_id] = Decimal("1442.31")

    request = GratuityAccrualRequest(
        tenant_id=tenant_id,
        as_of_period=date(2026, 1, 31),
        employees=[_permanent_employee(employee_id, years_ago=6)],
    )

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[GratuityAccrualWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        result = await handle.result()

    assert len(activities.upserted) == 1
    assert activities.upserted[0].accrued_amount == Decimal("51442.31")
    assert result.skipped_ineligible_employee_ids == []
    assert len(result.updated_balances) == 1


async def test_running_balance_is_capped_at_tax_free_ceiling(env):
    tenant_id = uuid.uuid4()
    activities = RecordingActivities()
    activities.obligation = _obligation(tenant_id, is_applicable=True)
    employee_id = uuid.uuid4()
    activities.existing_balances[employee_id] = _balance(
        tenant_id, employee_id, GRATUITY_TAX_FREE_CEILING - Decimal("500")
    )
    activities.delta_by_employee[employee_id] = Decimal("5000")

    request = GratuityAccrualRequest(
        tenant_id=tenant_id,
        as_of_period=date(2026, 1, 31),
        employees=[_permanent_employee(employee_id, years_ago=15)],
    )

    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[GratuityAccrualWorkflow],
        activities=activities.activities(),
    ):
        handle = await _start(env, request)
        await handle.result()

    assert activities.upserted[0].accrued_amount == GRATUITY_TAX_FREE_CEILING


def test_completed_years_of_service_rounds_up_at_six_months():
    joining = date(2020, 1, 15)
    assert completed_years_of_service(joining, date(2025, 7, 14)) == 5
    assert completed_years_of_service(joining, date(2025, 7, 15)) == 6
    assert completed_years_of_service(joining, date(2024, 7, 14)) == 4


def test_fixed_term_eligibility_floor_is_one_year():
    joining = date(2025, 1, 1)
    assert is_gratuity_eligible(EmploymentType.FIXED_TERM, joining, date(2026, 1, 1)) is True
    assert is_gratuity_eligible(EmploymentType.PERMANENT, joining, date(2026, 1, 1)) is False


def test_contractor_and_intern_never_eligible():
    joining = date(2000, 1, 1)
    for employment_type in (EmploymentType.CONTRACTOR, EmploymentType.INTERN):
        assert is_gratuity_eligible(employment_type, joining, date(2026, 1, 1)) is False
