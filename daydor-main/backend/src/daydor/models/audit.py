"""Append-only audit log.

pgaudit captures "what SQL ran"; this table captures "what business event
happened and why" - the question an inspector or a DPDP breach
investigation actually asks. No application role ever has UPDATE or DELETE
grants on this table - append-only by construction, written in the same
transaction as the mutation it records.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class AuditActorKind(str, Enum):
    HUMAN = "human"
    DETERMINISTIC_WORKER = "deterministic_worker"
    AGENT_DRAFT = "agent_draft"


class AuditLogEntry(BaseModel):
    """One append-only audit row. No `updated_at` - this table is never updated."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    tenant_id: uuid.UUID
    created_at: datetime
    actor_user_id: uuid.UUID | None = None
    actor_kind: AuditActorKind
    event_type: str
    subject_table: str
    subject_id: uuid.UUID
    before_value: dict | None = None
    after_value: dict | None = None
    occurred_at: datetime
