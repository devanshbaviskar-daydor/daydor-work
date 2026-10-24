"""registration_status_tracker activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: founder approval of a drafted registration checklist item
(e.g. EPF establishment registration).

Submits or updates a statutory registration (e.g. with EPFO/ESIC) once a
human has approved it, and records the resulting registration status. A
government-facing, hard-to-reverse action - requires the approval gate and
an idempotency key so a retried signal can't double-submit.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import StatutoryScheme


@dataclass
class RegistrationSubmission:
    tenant_id: uuid.UUID
    scheme: StatutoryScheme
    idempotency_key: str


@activity.defn
async def submit_registration(submission: RegistrationSubmission) -> None:
    """Submit a statutory registration after human approval. No automatic retry."""
    raise NotImplementedError
