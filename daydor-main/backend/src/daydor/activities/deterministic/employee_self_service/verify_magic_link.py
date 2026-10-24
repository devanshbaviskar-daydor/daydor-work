"""verify_magic_link activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee follows the magic-link URL delivered by
`request_magic_link`.

Checks a raw token against `MagicLinkToken` by its hash: the token must
exist, not be expired (`expires_at` in the future), and not already be used
(`used_at` is `None`). Fails closed - any missing, expired, or already-used
token is rejected and no session is issued, never treated as a soft
warning. On success, marks the token used exactly once
(`used_at = now`) and issues a new `Session` for the token's user,
resolving `employee_id` from `User.employee_id`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.ess_auth import Session


@dataclass
class MagicLinkVerification:
    tenant_id: uuid.UUID
    raw_token: str


@activity.defn
async def verify_magic_link(verification: MagicLinkVerification) -> Session | None:
    """Validate `verification.raw_token` against `MagicLinkToken`.

    Returns a newly issued `Session` on success. Returns `None` - never
    raises to signal an invalid token - if the token does not exist, is
    expired, or was already used; a rejected verification marks nothing as
    used and issues no session. On success, marks the matched
    `MagicLinkToken.used_at` exactly once before returning, so a retried or
    replayed call with the same raw token fails closed on its second use."""
    raise NotImplementedError
