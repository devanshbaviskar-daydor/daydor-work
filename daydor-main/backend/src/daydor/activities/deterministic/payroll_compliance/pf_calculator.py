"""pf_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after wage_calculator produces gross pay for a payroll period.

Computes Employees' Provident Fund (EPF) employee and employer
contributions from gross pay, per statutory rates. Fixed-formula
calculation - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class PFContributionResult:
    employee_id: uuid.UUID
    employee_contribution: Decimal
    employer_contribution: Decimal


@activity.defn
async def calculate_pf_contribution(employee_id: uuid.UUID, gross_pay: Decimal) -> PFContributionResult:
    """Compute EPF employee and employer contributions for one employee."""
    raise NotImplementedError
