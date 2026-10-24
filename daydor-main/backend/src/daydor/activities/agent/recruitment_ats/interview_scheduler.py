"""interview_scheduler activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an `Application` reaches the `interview` stage.

Drafts interview scheduling - proposed time slots and an interviewer
assignment - for ops/hiring-manager confirmation. Never books a calendar
invite autonomously; confirming and sending the invite is a separate,
human-initiated action once the draft is reviewed.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from temporalio import activity


@dataclass
class InterviewSchedulerInput:
    tenant_id: uuid.UUID
    application_id: uuid.UUID


@dataclass
class InterviewSlotDraft:
    application_id: uuid.UUID
    proposed_slots: list[datetime]
    interviewer_id: uuid.UUID


@activity.defn
async def draft_interview_schedule(request: InterviewSchedulerInput) -> InterviewSlotDraft:
    """Draft proposed interview slots and an interviewer assignment for
    `request.application_id`, for ops/hiring-manager confirmation. Never
    books a calendar invite itself."""
    raise NotImplementedError
