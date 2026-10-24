import uuid

import pytest

from daydor.activities.deterministic.approval_gate.escalation_notifier import (
    EscalationNotice,
    notify_gate_timeout,
)


async def test_not_implemented():
    notice = EscalationNotice(
        tenant_id=uuid.uuid4(),
        approval_request_id=uuid.uuid4(),
        gate_type="payroll_disbursement_approval",
    )
    with pytest.raises(NotImplementedError):
        await notify_gate_timeout(notice)
