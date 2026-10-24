import datetime

import pytest

from daydor.mcp.circuit_breaker import CircuitBreaker, CircuitBreakerOpenError
from daydor.models.integration import IntegrationCircuitBreakerState


def _state() -> IntegrationCircuitBreakerState:
    return IntegrationCircuitBreakerState(
        integration_name="core_hr",
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )


def test_before_call_not_implemented():
    breaker = CircuitBreaker(_state())
    with pytest.raises(NotImplementedError):
        breaker.before_call()


def test_on_success_not_implemented():
    breaker = CircuitBreaker(_state())
    with pytest.raises(NotImplementedError):
        breaker.on_success()


def test_on_failure_not_implemented():
    breaker = CircuitBreaker(_state())
    with pytest.raises(NotImplementedError):
        breaker.on_failure()


async def test_call_not_implemented():
    breaker = CircuitBreaker(_state())

    async def fn():
        return "ok"

    with pytest.raises(NotImplementedError):
        await breaker.call(fn)


def test_circuit_breaker_open_error_names_integration():
    error = CircuitBreakerOpenError("payroll_inputs")
    assert error.integration_name == "payroll_inputs"
    assert "payroll_inputs" in str(error)
