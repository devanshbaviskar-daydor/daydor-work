import datetime

from daydor.models.integration import CircuitBreakerStatus, IntegrationCircuitBreakerState


def test_circuit_breaker_state_defaults_closed():
    state = IntegrationCircuitBreakerState(
        integration_name="core_hr",
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    assert state.status == CircuitBreakerStatus.CLOSED
    assert state.consecutive_failures == 0
    assert state.failure_threshold == 5
    assert state.open_duration_seconds == 60


def test_circuit_breaker_state_is_not_tenant_scoped():
    state = IntegrationCircuitBreakerState(
        integration_name="payroll_inputs",
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    assert not hasattr(state, "tenant_id")


def test_circuit_breaker_state_can_represent_open():
    now = datetime.datetime.now(datetime.timezone.utc)
    state = IntegrationCircuitBreakerState(
        integration_name="document_vault",
        status=CircuitBreakerStatus.OPEN,
        consecutive_failures=5,
        opened_at=now,
        opened_until=now + datetime.timedelta(seconds=60),
        last_failure_at=now,
        updated_at=now,
    )
    assert state.status == CircuitBreakerStatus.OPEN
    assert state.consecutive_failures == state.failure_threshold
