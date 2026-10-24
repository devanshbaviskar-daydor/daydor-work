import uuid
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.pf_calculator import (
    calculate_pf_contribution,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_pf_contribution(uuid.uuid4(), gross_pay=Decimal("50000"))
