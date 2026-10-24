"""obligation_checklist_generator activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: after threshold_crossing_detector reports a newly crossed threshold.

Drafts the human-readable checklist of registration and compliance steps a
tenant now owes (e.g. "register for EPF establishment code within N days")
for an ops team member to review. Read-only: it drafts a checklist, it does
not file anything or change obligation state itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.activities.deterministic.headcount_threshold.threshold_crossing_detector import (
    ThresholdCrossing,
)


@dataclass
class ChecklistItem:
    description: str
    statutory_deadline_days: int | None


@activity.defn
async def generate_obligation_checklist(
    tenant_id: uuid.UUID, crossing: ThresholdCrossing
) -> list[ChecklistItem]:
    """Draft the compliance checklist for a newly crossed headcount threshold."""
    raise NotImplementedError
