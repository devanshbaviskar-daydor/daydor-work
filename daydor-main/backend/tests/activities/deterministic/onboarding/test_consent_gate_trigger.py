import uuid

import pytest

from daydor.activities.deterministic.onboarding.consent_gate_trigger import ensure_consent_gate
from daydor.models.consent import ConsentDataCategory, ConsentPurpose


async def test_not_implemented():
    with pytest.raises(NotImplementedError):
        await ensure_consent_gate(
            uuid.uuid4(),
            uuid.uuid4(),
            ConsentDataCategory.AADHAAR,
            ConsentPurpose.IDENTITY_VERIFICATION,
        )
