import uuid
from datetime import date

import pytest

from daydor.workflows.payroll_compliance.payroll_orchestrator import (
    PayrollOrchestratorWorkflow,
    PayrollRunInput,
)


async def test_run_not_implemented():
    workflow = PayrollOrchestratorWorkflow()
    with pytest.raises(NotImplementedError):
        await workflow.run(
            PayrollRunInput(
                tenant_id=uuid.uuid4(),
                period_start=date(2026, 1, 1),
                period_end=date(2026, 1, 31),
            )
        )
