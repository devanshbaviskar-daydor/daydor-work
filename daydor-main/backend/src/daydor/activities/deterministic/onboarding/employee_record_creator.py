"""employee_record_creator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: Onboarding orchestrator start.

Creates the Core HR employee record for a new hire. A direct, schema-driven
write with no judgment calls - safe to retry automatically since it is
idempotent on `hire_event_id`, a caller-supplied identifier for this hire
event (see `Employee.hire_event_id`), not on full_name or any other natural
key - two employees can share a name, and Aadhaar/PAN aren't collected until
later in the checklist. On retry, a row already present for the same
`hire_event_id` is looked up and its id returned rather than re-inserted;
the underlying table carries a unique constraint on `hire_event_id` so a
concurrent duplicate insert fails the constraint instead of creating a
second row.
"""

from __future__ import annotations

import uuid
from datetime import date

from temporalio import activity


@activity.defn
async def create_employee_record(
    tenant_id: uuid.UUID, hire_event_id: str, full_name: str, date_of_joining: date
) -> uuid.UUID:
    """Create a Core HR employee record and return its id.

    Idempotent on `hire_event_id`: a retry with the same `hire_event_id`
    returns the id of the row already created for it instead of inserting
    a duplicate.
    """
    raise NotImplementedError
