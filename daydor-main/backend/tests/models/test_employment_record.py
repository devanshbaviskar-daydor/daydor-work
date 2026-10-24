import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from daydor.models.payroll import EmploymentRecord, TaxRegimeElection


def test_employment_record_requires_tenant_id():
    record = EmploymentRecord(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        effective_from=date(2026, 1, 1),
        ctc_annual=Decimal("1200000.00"),
        basic_da_monthly=Decimal("50000.00"),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert record.tenant_id is not None
    assert record.effective_to is None
    assert record.wage_floor_compliant is False


def test_employment_record_tax_regime_election():
    record = EmploymentRecord(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        effective_from=date(2026, 1, 1),
        ctc_annual=Decimal("1200000.00"),
        basic_da_monthly=Decimal("50000.00"),
        tax_regime_election=TaxRegimeElection.NEW,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert record.tax_regime_election == TaxRegimeElection.NEW
