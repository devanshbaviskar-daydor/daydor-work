import datetime
import uuid

import pytest

from daydor.mcp.circuit_breaker import CircuitBreaker
from daydor.mcp.core_hr.client import CoreHRClient
from daydor.models.integration import IntegrationCircuitBreakerState


def _breaker() -> CircuitBreaker:
    state = IntegrationCircuitBreakerState(
        integration_name="core_hr", updated_at=datetime.datetime.now(datetime.timezone.utc)
    )
    return CircuitBreaker(state)


async def test_get_active_headcount_not_implemented():
    client = CoreHRClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.get_active_headcount(uuid.uuid4())


async def test_get_employee_not_implemented():
    client = CoreHRClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.get_employee(uuid.uuid4(), uuid.uuid4())
