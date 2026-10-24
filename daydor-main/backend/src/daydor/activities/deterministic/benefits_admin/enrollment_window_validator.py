"""enrollment_window_validator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called while drafting or confirming a `BenefitElection`, after
`benefit_election_drafter` has produced a structured draft.

Checks a draft `BenefitElection` request's timing against the applicable
enrollment window: 15 days from `Employee.date_of_joining` for a new
joiner's first enrollment, or 30 days from a qualifying life event (e.g.
marriage, birth of a child) for an existing employee's dependent addition.
Informational only - matching the `LeaveRequest.balance_sufficient` pattern
(daydor.models.leave_attendance): an out-of-window request is flagged via
`BenefitElection.window_valid`, never silently rejected, since ops may still
have a legitimate reason (e.g. insurer-granted exception) to proceed.
Fixed date-arithmetic check over already-known inputs - no LLM judgment.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from temporalio import activity


@dataclass
class EnrollmentWindowQuery:
    request_date: date
    is_new_joiner: bool
    anchor_date: date
    """`Employee.date_of_joining` for a new joiner, or the qualifying life
    event's date for an existing employee's dependent addition."""


@activity.defn
async def validate_enrollment_window(query: EnrollmentWindowQuery) -> bool:
    """Return whether `query.request_date` falls within the applicable
    window of `query.anchor_date` - 15 days for a new joiner
    (`is_new_joiner=True`), 30 days for a qualifying life event otherwise.
    Never blocks the request itself; the caller sets
    `BenefitElection.window_valid` from this result for ops to judge."""
    raise NotImplementedError
