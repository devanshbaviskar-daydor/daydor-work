"""hire_confirmation_writer activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an `Offer` reaches `accepted` and any gated background check on the
candidate has resolved `clear`.

Fills the seat: sets `JobRequisition.status` to `filled` and the
`Position.current_employee_id` it points at, idempotent "only while still
vacant" - a retry against a position already filled by this same hire
returns the existing `hire_event_id` rather than re-writing it, and a
position filled by a *different* hire is left untouched rather than
overwritten. Generates `hire_event_id` in the `f"hire-{requisition_id}"`
shape. This worker creates no Core HR record itself: it hands off to
Onboarding's existing `employee_record_creator`, which is idempotent on
this same `hire_event_id` (PR #9) - the established cross-domain
idempotency key, not a new one invented here.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class HireConfirmationInput:
    tenant_id: uuid.UUID
    requisition_id: uuid.UUID
    position_id: uuid.UUID
    offer_id: uuid.UUID


@dataclass
class HireConfirmationResult:
    hire_event_id: str
    requisition_id: uuid.UUID
    position_id: uuid.UUID


@activity.defn
async def write_hire_confirmation(request: HireConfirmationInput) -> HireConfirmationResult:
    """Set `JobRequisition.status` to `filled` and
    `Position.current_employee_id` for `request.position_id`, only while the
    position is still vacant, and return a `hire_event_id` of the shape
    `f"hire-{request.requisition_id}"`. Idempotent: a retry against a
    position this same hire already filled returns the same
    `hire_event_id` rather than re-writing it. Does not create a Core HR
    employee record itself - the caller hands `hire_event_id` to
    Onboarding's `employee_record_creator`."""
    raise NotImplementedError
