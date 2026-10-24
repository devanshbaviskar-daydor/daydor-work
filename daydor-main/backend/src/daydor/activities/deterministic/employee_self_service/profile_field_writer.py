"""profile_field_writer activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: two distinct callers, per the field-tiering table (Domain 6.2):
(1) directly, when an employee submits a change to a direct-write tier
field (personal address, emergency contact, marital status,
tax_regime_election) on the Employee Self-Service Portal - no draft, no
gate; (2) after `profile_update_drafter`'s `ProfileFieldChangeRequest` is
set to `status=confirmed` by Daydor ops, for an ops-reviewed tier field
(Aadhaar last-4/e-KYC reference, PAN).

Applies a field change to the live `Employee` row (or, for
`tax_regime_election`, the employee's current `EmploymentRecord`). Direct-
write tier fields have no statutory or money-movement consequence, so this
worker writes them with no gate of its own; TDS recalculates automatically
from whatever is on file afterward (captain decision, 2026-10-20) rather
than this worker triggering a recalculation itself. Never writes
`Employee.bank_account_encrypted` - that field only ever changes via
`bank_detail_verification_gate`, never through this worker.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any

from temporalio import activity

from daydor.models.employee import Employee
from daydor.models.payroll import EmploymentRecord


@dataclass
class ProfileFieldWrite:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session when the caller is the employee themselves (the
    direct-write path); not re-checked here when the caller is a confirmed
    `ProfileFieldChangeRequest` (the ops-reviewed path), since that request
    was already scope-checked when drafted."""
    field_name: str
    value: Any


@activity.defn
async def write_profile_field(write: ProfileFieldWrite) -> Employee | EmploymentRecord:
    """Apply `write.value` to `write.field_name` on `write.employee_id`'s
    `Employee` row, or - for `tax_regime_election` - a new effective-dated
    `EmploymentRecord` version, per `EmploymentRecord`'s versioning rule
    that a change creates a new row rather than mutating one a payroll run
    already relied on. Never applies a change to `aadhaar_last4` /
    `aadhaar_ekyc_ref` / `pan_encrypted` unless the caller supplies a
    `ProfileFieldChangeRequest` already `status=confirmed`, and never
    applies a change to `bank_account_encrypted` at all."""
    raise NotImplementedError
