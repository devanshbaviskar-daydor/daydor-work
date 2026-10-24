import uuid

import pytest

from daydor.workflows.headcount_threshold.orchestrator import (
    HeadcountThresholdMonitorInput,
    HeadcountThresholdMonitorWorkflow,
)


async def test_run_not_implemented():
    workflow = HeadcountThresholdMonitorWorkflow()
    with pytest.raises(NotImplementedError):
        await workflow.run(HeadcountThresholdMonitorInput(tenant_id=uuid.uuid4()))
