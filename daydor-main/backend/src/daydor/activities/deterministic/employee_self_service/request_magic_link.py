"""request_magic_link activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee submits their email on the Employee Self-Service
Portal's login screen.

Looks up the `User` row matching the given email with
`role=EMPLOYEE_SELF_SERVICE` and `is_active=True`, generates a fresh
single-use token, persists a `MagicLinkToken` (storing only its hash, never
the raw token) with a 15-minute expiry, and triggers delivery of the raw
token to the employee by email. Does not reveal whether a given email
matched a user - the caller-visible outcome is the same either way, so this
worker cannot be used to enumerate registered employee emails.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.ess_auth import MagicLinkToken


@dataclass
class MagicLinkRequest:
    tenant_id: uuid.UUID
    email: str


@activity.defn
async def request_magic_link(request: MagicLinkRequest) -> None:
    """Look up the active `EMPLOYEE_SELF_SERVICE` user for `request.email`,
    create and persist a `MagicLinkToken` for them, and deliver the raw
    token by email. No-ops (without error) if no matching active
    `EMPLOYEE_SELF_SERVICE` user exists, so the caller cannot distinguish
    a known from an unknown email."""
    raise NotImplementedError


@activity.defn
async def send_magic_link_email(email: str, raw_token: str, token: MagicLinkToken) -> None:
    """Deliver `raw_token` to `email` as a magic-link login URL.

    Stub: no email provider integration exists anywhere in this repo yet.
    When built, this should call the eventual transactional-email provider
    (e.g. SES/SendGrid/Postmark - not yet decided) with a templated message
    containing a login URL embedding `raw_token`, expiring per
    `token.expires_at`. SMS delivery is deferred (captain decision,
    2026-10-20) - email only for now."""
    raise NotImplementedError
