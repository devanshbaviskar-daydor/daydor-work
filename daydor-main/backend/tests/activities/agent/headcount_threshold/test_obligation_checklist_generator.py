import uuid

import pytest

from daydor.activities.agent.headcount_threshold.obligation_checklist_generator import (
    generate_obligation_checklist,
)
from daydor.activities.deterministic.headcount_threshold.threshold_crossing_detector import (
    ThresholdCrossing,
)
from daydor.models.compliance import StatutoryScheme


async def test_not_implemented():
    crossing = ThresholdCrossing(scheme=StatutoryScheme.EPF, threshold_headcount=20, current_headcount=20)
    with pytest.raises(NotImplementedError):
        await generate_obligation_checklist(uuid.uuid4(), crossing)
