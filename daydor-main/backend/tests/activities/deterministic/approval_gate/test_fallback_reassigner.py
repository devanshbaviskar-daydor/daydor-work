import uuid

import pytest

from daydor.activities.deterministic.approval_gate.fallback_reassigner import (
    ReassignmentRequest,
    reassign_to_fallback_approver,
)


async def test_not_implemented():
    request = ReassignmentRequest(
        tenant_id=uuid.uuid4(),
        approval_request_id=uuid.uuid4(),
        fallback_approver_user_id=uuid.uuid4(),
    )
    with pytest.raises(NotImplementedError):
        await reassign_to_fallback_approver(request)
