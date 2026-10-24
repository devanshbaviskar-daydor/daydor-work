"""final_settlement_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: offboarding orchestrator start, once exit date is recorded.

Computes one employee's full-and-final settlement: pending wages to last
working day, leave encashment, and recoveries, netted into a total.
Gratuity payout is read from the existing GratuityAccrualBalance running
balance as of exit, not recomputed from scratch here. Leave encashment is
likewise not recomputed here: it calls `leave_attendance.leave_encashment_calculator`
for the employee's final EL balance, per Domain 4.2. Fixed arithmetic over
already-known inputs - no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from temporalio import activity


@dataclass
class FinalSettlementResult:
    employee_id: uuid.UUID
    pending_wages: Decimal
    gratuity_payout: Decimal
    leave_encashment: Decimal
    recoveries: Decimal
    total_settlement: Decimal


@activity.defn
async def calculate_final_settlement(
    tenant_id: uuid.UUID, employee_id: uuid.UUID, last_working_day: date
) -> FinalSettlementResult:
    """Compute one employee's full-and-final settlement at exit."""
    raise NotImplementedError
