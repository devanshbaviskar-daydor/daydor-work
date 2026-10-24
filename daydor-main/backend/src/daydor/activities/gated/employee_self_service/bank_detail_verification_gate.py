"""bank_detail_verification_gate activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry. (The
signal here carries an OTP/micro-deposit verification outcome rather than a
human approver's decision - see below.)
Trigger: the employee completes self-service OTP/micro-deposit verification
for a `BankDetailChangeRequest` drafted by `bank_detail_change_drafter`.

Resolves the `ApprovalRequest` opened for a `BankDetailChangeRequest`
(`required_approver_role=ApproverRole.EMPLOYEE_SELF`) and, only on
successful verification, applies the proposed value to the live
`Employee.bank_account_encrypted` field. Modeled as an `ApprovalRequest`
gate for consistency with every other gated-irreversible action in the
system even though `ApproverRole.EMPLOYEE_SELF` resolves automatically via
OTP/micro-deposit rather than a human approver (Domain 6.1 captain
decision, 2026-10-20) - this is the highest-leverage input to a future
money-movement gate (`salary_disbursement`), so it is never applied without
this verification step regardless of who or what resolves it. A failed
verification never writes the live field and never retries automatically;
the employee must submit a fresh `BankDetailChangeRequest` through
`bank_detail_change_drafter`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.employee import Employee
from daydor.models.ess_profile import BankDetailChangeRequest, BankDetailChangeStatus


@dataclass
class BankDetailVerificationOutcome:
    tenant_id: uuid.UUID
    bank_detail_change_request_id: uuid.UUID
    approval_request_id: uuid.UUID
    verified: bool
    idempotency_key: str


@activity.defn
async def apply_bank_detail_verification(
    outcome: BankDetailVerificationOutcome,
) -> BankDetailChangeRequest:
    """Resolve the `ApprovalRequest` named by `outcome.approval_request_id`
    for the `BankDetailChangeRequest` named by
    `outcome.bank_detail_change_request_id`. On `outcome.verified=True`,
    sets status to `verified` and writes `proposed_bank_account_encrypted`
    to the matching `Employee.bank_account_encrypted`, both in the same
    transaction. On `outcome.verified=False`, sets status to `failed` and
    never touches `Employee.bank_account_encrypted`. Idempotency-keyed
    against a retried verification signal; no automatic retry on failure."""
    raise NotImplementedError
