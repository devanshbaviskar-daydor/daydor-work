"""esi_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after wage_calculator produces gross pay for a payroll period.

Computes Employees' State Insurance (ESI) employee and employer
contributions from gross pay, per statutory rates and the wage-ceiling
eligibility rule. Fixed-formula calculation - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class ESIContributionResult:
    employee_id: uuid.UUID
    is_eligible: bool
    employee_contribution: Decimal
    employer_contribution: Decimal


@activity.defn
async def calculate_esi_contribution(employee_id: uuid.UUID, gross_pay: Decimal) -> ESIContributionResult:
    """Compute ESI employee and employer contributions for one employee."""
    raise NotImplementedError
