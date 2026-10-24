"""pt_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after wage_calculator produces gross pay for a payroll period.

Computes Professional Tax (PT) due, which varies by state slab rather than
a single national rate. Fixed-formula lookup - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class PTDeductionResult:
    employee_id: uuid.UUID
    state_code: str
    amount: Decimal


@activity.defn
async def calculate_pt_deduction(employee_id: uuid.UUID, state_code: str, gross_pay: Decimal) -> PTDeductionResult:
    """Compute Professional Tax due for one employee in one state."""
    raise NotImplementedError
