"""leave_encashment_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `final_settlement_calculator` at offboarding, once the
employee's final `LeaveBalance` as of exit is known.

Computes earned-leave (EL) encashment at exit and populates it into
`FinalSettlement.leave_encashment` - an existing field that previously had
no worker feeding it, closed here rather than by adding a new field. Only
earned leave is encashable: casual and sick leave lapse rather than encash
(Domain 4.1), so `balance.casual_leave_balance` and
`balance.sick_leave_balance` play no part in this calculation. This worker
does not itself trigger the F&F approval gate - the resulting
`FinalSettlement.leave_encashment` feeds into the existing founder sign-off
gate on F&F (Domain 4.3), reused rather than duplicated. Fixed arithmetic
over already-known inputs - no LLM judgment.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from temporalio import activity

from daydor.models.leave_attendance import LeaveBalance


@activity.defn
async def calculate_leave_encashment(
    employee_id: uuid.UUID, final_balance: LeaveBalance, last_drawn_daily_rate: Decimal
) -> Decimal:
    """Compute EL encashment at exit: `final_balance.earned_leave_balance *
    last_drawn_daily_rate`. CL/SL never encash - `final_balance`'s
    casual/sick balances are not read here. The caller
    (`final_settlement_calculator`) writes the result into
    `FinalSettlement.leave_encashment`."""
    raise NotImplementedError
