import uuid
from datetime import date
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.gratuity_repository import (
    GratuityBalanceUpdate,
    find_gratuity_balance,
    find_gratuity_threshold_obligation,
    upsert_gratuity_balance,
)


async def test_find_gratuity_balance_not_implemented():
    with pytest.raises(NotImplementedError):
        await find_gratuity_balance(uuid.uuid4(), uuid.uuid4())


async def test_find_gratuity_threshold_obligation_not_implemented():
    with pytest.raises(NotImplementedError):
        await find_gratuity_threshold_obligation(uuid.uuid4())


async def test_upsert_gratuity_balance_not_implemented():
    update = GratuityBalanceUpdate(
        employee_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        as_of_period=date(2026, 1, 31),
        accrued_amount=Decimal("17307.69"),
        gratuity_wage_base=Decimal("30000"),
    )
    with pytest.raises(NotImplementedError):
        await upsert_gratuity_balance(update)
