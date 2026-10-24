import uuid

import pytest

from daydor.activities.deterministic.headcount_threshold.registration_deadline_scheduler import (
    find_deadlines_to_escalate,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await find_deadlines_to_escalate(uuid.uuid4())
