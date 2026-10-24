import uuid
from datetime import date

import pytest

from daydor.activities.deterministic.payroll_compliance.payroll_run_repository import (
    PayrollRunAssembly,
    PayrollRunKey,
    find_existing_payroll_run,
    persist_payroll_run,
)
from daydor.models.payroll import PayrollRun


def _key() -> PayrollRunKey:
    return PayrollRunKey(
        tenant_id=uuid.uuid4(),
        legal_entity_id=uuid.uuid4(),
        period_start=date(2026, 1, 1),
        period_end=date(2026, 1, 31),
    )


async def test_find_existing_payroll_run_not_implemented():
    with pytest.raises(NotImplementedError):
        await find_existing_payroll_run(_key())


async def test_persist_payroll_run_not_implemented():
    from datetime import datetime, timezone

    key = _key()
    run = PayrollRun(
        tenant_id=key.tenant_id,
        legal_entity_id=key.legal_entity_id,
        period_start=key.period_start,
        period_end=key.period_end,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with pytest.raises(NotImplementedError):
        await persist_payroll_run(PayrollRunAssembly(run=run, payslips=[], line_items=[]))
