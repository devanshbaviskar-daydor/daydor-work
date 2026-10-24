import datetime
import uuid

import pytest

from daydor.activities.agent.offboarding.offboarding_checklist_builder import (
    build_offboarding_checklist,
)
from daydor.models.compliance import TenantComplianceConfig


async def test_not_implemented():
    tenant_id = uuid.uuid4()
    config = TenantComplianceConfig(
        tenant_id=tenant_id,
        settings_json={"access_to_revoke": ["email", "vpn"]},
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    with pytest.raises(NotImplementedError):
        await build_offboarding_checklist(tenant_id, uuid.uuid4(), config)
