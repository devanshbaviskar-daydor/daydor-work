"""leave_policy_resolver activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `leave_accrual_calculator` and `overtime_calculator`
before they compute anything that depends on policy figures.

Resolves the single `LeavePolicyRule` applicable to one employee as of a
given date: looked up by the employee's `state_code` (only Karnataka ("KA")
populated for v1) and `employment_type`, narrowed to the row whose
`effective_from`/`effective_to` window covers that date. Fixed lookup - no
LLM judgment. Not tenant-scoped, since the rule itself is state law, not a
tenant preference.
"""

from __future__ import annotations

from datetime import date

from temporalio import activity

from daydor.models.employee import EmploymentType
from daydor.models.leave_attendance import LeavePolicyRule


@activity.defn
async def resolve_leave_policy(
    state_code: str, employment_type: EmploymentType, as_of: date
) -> LeavePolicyRule:
    """Resolve the `LeavePolicyRule` in force for `state_code` and
    `employment_type` on `as_of`.

    Raises if no rule's effective-dated window covers `as_of` for that
    state - a gap in the versioned rule table is a data problem, not
    something this activity should paper over with a stale fallback.
    """
    raise NotImplementedError
