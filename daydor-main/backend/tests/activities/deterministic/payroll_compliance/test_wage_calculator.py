import uuid

import pytest

from daydor.activities.deterministic.payroll_compliance.wage_calculator import calculate_wages


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_wages(uuid.uuid4(), uuid.uuid4(), salary_structure={}, attendance={})
