import uuid

import pytest

from daydor.activities.gated.headcount_threshold.registration_status_tracker import (
    RegistrationSubmission,
    submit_registration,
)
from daydor.models.compliance import StatutoryScheme


async def test_not_implemented():
    submission = RegistrationSubmission(
        tenant_id=uuid.uuid4(), scheme=StatutoryScheme.EPF, idempotency_key="test-key"
    )
    with pytest.raises(NotImplementedError):
        await submit_registration(submission)
