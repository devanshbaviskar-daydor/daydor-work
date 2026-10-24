"""Employee Self-Service auth models: magic-link login and session.

Scoped narrowly to `UserRole.EMPLOYEE_SELF_SERVICE` (see `identity.py`) -
not a general auth system. Founder/ops/admin logins stay out of scope and
have no session mechanism of their own yet.

`MagicLinkToken` never stores the raw token, only `token_hash` - the raw
token exists only in the delivered email and the verifying request, never
at rest. A token is single-use: `used_at` starts `None` and is set exactly
once by `verify_magic_link`, after which the token can never authenticate
again regardless of its expiry.

`Session` is what every Employee Self-Service Portal worker resolves "who
is asking" from - `self_service_scope_guard` and the other workers in
Domain 6 call session validation rather than trusting a request parameter
for `employee_id`. Session lifetime is 24 hours (captain decision,
2026-10-20).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from daydor.models.base import TenantScopedModel

MAGIC_LINK_TOKEN_TTL_MINUTES = 15
SESSION_TTL_HOURS = 24


class MagicLinkToken(TenantScopedModel):
    """A single-use, time-limited login token for employee self-service.

    `expires_at` is always `created_at` + `MAGIC_LINK_TOKEN_TTL_MINUTES`.
    `used_at` is `None` until the token is consumed by `verify_magic_link`,
    then set once; a used or expired token can never authenticate again.
    """

    user_id: uuid.UUID
    token_hash: str
    expires_at: datetime
    used_at: datetime | None = None


class Session(TenantScopedModel):
    """An authenticated employee self-service session.

    Resolves to exactly one `(tenant_id, employee_id)` pair - the sole
    source of truth for "who is asking" that every Employee Self-Service
    Portal worker must call, never a request parameter. `expires_at` is
    always `created_at` + `SESSION_TTL_HOURS`.
    """

    user_id: uuid.UUID
    employee_id: uuid.UUID
    expires_at: datetime
