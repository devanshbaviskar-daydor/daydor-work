"""candidate_data_retention_sweeper activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: scheduled recheck of rejected/inactive `Candidate` rows.

Enforces the DPDP Rules 2025 180-day candidate-data deletion requirement.
The clock starts from the candidate's rejection/inactivity date, not
`applied_at` (captain decision, 2026-10-20: the conservative reading,
pending primary-source verification - see `Candidate.retention_deadline`),
and erasure is preceded by a 48-hour pre-erasure notice rather than deleting
immediately on deadline. A fixed-rule date comparison - no LLM involvement
needed.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import activity


@dataclass
class RetentionSweepResult:
    candidate_id: uuid.UUID
    retention_deadline: date
    pre_erasure_notice_sent: bool
    erased: bool


@activity.defn
async def sweep_candidate_retention(tenant_id: uuid.UUID) -> list[RetentionSweepResult]:
    """Scan this tenant's rejected/inactive `Candidate` rows against
    `retention_deadline` (180 days from rejection/inactivity): send the
    48-hour pre-erasure notice for a candidate approaching deadline, and
    erase a candidate's data once the deadline passes and that notice has
    already been sent. Returns one result per candidate the sweep acted on."""
    raise NotImplementedError
