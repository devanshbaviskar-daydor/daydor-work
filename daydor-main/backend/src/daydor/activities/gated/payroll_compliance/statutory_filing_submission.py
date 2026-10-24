"""statutory_filing_submission activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: founder approval of a prepared statutory filing (PF ECR, ESI
contribution, PT return, TDS return).

Submits a prepared statutory filing to the relevant government portal. A
government filing is hard to reverse and a missed or duplicate submission
has real consequences - requires the approval gate and an idempotency key,
with no automatic retry on failure.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import StatutoryScheme


@dataclass
class FilingSubmission:
    tenant_id: uuid.UUID
    scheme: StatutoryScheme
    filing_record_id: uuid.UUID
    idempotency_key: str


@activity.defn
async def submit_statutory_filing(submission: FilingSubmission) -> None:
    """Submit a prepared statutory filing. No automatic retry."""
    raise NotImplementedError
