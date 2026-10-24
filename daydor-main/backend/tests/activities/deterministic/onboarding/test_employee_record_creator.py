import uuid
from datetime import date

import pytest

from daydor.activities.deterministic.onboarding.employee_record_creator import (
    create_employee_record,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await create_employee_record(
            uuid.uuid4(), hire_event_id="hire-evt-1", full_name="Test Employee", date_of_joining=date(2026, 1, 1)
        )
