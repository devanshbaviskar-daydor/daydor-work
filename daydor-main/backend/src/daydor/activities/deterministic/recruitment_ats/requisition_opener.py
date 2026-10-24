"""requisition_opener activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: a hiring manager or ops requests a requisition be opened against an
open, vacant, budgeted `Position`.

Validates that a `Position` is open, vacant (`current_employee_id` unset),
and budgeted, then opens a `JobRequisition` against it in `draft` status.
Idempotent per position: at most one live requisition (any status other
than `filled`, `cancelled`, or `rejected`) may exist for a given
`position_id` - a retry against a position that already has a live
requisition returns that existing row rather than opening a second one.

Also surfaces a read-only heads-up if filling the seat would cross a
statutory headcount threshold, by reading the tenant's existing
`ThresholdObligation` rows from the Headcount Threshold Monitor domain
(captain decision, 2026-10-20: no new gate or write-path here - this worker
never writes to `ThresholdObligation` and never blocks opening the
requisition on the result).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import StatutoryScheme
from daydor.models.recruitment_ats import JobRequisition


@dataclass
class ThresholdHeadsUp:
    scheme: StatutoryScheme
    threshold_headcount: int


@dataclass
class RequisitionOpenerResult:
    requisition: JobRequisition
    threshold_heads_up: list[ThresholdHeadsUp]


@activity.defn
async def open_requisition(
    tenant_id: uuid.UUID, position_id: uuid.UUID, hiring_manager_id: uuid.UUID
) -> RequisitionOpenerResult:
    """Validate `position_id` is open/vacant/budgeted and open a `draft`
    `JobRequisition` against it, idempotent per position. Also returns a
    read-only list of statutory headcount thresholds filling the seat would
    cross, read against the tenant's `ThresholdObligation` rows - purely
    informational, never a gate on opening the requisition."""
    raise NotImplementedError
