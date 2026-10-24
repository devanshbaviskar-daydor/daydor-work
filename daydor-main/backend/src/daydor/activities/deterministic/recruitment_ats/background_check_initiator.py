"""background_check_initiator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: the candidate's DPDP consent gate (`background_check_consent_gate`)
clears for a given check type.

Orders the consented checks from a third-party BGV vendor and sets
`BackgroundCheckRecord.ordered_at`/`vendor`. Idempotent on `candidate_id`: a
retry for a candidate with an already-ordered, not-yet-resolved batch
returns that existing row rather than placing a duplicate vendor order. No
adverse-action-stage timing logic - India has no FCRA-equivalent mandated
waiting period before an employer can act on an `adverse` result (Domain
5.1), so this worker's job ends at placing the order; it never gates the
result.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from temporalio import activity

from daydor.models.recruitment_ats import BackgroundCheckRecord, BackgroundCheckType


@dataclass
class BackgroundCheckOrderInput:
    tenant_id: uuid.UUID
    candidate_id: uuid.UUID
    check_types: list[BackgroundCheckType]
    vendor: str
    ordered_at: datetime


@activity.defn
async def initiate_background_check(request: BackgroundCheckOrderInput) -> BackgroundCheckRecord:
    """Order `request.check_types` from `request.vendor` for
    `request.candidate_id`, idempotent on `candidate_id` - a retry against a
    candidate with an already-ordered, unresolved batch returns that
    existing `BackgroundCheckRecord` rather than placing a second vendor
    order. Only called once DPDP consent for the relevant data categories
    has cleared."""
    raise NotImplementedError
