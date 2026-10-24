"""DPDP consent and data-subject-request models.

ConsentRecord is purpose- and field-scoped, not a blanket checkbox: one row
per (data principal, data_category, purpose), authored by the data principal
themselves and blocking (the field cannot be populated until consent
exists). The data principal is normally an employee (`employee_id`), but a
pre-hire background-check consent (Domain 5.1, Recruitment & ATS) is granted
by a candidate who isn't an employee yet, so exactly one of `employee_id` /
`candidate_id` is set per row - never both, and a row is never repointed
from one to the other if a candidate is later hired, since that would
collapse a pre-hire BGV consent with post-hire consent into one record
(captain decision, 2026-10-20, DPDP purpose-limitation).

DataSubjectRequest models the DPDP access/correction/erasure request, with
the soft-delete/anonymization resolution pattern where an erasure request
conflicts with a live statutory retention floor (see RetentionPolicy).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from daydor.models.base import TenantScopedModel


class ConsentDataCategory(str, Enum):
    AADHAAR = "aadhaar"
    PAN = "pan"
    BANK_DETAILS = "bank_details"
    OTHER_PII = "other_pii"

    # Pre-hire background-check categories (Domain 5.1, Recruitment & ATS).
    # A candidate's check-specific consent is always a separate ConsentRecord
    # row from an employee's post-hire Aadhaar/PAN/bank consent above, per
    # DPDP purpose-limitation (captain decision, 2026-10-20) - never
    # collapsed into one record per person even once a candidate is hired.
    BGV_IDENTITY = "bgv_identity"
    BGV_EDUCATION = "bgv_education"
    BGV_EMPLOYMENT_HISTORY = "bgv_employment_history"
    BGV_CRIMINAL_RECORD = "bgv_criminal_record"
    BGV_ADDRESS = "bgv_address"


class ConsentPurpose(str, Enum):
    STATUTORY_FILING = "statutory_filing"
    SALARY_DISBURSEMENT = "salary_disbursement"
    IDENTITY_VERIFICATION = "identity_verification"
    BACKGROUND_CHECK = "background_check"


class ConsentStatus(str, Enum):
    GRANTED = "granted"
    WITHDRAWN = "withdrawn"


class ConsentRecord(TenantScopedModel):
    """One (data principal, data_category, purpose) consent grant.

    Withdrawal is a new event, not an edit to `granted_at` - the record is
    append-style even though the table isn't strictly immutable like the
    audit log. Exactly one of `employee_id` / `candidate_id` is set: the
    pre-hire background-check gate (`background_check_consent_gate`) sets
    `candidate_id`, every other consent purpose sets `employee_id`.
    """

    employee_id: uuid.UUID | None = None
    candidate_id: uuid.UUID | None = None
    data_category: ConsentDataCategory
    purpose: ConsentPurpose
    status: ConsentStatus = ConsentStatus.GRANTED
    granted_at: datetime
    withdrawn_at: datetime | None = None
    consent_artifact_ref: str


class DataSubjectRequestType(str, Enum):
    ACCESS = "access"
    CORRECTION = "correction"
    ERASURE = "erasure"


class DataSubjectRequestStatus(str, Enum):
    RECEIVED = "received"
    IN_PROGRESS = "in_progress"
    FULFILLED = "fulfilled"
    PARTIALLY_FULFILLED_RETENTION_HELD = "partially_fulfilled_retention_held"


class DataSubjectRequest(TenantScopedModel):
    """A DPDP Data Principal's access/correction/erasure request.

    `received_at` starts the 90-day response clock.
    `partially_fulfilled_retention_held` is the honest outcome for an
    erasure request hitting a statutory retention floor - never silently
    reported as fully done.
    """

    employee_id: uuid.UUID
    request_type: DataSubjectRequestType
    status: DataSubjectRequestStatus = DataSubjectRequestStatus.RECEIVED
    received_at: datetime
    resolution_notes: str | None = None
