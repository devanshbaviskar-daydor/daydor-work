"""Stub client for the Core HR MCP server. No real transport wired yet."""

from __future__ import annotations

import uuid

from daydor.mcp.circuit_breaker import CircuitBreaker

INTEGRATION_NAME = "core_hr"


class CoreHRClient:
    """Read-only access to employee and org-structure data via MCP.

    Every call routes through `self._breaker` (this integration's
    `CircuitBreaker`) so a flapping Core HR MCP server trips once rather
    than once per in-flight caller.
    """

    def __init__(self, breaker: CircuitBreaker):
        self._breaker = breaker

    async def get_active_headcount(self, tenant_id: uuid.UUID) -> int:
        """Return the current count of active employees for a tenant."""
        return await self._breaker.call(lambda: self._get_active_headcount(tenant_id))

    async def _get_active_headcount(self, tenant_id: uuid.UUID) -> int:
        raise NotImplementedError

    async def get_employee(self, tenant_id: uuid.UUID, employee_id: uuid.UUID) -> dict:
        """Fetch a single employee record."""
        return await self._breaker.call(lambda: self._get_employee(tenant_id, employee_id))

    async def _get_employee(self, tenant_id: uuid.UUID, employee_id: uuid.UUID) -> dict:
        raise NotImplementedError
