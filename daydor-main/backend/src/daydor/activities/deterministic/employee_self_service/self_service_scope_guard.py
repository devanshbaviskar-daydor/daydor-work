"""self_service_scope_guard activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by every other Employee Self-Service Portal worker (Domain
6.3) before it touches any Payroll/Leave & Attendance/Document Vault/
Employee data, immediately after `validate_session` resolves the caller's
identity.

The actual enforcement of "an employee can only see/do things about their
own pay, leave, attendance, and documents" (Domain 6.1). Takes the
`employee_id` a caller is requesting data about and the `ResolvedIdentity`
`validate_session` returned for the active session, and refuses outright
- never silently filters or hides - any request where the two don't match.
This is the only place that comparison is made: no Portal worker resolves
`employee_id` from a request parameter, and none re-implements this check
itself, so the request-parameter `employee_id` that every reader worker and
drafter takes is fed to this guard first and is never trusted on its own.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.activities.deterministic.employee_self_service.session_validator import (
    ResolvedIdentity,
)


class SelfServiceScopeError(Exception):
    """Raised when a request's `employee_id` does not match the
    authenticated session's `employee_id`. Callers must let this propagate
    as a refusal, not catch and degrade it into a filtered or masked
    response - the Portal never discloses that another employee's record
    exists, only that the request is refused."""


@dataclass
class ScopeCheck:
    requested_employee_id: uuid.UUID
    identity: ResolvedIdentity


@activity.defn
async def enforce_self_service_scope(check: ScopeCheck) -> uuid.UUID:
    """Return `check.identity.employee_id` if it equals
    `check.requested_employee_id`; raise `SelfServiceScopeError` otherwise.

    `check.identity` must come from `validate_session`, never be
    constructed from a request parameter - a session that failed to
    validate (`validate_session` returned `None`) must never reach this
    guard at all, since there is no identity to compare against."""
    raise NotImplementedError
