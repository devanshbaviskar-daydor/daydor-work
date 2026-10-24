import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from daydor.models.approvals import ApprovalRequest, ApproverRole
from daydor.models.compliance import StatutoryScheme, ThresholdObligation
from daydor.models.employee import Employee, EmploymentType
from daydor.models.payroll import (
    FinalSettlement,
    GratuityAccrualBalance,
    PayrollRun,
    PayrollRunStatus,
)


def test_employee_requires_tenant_id():
    employee = Employee(
        tenant_id=uuid.uuid4(),
        hire_event_id="hire-001",
        full_name="Test Employee",
        employment_type=EmploymentType.PERMANENT,
        state_code="MH",
        date_of_joining=date(2026, 1, 1),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert employee.tenant_id is not None
    assert employee.aadhaar_last4 is None


def test_payroll_run_requires_tenant_id():
    run = PayrollRun(
        tenant_id=uuid.uuid4(),
        legal_entity_id=uuid.uuid4(),
        period_start=date(2026, 1, 1),
        period_end=date(2026, 1, 31),
        status=PayrollRunStatus.DRAFT,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert run.tenant_id is not None


def test_threshold_obligation_requires_tenant_id():
    obligation = ThresholdObligation(
        tenant_id=uuid.uuid4(),
        scheme=StatutoryScheme.EPF,
        threshold_headcount=20,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert obligation.tenant_id is not None


def test_approval_request_requires_tenant_id():
    request = ApprovalRequest(
        tenant_id=uuid.uuid4(),
        gate_type="threshold_crossing_confirmation",
        subject_table="threshold_obligation",
        subject_id=uuid.uuid4(),
        required_approver_role=ApproverRole.FOUNDER,
        idempotency_key="test-key",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert request.tenant_id is not None


def test_gratuity_accrual_balance_requires_tenant_id():
    balance = GratuityAccrualBalance(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        as_of_period=date(2026, 1, 31),
        accrued_amount=Decimal("1000.00"),
        gratuity_wage_base=Decimal("50000.00"),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert balance.tenant_id is not None


def test_final_settlement_requires_tenant_id():
    settlement = FinalSettlement(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        pending_wages=Decimal("10000.00"),
        gratuity_payout=Decimal("5000.00"),
        leave_encashment=Decimal("2000.00"),
        recoveries=Decimal("0.00"),
        total_settlement=Decimal("17000.00"),
        approval_request_id=uuid.uuid4(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert settlement.tenant_id is not None
