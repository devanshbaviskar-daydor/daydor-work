"""filing_preparation activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: as a statutory filing's due date approaches.

Assembles a draft statutory filing (e.g. PF ECR) from the period's
computed contributions for an ops team member to review before
submission. Read-only: it drafts, it never submits.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import StatutoryScheme


@dataclass
class DraftFiling:
    tenant_id: uuid.UUID
    scheme: StatutoryScheme
    draft_payload: dict


@activity.defn
async def prepare_filing_draft(tenant_id: uuid.UUID, scheme: StatutoryScheme) -> DraftFiling:
    """Draft a statutory filing for human review."""
    raise NotImplementedError
