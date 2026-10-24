"""Base model for every Daydor Postgres table.

`tenant_id` is required on every table, not optional, even though Daydor
currently runs as a single-tenant managed service. This keeps a later move to
self-serve multi-tenant SaaS a migration of behavior, not of schema.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TenantScopedModel(BaseModel):
    """Base for all row models. Every subclass must carry `tenant_id`."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
