import uuid

import pytest

from daydor.activities.agent.payroll_compliance.salary_structure_import import import_salary_structure


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await import_salary_structure(uuid.uuid4(), uuid.uuid4(), uuid.uuid4())
