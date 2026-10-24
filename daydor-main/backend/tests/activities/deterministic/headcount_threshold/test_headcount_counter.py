import uuid

import pytest

from daydor.activities.deterministic.headcount_threshold.headcount_counter import (
    count_active_headcount,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await count_active_headcount(uuid.uuid4())
