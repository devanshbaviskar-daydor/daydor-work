import uuid
from datetime import date

import pytest

from daydor.workflows.onboarding.orchestrator import (
    OnboardingInput,
    OnboardingOrchestratorWorkflow,
)


async def test_run_not_implemented():
    workflow = OnboardingOrchestratorWorkflow()
    with pytest.raises(NotImplementedError):
        await workflow.run(
            OnboardingInput(
                tenant_id=uuid.uuid4(),
                full_name="Test Employee",
                date_of_joining=date(2026, 1, 1),
            )
        )
