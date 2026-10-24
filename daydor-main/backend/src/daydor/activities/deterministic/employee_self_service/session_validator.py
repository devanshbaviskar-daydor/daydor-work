"""session_validator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by every Employee Self-Service Portal worker (starting with
`self_service_scope_guard`, Domain 6) before acting on a request, to
resolve who is asking.

Resolves a session id to exactly one `(tenant_id, employee_id)` pair. This
is the only sanctioned way for a Portal worker to learn `employee_id` -
never a request parameter, since a request parameter is attacker-
controlled and would let one employee read or write another's data. Fails
closed: a missing or expired `Session` resolves to `None`, never a
guessed or default identity.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class ResolvedIdentity:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID


@activity.defn
async def validate_session(session_id: uuid.UUID) -> ResolvedIdentity | None:
    """Resolve `session_id` to its `(tenant_id, employee_id)` pair.

    Returns `None` if the session does not exist or `expires_at` has
    passed - an expired or unknown session never resolves to an identity,
    so callers must treat `None` as "not authenticated" and refuse the
    request rather than falling back to any other source of identity."""
    raise NotImplementedError
