import uuid
from decimal import Decimal

import pytest

from daydor.activities.deterministic.payroll_compliance.tds_calculator import (
    calculate_tds_deduction,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_tds_deduction(uuid.uuid4(), gross_pay=Decimal("100000"), tax_regime="new")
