import uuid
from datetime import date

import pytest

from daydor.models.compliance import StatutoryScheme
from daydor.workflows.payroll_compliance.compliance_orchestrator import (
    ComplianceFilingInput,
    ComplianceOrchestratorWorkflow,
)


async def test_run_not_implemented():
    workflow = ComplianceOrchestratorWorkflow()
    with pytest.raises(NotImplementedError):
        await workflow.run(
            ComplianceFilingInput(
                tenant_id=uuid.uuid4(),
                scheme=StatutoryScheme.EPF,
                period_start=date(2026, 1, 1),
                period_end=date(2026, 1, 31),
            )
        )
