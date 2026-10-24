import datetime
import uuid

import pytest

from daydor.activities.agent.onboarding.onboarding_checklist_generator import (
    generate_onboarding_checklist,
)
from daydor.models.compliance import TenantComplianceConfig


async def test_not_implemented():
    tenant_id = uuid.uuid4()
    config = TenantComplianceConfig(
        tenant_id=tenant_id,
        settings_json={"documents_collected": ["pan", "aadhaar"]},
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    with pytest.raises(NotImplementedError):
        await generate_onboarding_checklist(tenant_id, uuid.uuid4(), config)
