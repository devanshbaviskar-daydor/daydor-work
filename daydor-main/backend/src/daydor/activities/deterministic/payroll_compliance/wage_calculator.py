"""wage_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: payroll run start, once attendance/leave inputs are available.

Computes gross and net wages for one employee from salary structure and
attendance data. Fixed statutory/contractual arithmetic - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class WageCalculationResult:
    employee_id: uuid.UUID
    gross_pay: Decimal
    net_pay: Decimal


@activity.defn
async def calculate_wages(
    tenant_id: uuid.UUID, employee_id: uuid.UUID, salary_structure: dict, attendance: dict
) -> WageCalculationResult:
    """Compute one employee's gross and net pay for a payroll period."""
    raise NotImplementedError
