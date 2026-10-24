import uuid
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.pt_calculator import (
    calculate_pt_deduction,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_pt_deduction(uuid.uuid4(), state_code="KA", gross_pay=Decimal("50000"))
