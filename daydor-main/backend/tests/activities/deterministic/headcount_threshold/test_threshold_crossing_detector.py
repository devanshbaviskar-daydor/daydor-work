import uuid

import pytest

from daydor.activities.deterministic.headcount_threshold.threshold_crossing_detector import (
    detect_threshold_crossings,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await detect_threshold_crossings(uuid.uuid4(), previous_headcount=9, current_headcount=10)
