import uuid

import pytest

from daydor.activities.gated.payroll_compliance.salary_disbursement import (
    DisbursementRequest,
    disburse_salaries,
)


async def test_not_implemented():
    request = DisbursementRequest(
        tenant_id=uuid.uuid4(), payroll_run_id=uuid.uuid4(), idempotency_key="test-key"
    )
    with pytest.raises(NotImplementedError):
        await disburse_salaries(request)
