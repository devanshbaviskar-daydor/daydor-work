"""Employee record model.

Placeholder schema: drives headcount-threshold counting and is the
cross-domain record touched by onboarding and payroll alike.
"""

from __future__ import annotations

from datetime import date
from enum import Enum

from daydor.models.base import TenantScopedModel


class EmploymentType(str, Enum):
    """Feeds per-scheme headcount-inclusion rules (ESI/EPF/Gratuity each
    define "employee" slightly differently) and gratuity eligibility tenure."""

    PERMANENT = "permanent"
    FIXED_TERM = "fixed_term"
    INTERN = "intern"
    CONTRACTOR = "contractor"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    OTHER = "other"


class Employee(TenantScopedModel):
    """A single employee row, scoped to one tenant (employer)."""

    hire_event_id: str
    full_name: str
    employment_type: EmploymentType
    state_code: str
    date_of_joining: date
    date_of_exit: date | None = None
    is_active: bool = True

    # Direct-write tier (Domain 6.2, Employee Self-Service Portal):
    # no statutory or money-movement consequence, so `profile_field_writer`
    # applies an employee's own edit to these fields immediately, with no
    # gate and no ops review.
    personal_address: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    marital_status: MaritalStatus | None = None

    # DPDP-sensitive, masked/encrypted only - see Data Model Design §4.
    # Aadhaar is never stored in full: masked last-4 plus an offline e-KYC
    # reference, never a raw Aadhaar number column. Ops-reviewed tier
    # (Domain 6.2): an employee's correction to these fields goes through
    # `profile_update_drafter` -> `ProfileFieldChangeRequest` -> Daydor ops
    # confirmation before it lands here, never a direct write.
    aadhaar_last4: str | None = None
    aadhaar_ekyc_ref: str | None = None
    pan_encrypted: bytes | None = None

    # Gated-irreversible tier (Domain 6.2): an employee's change goes through
    # `bank_detail_change_drafter` -> `BankDetailChangeRequest` ->
    # `bank_detail_verification_gate`'s OTP/micro-deposit verification
    # before it lands here, never a direct write.
    bank_account_encrypted: bytes | None = None
