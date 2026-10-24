import uuid
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.esi_calculator import (
    calculate_esi_contribution,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_esi_contribution(uuid.uuid4(), gross_pay=Decimal("18000"))
