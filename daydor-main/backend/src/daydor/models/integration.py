"""Circuit-breaker state for daydor's own external-integration calls.

Daydor's own independent harness - not a port of any shared/co-founder
component - for protecting agent-tier workers from a flapping MCP server.
One row per integration (`core_hr`, `payroll_inputs`, `document_vault`,
...), not per-tenant: the breaker protects the shared integration endpoint
itself, which is the thing that actually fails, rather than any one
tenant's calls through it. This closes the data-model gap the agent
architecture review flagged (Finding 2): the circuit breaker needs a real
table rather than piggybacking on `TenantComplianceConfig.settings_json`,
which is a per-tenant preference blob, not shared infra state.

State machine: CLOSED (calls flow normally) -> OPEN once
`consecutive_failures` reaches `failure_threshold` (calls short-circuit
without reaching the integration) -> HALF_OPEN once `opened_until` has
passed (a single probe call is allowed through) -> CLOSED on a successful
probe, or back to OPEN (with `opened_until` pushed out again) on a failed
one.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class CircuitBreakerStatus(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class IntegrationCircuitBreakerState(BaseModel):
    """One row per external integration's circuit-breaker state.

    Not tenant-scoped - see module docstring. `integration_name` identifies
    the MCP integration this row guards (e.g. "core_hr", "payroll_inputs",
    "document_vault").
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    integration_name: str
    status: CircuitBreakerStatus = CircuitBreakerStatus.CLOSED
    consecutive_failures: int = 0
    failure_threshold: int = 5
    open_duration_seconds: int = 60
    opened_at: datetime | None = None
    opened_until: datetime | None = None
    last_failure_at: datetime | None = None
    last_success_at: datetime | None = None
    updated_at: datetime
