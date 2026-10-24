"""Stub client for the payroll inputs MCP server. No real transport wired yet."""

from __future__ import annotations

import uuid
from datetime import date

from daydor.mcp.circuit_breaker import CircuitBreaker

INTEGRATION_NAME = "payroll_inputs"


class PayrollInputsClient:
    """Read-only access to attendance, leave, and salary-structure data.

    Every call routes through `self._breaker` (this integration's
    `CircuitBreaker`) so a flapping payroll-inputs MCP server trips once
    rather than once per in-flight caller.
    """

    def __init__(self, breaker: CircuitBreaker):
        self._breaker = breaker

    async def get_attendance(
        self, tenant_id: uuid.UUID, employee_id: uuid.UUID, period_start: date, period_end: date
    ) -> dict:
        """Fetch attendance/leave data for one employee over one period."""
        return await self._breaker.call(
            lambda: self._get_attendance(tenant_id, employee_id, period_start, period_end)
        )

    async def _get_attendance(
        self, tenant_id: uuid.UUID, employee_id: uuid.UUID, period_start: date, period_end: date
    ) -> dict:
        raise NotImplementedError

    async def get_salary_structure(self, tenant_id: uuid.UUID, employee_id: uuid.UUID) -> dict:
        """Fetch the current salary structure (CTC breakup) for one employee."""
        return await self._breaker.call(lambda: self._get_salary_structure(tenant_id, employee_id))

    async def _get_salary_structure(self, tenant_id: uuid.UUID, employee_id: uuid.UUID) -> dict:
        raise NotImplementedError
