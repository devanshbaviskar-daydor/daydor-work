import uuid

import pytest

from daydor.activities.gated.payroll_compliance.statutory_filing_submission import (
    FilingSubmission,
    submit_statutory_filing,
)
from daydor.models.compliance import StatutoryScheme


async def test_not_implemented():
    submission = FilingSubmission(
        tenant_id=uuid.uuid4(),
        scheme=StatutoryScheme.EPF,
        filing_record_id=uuid.uuid4(),
        idempotency_key="test-key",
    )
    with pytest.raises(NotImplementedError):
        await submit_statutory_filing(submission)
