import uuid
from datetime import date

import pytest

from daydor.activities.deterministic.offboarding.final_settlement_calculator import (
    calculate_final_settlement,
)


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await calculate_final_settlement(
            uuid.uuid4(), uuid.uuid4(), last_working_day=date(2026, 1, 31)
        )
