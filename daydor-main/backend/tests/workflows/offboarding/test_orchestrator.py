import uuid
from datetime import date

import pytest

from daydor.workflows.offboarding.orchestrator import (
    OffboardingInput,
    OffboardingOrchestratorWorkflow,
)


async def test_run_not_implemented():
    workflow = OffboardingOrchestratorWorkflow()
    with pytest.raises(NotImplementedError):
        await workflow.run(
            OffboardingInput(
                tenant_id=uuid.uuid4(),
                employee_id=uuid.uuid4(),
                last_working_day=date(2026, 1, 31),
            )
        )
