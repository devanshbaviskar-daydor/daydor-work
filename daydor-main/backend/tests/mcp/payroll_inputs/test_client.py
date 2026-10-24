import datetime
import uuid
from datetime import date

import pytest

from daydor.mcp.circuit_breaker import CircuitBreaker
from daydor.mcp.payroll_inputs.client import PayrollInputsClient
from daydor.models.integration import IntegrationCircuitBreakerState


def _breaker() -> CircuitBreaker:
    state = IntegrationCircuitBreakerState(
        integration_name="payroll_inputs", updated_at=datetime.datetime.now(datetime.timezone.utc)
    )
    return CircuitBreaker(state)


async def test_get_attendance_not_implemented():
    client = PayrollInputsClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.get_attendance(uuid.uuid4(), uuid.uuid4(), date(2026, 1, 1), date(2026, 1, 31))


async def test_get_salary_structure_not_implemented():
    client = PayrollInputsClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.get_salary_structure(uuid.uuid4(), uuid.uuid4())
