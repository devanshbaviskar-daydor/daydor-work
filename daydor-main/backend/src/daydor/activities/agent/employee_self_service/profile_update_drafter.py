"""profile_update_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an employee submits a free-text or structured correction to an
ops-reviewed tier field (Domain 6.2: Aadhaar last-4/e-KYC reference, PAN)
on the Employee Self-Service Portal.

Turns a free-text or structured profile-correction request into a
structured `ProfileFieldChangeRequest` draft
(`status=pending_ops_confirmation`) for Daydor ops to confirm. Only ever
drafts a change to an ops-reviewed tier field (`ProfileFieldName`):
direct-write tier fields (personal address, emergency contact, marital
status, tax_regime_election) never reach this worker, since
`profile_field_writer` applies those immediately with no draft step.
Read-only/draft by construction: this worker never applies the change to
the live `Employee` row itself - that is `profile_field_writer`'s job,
called only after ops sets `status=confirmed`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.ess_profile import ProfileFieldChangeRequest, ProfileFieldName


@dataclass
class ProfileUpdateRequest:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""
    request_text: str


@activity.defn
async def draft_profile_update(
    request: ProfileUpdateRequest, field_name: ProfileFieldName
) -> ProfileFieldChangeRequest:
    """Draft a `ProfileFieldChangeRequest` (status
    `pending_ops_confirmation`) for `field_name` from a free-text or
    structured correction request. Never sets status to `confirmed` or
    `rejected`, and never writes `Employee.aadhaar_last4` /
    `aadhaar_ekyc_ref` / `pan_encrypted` directly - only
    `profile_field_writer`, called after ops confirmation, does that."""
    raise NotImplementedError
