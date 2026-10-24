"""Employee Self-Service profile-change models: direct-write edits, the
ops-reviewed DPDP-sensitive correction queue, and the OTP/micro-deposit
verified bank-detail change.

Field-tiering (Domain 6.2, captain decision 2026-10-20) splits a profile
change into three write paths by consequence, not by data sensitivity alone:

- Direct-write tier (personal address, emergency contact, marital status,
  tax_regime_election) has no statutory or money-movement consequence, so
  `profile_field_writer` applies it immediately with no gate and no row of
  its own here - it writes straight to `Employee`/`EmploymentRecord`.
- Ops-reviewed tier (Aadhaar last-4/e-KYC reference, PAN) is DPDP-sensitive
  but not money-movement: a correction to an already-consented field,
  drafted by `profile_update_drafter` as a `ProfileFieldChangeRequest` and
  applied only after Daydor ops confirms it - no `ApprovalRequest` gate,
  since this is an ops review queue, not a founder/manager approval gate.
- Bank-detail tier is gated irreversible (`BankDetailChangeRequest`,
  verified via `bank_detail_verification_gate`): the highest-leverage input
  to a future money-movement gate (salary_disbursement), so it reuses the
  cross-domain `ApprovalRequest` mechanism for consistency with every other
  gated action even though `ApproverRole.EMPLOYEE_SELF` resolves
  automatically via self-service OTP/micro-deposit rather than a human
  approver (captain decision, 2026-10-20).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from daydor.models.base import TenantScopedModel


class ProfileFieldName(str, Enum):
    """The ops-reviewed tier only (Domain 6.2) - direct-write tier fields
    never get a `ProfileFieldChangeRequest` row, since `profile_field_writer`
    applies them immediately with no review queue."""

    AADHAAR_LAST4 = "aadhaar_last4"
    AADHAAR_EKYC_REF = "aadhaar_ekyc_ref"
    PAN_ENCRYPTED = "pan_encrypted"


class ProfileFieldChangeStatus(str, Enum):
    PENDING_OPS_CONFIRMATION = "pending_ops_confirmation"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


class ProfileFieldChangeRequest(TenantScopedModel):
    """One ops-reviewed draft correction to a DPDP-sensitive `Employee`
    field, drafted by `profile_update_drafter` from the employee's
    self-service edit and applied to the live `Employee` row only once
    Daydor ops sets `status=confirmed` - an ops review queue, not an
    `ApprovalRequest` gate, since no founder/manager approval is required
    for a correction to an already-consented field.
    """

    employee_id: uuid.UUID
    field_name: ProfileFieldName
    proposed_value: str
    status: ProfileFieldChangeStatus = ProfileFieldChangeStatus.PENDING_OPS_CONFIRMATION
    confirmed_by_user_id: uuid.UUID | None = None
    confirmed_at: datetime | None = None


class BankDetailChangeStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    FAILED = "failed"


class BankDetailChangeRequest(TenantScopedModel):
    """One employee-initiated change to `Employee.bank_account_encrypted`,
    drafted by `bank_detail_change_drafter` and applied to the live field
    only after `bank_detail_verification_gate` resolves its linked
    `ApprovalRequest` (`required_approver_role=ApproverRole.EMPLOYEE_SELF`)
    via self-service OTP/micro-deposit - never a human approver, but
    modeled as an `ApprovalRequest` for consistency with every other gated
    action in the system (captain decision, 2026-10-20). The live bank
    field is never written before `approval_request_id` resolves to
    `ApprovalStatus.APPROVED`.
    """

    employee_id: uuid.UUID
    proposed_bank_account_encrypted: bytes
    status: BankDetailChangeStatus = BankDetailChangeStatus.PENDING_VERIFICATION
    approval_request_id: uuid.UUID
    verified_at: datetime | None = None
