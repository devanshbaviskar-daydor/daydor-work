import uuid

import pytest

from daydor.activities.agent.payroll_compliance.filing_preparation import prepare_filing_draft
from daydor.models.compliance import StatutoryScheme


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await prepare_filing_draft(uuid.uuid4(), StatutoryScheme.EPF)
