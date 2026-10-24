"""bank_detail_change_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an employee submits a free-text or structured bank-detail change
request on the Employee Self-Service Portal.

Turns a free-text or structured bank-detail change request into a
structured `BankDetailChangeRequest` draft (`status=pending_verification`),
opening its linked `ApprovalRequest`
(`required_approver_role=ApproverRole.EMPLOYEE_SELF`) for
`bank_detail_verification_gate` to resolve via self-service OTP/micro-
deposit (Domain 6.1 captain decision, 2026-10-20). Read-only/draft by
construction: this worker never writes `Employee.bank_account_encrypted`
itself and never resolves the `ApprovalRequest` it opens - verification and
the live write are both `bank_detail_verification_gate`'s job, downstream
of this draft.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.ess_profile import BankDetailChangeRequest


@dataclass
class BankDetailChangeInput:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""
    request_text: str


@activity.defn
async def draft_bank_detail_change(request: BankDetailChangeInput) -> BankDetailChangeRequest:
    """Draft a `BankDetailChangeRequest` (status `pending_verification`)
    from a free-text or structured bank-detail change request, with a new
    `ApprovalRequest` opened for it
    (`required_approver_role=ApproverRole.EMPLOYEE_SELF`,
    `gate_type="bank_detail_verification"`). Never sets status to
    `verified` or `failed`, and never writes
    `Employee.bank_account_encrypted` - only `bank_detail_verification_gate`,
    called after OTP/micro-deposit verification succeeds, does that."""
    raise NotImplementedError
