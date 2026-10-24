"""Daydor's own per-integration circuit breaker for MCP client calls.

Daydor-built harness, not a port of the co-founder's shared circuit
breaker - consulted only for the general closed/open/probe shape. State
lives in `IntegrationCircuitBreakerState` (one row per integration name),
not in-process, so the breaker's view is consistent across worker
processes.

Every agent-tier MCP client method should route its external call through
`CircuitBreaker.call` for its integration, so a flapping MCP server trips
the breaker once (closed -> open) rather than once per in-flight call, and
callers get an immediate `CircuitBreakerOpenError` instead of piling up
retries against a server that is already down.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import TypeVar

from daydor.models.integration import CircuitBreakerStatus, IntegrationCircuitBreakerState

T = TypeVar("T")


class CircuitBreakerOpenError(RuntimeError):
    """Raised instead of calling through when an integration's breaker is open."""

    def __init__(self, integration_name: str):
        super().__init__(f"circuit breaker open for integration '{integration_name}'")
        self.integration_name = integration_name


class CircuitBreaker:
    """Tracks and enforces one integration's closed/open/half-open state.

    Persistence of `IntegrationCircuitBreakerState` (loading the current
    row, writing back transitions) is intentionally not implemented here -
    this scaffold pass defines the state machine and its data-model home;
    wiring it to Postgres is follow-up work, consistent with every other
    stub in this repo.
    """

    def __init__(self, state: IntegrationCircuitBreakerState):
        self.state = state

    def before_call(self) -> None:
        """Raise if the breaker is open and not yet eligible for a probe."""
        raise NotImplementedError

    def on_success(self) -> None:
        """Record a successful call: reset failures, close the breaker."""
        raise NotImplementedError

    def on_failure(self) -> None:
        """Record a failed call: increment failures, opening the breaker
        once `failure_threshold` consecutive failures is reached."""
        raise NotImplementedError

    async def call(self, fn: Callable[[], Awaitable[T]]) -> T:
        """Run `fn` through the breaker: short-circuit if open, otherwise
        call through and record the outcome."""
        raise NotImplementedError
