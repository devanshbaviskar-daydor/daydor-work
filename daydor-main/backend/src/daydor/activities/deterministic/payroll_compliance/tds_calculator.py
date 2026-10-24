"""tds_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after wage_calculator produces gross pay for a payroll period.

Computes Tax Deducted at Source (TDS) on salary per the employee's
declared tax regime and investment declarations. Fixed-formula
calculation - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class TDSDeductionResult:
    employee_id: uuid.UUID
    amount: Decimal


@activity.defn
async def calculate_tds_deduction(
    employee_id: uuid.UUID, gross_pay: Decimal, tax_regime: str
) -> TDSDeductionResult:
    """Compute TDS due on salary for one employee for one payroll period."""
    raise NotImplementedError
