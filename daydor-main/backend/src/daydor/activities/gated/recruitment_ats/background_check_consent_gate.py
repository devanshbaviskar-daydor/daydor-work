"""background_check_consent_gate activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: the candidate (the `ApproverRole.DATA_PRINCIPAL` for this gate, not
the founder or ops) resolves the `ApprovalRequest` opened before any
background check begins.

Reuses Onboarding's existing `ConsentRecord`/`ApprovalRequest`
(`gate_type="dpdp_consent"`) machinery, with the candidate as the data
principal instead of the employee, and a `ConsentRecord` row scoped to a
`BACKGROUND_CHECK` purpose kept separate from any post-hire consent the same
person grants later as an employee (Domain 5.1, DPDP purpose-limitation).
Written, specific, informed consent is required before any check begins -
there is no fallback approver for this gate: a candidate's own consent
cannot be substituted, so on timeout the specific check stays blocked
rather than escalating.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from temporalio import activity

from daydor.models.consent import ConsentDataCategory, ConsentRecord
from daydor.models.recruitment_ats import BackgroundCheckType


@dataclass
class BackgroundCheckConsentDecision:
    tenant_id: uuid.UUID
    candidate_id: uuid.UUID
    approval_request_id: uuid.UUID
    check_type: BackgroundCheckType
    data_category: ConsentDataCategory
    granted: bool
    decided_at: datetime
    idempotency_key: str


@activity.defn
async def apply_background_check_consent_decision(
    decision: BackgroundCheckConsentDecision,
) -> ConsentRecord | None:
    """Apply the candidate's resolved consent decision for
    `decision.check_type`: on `decision.granted`, write a `ConsentRecord`
    with `candidate_id` set, `data_category=decision.data_category`, and
    `purpose=BACKGROUND_CHECK`, and return it; otherwise return `None` and
    leave that check blocked. Idempotency-keyed against a retried approval
    signal; no automatic retry on failure. No fallback approver - a
    candidate's own consent cannot be substituted."""
    raise NotImplementedError
