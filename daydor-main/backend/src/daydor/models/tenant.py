"""Tenant model: the root of isolation.

One row per client company. Every other tenant-scoped row's `tenant_id`
foreign-keys here, even though today Daydor's own ops team operates every
tenant on their behalf (no self-serve yet).
"""

from __future__ import annotations

import uuid
from enum import Enum

from pydantic import BaseModel, Field


class TenantStatus(str, Enum):
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    OFFBOARDING = "offboarding"
    CHURNED = "churned"


class Tenant(BaseModel):
    """A client company. Not itself tenant-scoped - it is the scope."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    legal_name: str
    cin: str
    primary_state_code: str
    status: TenantStatus = TenantStatus.ONBOARDING
    founder_user_id: uuid.UUID | None = None
    data_residency_region: str = "IN"
