"""screening_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an `Application` reaches the `screening` stage.

Produces a draft shortlist/hold/reject recommendation from resume/
application data, for human review. Never auto-rejects or otherwise moves
`Application.stage` itself - a human applies the recommendation. India has
no AEDT-equivalent automated-hiring bias-audit regulation, so no additional
bias-audit gate is needed here: the agent-draft tier's own human-review
requirement already satisfies DPDP's explainability duty (captain decision,
2026-10-20).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from enum import Enum

from temporalio import activity


class ScreeningRecommendation(str, Enum):
    SHORTLIST = "shortlist"
    HOLD = "hold"
    REJECT = "reject"


@dataclass
class ScreeningDraftInput:
    tenant_id: uuid.UUID
    application_id: uuid.UUID


@dataclass
class ScreeningDraft:
    application_id: uuid.UUID
    recommendation: ScreeningRecommendation
    rationale: str


@activity.defn
async def draft_screening_recommendation(request: ScreeningDraftInput) -> ScreeningDraft:
    """Draft a shortlist/hold/reject recommendation with rationale for
    `request.application_id`, from resume/application data, for human
    review. Never changes `Application.stage` itself."""
    raise NotImplementedError
