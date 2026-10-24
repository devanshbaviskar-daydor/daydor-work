"""posting_publisher activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: a `JobRequisition` reaches `approved` status.

Drafts a job-posting listing from the requisition and its role context, for
ops/founder review. Never auto-publishes externally - publishing to any job
board or careers page is a separate, human-initiated action once the draft
is reviewed.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class PostingPublisherInput:
    tenant_id: uuid.UUID
    requisition_id: uuid.UUID


@dataclass
class JobPostingDraft:
    title: str
    description: str
    requirements: str


@activity.defn
async def draft_job_posting(request: PostingPublisherInput) -> JobPostingDraft:
    """Draft a job-posting listing from `request.requisition_id` and its
    role context, for ops/founder review. Never publishes the listing
    externally itself."""
    raise NotImplementedError
