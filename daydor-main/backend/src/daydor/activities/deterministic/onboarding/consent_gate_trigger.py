"""consent_gate_trigger activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: onboarding document collection needs an Aadhaar/PAN/bank-details
field populated (e.g. surfaced by onboarding_checklist_generator's draft
checklist, or raised directly by ops).

Sole owner of the DPDP consent gate's state and trigger logic: checks
ConsentRecord for the (employee, data_category, purpose) in question and,
if no granted record exists, raises an ApprovalRequest (gate_type:
dpdp_consent, required_approver_role: data_principal) for the employee to
grant or withhold consent before the field is collected or persisted.

Deliberately not employee_record_creator (which creates the Core HR record
with no judgment call of its own) and not onboarding_checklist_generator
(which only drafts the checklist for ops review and must not itself decide
whether a gated field may be collected). Both may read this worker's gate
state but neither triggers it - this worker is the only writer of
ConsentRecord-driven ApprovalRequest rows for onboarding document
collection.
"""

from __future__ import annotations

import uuid

from temporalio import activity

from daydor.models.consent import ConsentDataCategory, ConsentPurpose


@activity.defn
async def ensure_consent_gate(
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    data_category: ConsentDataCategory,
    purpose: ConsentPurpose,
) -> uuid.UUID | None:
    """Check ConsentRecord and raise an ApprovalRequest if consent is missing.

    Returns the new ApprovalRequest id, or None if a granted ConsentRecord
    already covers this (employee, data_category, purpose).
    """
    raise NotImplementedError
