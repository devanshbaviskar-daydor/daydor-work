"""candidate_intake_recorder activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: a candidate's resume/application is received against a posted
`JobRequisition`.

Records a `Candidate` and an `Application` against a requisition. Idempotent
on `(requisition_id, candidate email)`: a retry for a candidate email
already applied to that requisition updates the existing `Candidate`/
`Application` pair rather than creating a duplicate. Pure record-keeping -
no LLM judgment.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from temporalio import activity

from daydor.models.recruitment_ats import Application, Candidate, CandidateSource


@dataclass
class CandidateIntakeInput:
    tenant_id: uuid.UUID
    requisition_id: uuid.UUID
    full_name: str
    email: str
    phone: str
    resume_ref: uuid.UUID
    source: CandidateSource
    applied_at: datetime


@dataclass
class CandidateIntakeResult:
    candidate: Candidate
    application: Application


@activity.defn
async def record_candidate_intake(intake: CandidateIntakeInput) -> CandidateIntakeResult:
    """Record a `Candidate` and `Application` against `intake.requisition_id`,
    idempotent on `(requisition_id, candidate email)` - a retry for an
    already-applied email updates that same pair rather than duplicating it."""
    raise NotImplementedError
