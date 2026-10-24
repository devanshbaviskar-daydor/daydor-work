"""User/Identity model: who can log in and act.

Distinct from `Employee`, which is a record about a person, not a login. A
founder is both: a `User` who approves things, and usually also an
`Employee` of their own company. Daydor ops staff are `User` rows with no
corresponding `Employee` row in any tenant - they act across tenants, scoped
by role, not tenant membership, which is why `tenant_id` is nullable here.
This is the one deliberate exception to "every row carries tenant_id",
confirmed acceptable by the captain.
"""

from __future__ import annotations

import uuid
from enum import Enum

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    FOUNDER = "founder"
    EMPLOYEE_SELF_SERVICE = "employee_self_service"
    DAYDOR_OPS = "daydor_ops"
    DAYDOR_ADMIN = "daydor_admin"


class User(BaseModel):
    """A login identity, optionally linked to an Employee record."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    tenant_id: uuid.UUID | None = None
    email: str
    role: UserRole
    employee_id: uuid.UUID | None = None
    is_active: bool = True
