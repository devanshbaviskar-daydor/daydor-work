import uuid
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.gratuity_accrual_tracker import (
    calculate_gratuity_accrual_delta,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_gratuity_accrual_delta(uuid.uuid4(), gratuity_wage_base=Decimal("30000"))
