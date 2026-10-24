"""Recruitment & Applicant Tracking models: requisition through hire handoff.

Placeholder schema only. Covers both the requisition-through-screening stage
and the offer-through-hire-handoff stage promoted into v1 scope 2026-10-20
(Domain 5.1-5.2 of the Product Spec). `Position` is admin-entered,
pre-existing data (not drafted by this domain) and is included here only as
the row this domain's `JobRequisition` points at.

The offer/appointment-letter/background-check/hire stage deliberately
replaces every US-specific compliance gate from the co-founder's repo with
an India-appropriate one (Domain 5.1): no AEDT/bias-audit-equivalent
regulation and no FCRA-style pre-adverse-action notice-and-wait requirement
apply here, but written DPDP consent before any background check, a 180-day
candidate-data retention/erasure rule with a 48-hour pre-erasure notice, and
a mandatory written appointment letter (Industrial Relations Code and OSH
Central Rules 2026, effective 21 Nov 2025) do.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from daydor.models.base import TenantScopedModel


class PositionStatus(str, Enum):
    OPEN = "open"
    FILLED = "filled"


class Position(TenantScopedModel):
    """A budgeted headcount slot. Admin-entered, pre-existing data - not
    drafted by this domain. `current_employee_id` is set once filled and is
    what `requisition_opener` checks to confirm a position is actually
    vacant before opening a requisition against it."""

    title: str
    department_id: uuid.UUID
    job_profile_id: uuid.UUID
    status: PositionStatus = PositionStatus.OPEN
    budgeted_fte: Decimal
    current_employee_id: uuid.UUID | None = None


class JobRequisitionStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    POSTED = "posted"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class JobRequisition(TenantScopedModel):
    """A request to fill a `Position`. Idempotent per position: at most one
    live requisition (any status other than `filled`, `cancelled`, or
    `rejected`) may exist for a given `position_id` at a time, enforced by
    `requisition_opener` rather than a DB constraint."""

    position_id: uuid.UUID
    hiring_manager_id: uuid.UUID
    status: JobRequisitionStatus = JobRequisitionStatus.DRAFT
    target_start_date: date


class CompBand(TenantScopedModel):
    """A tenant's own compensation band for a role. Tenant-scoped (captain
    decision, 2026-10-20) - corrects an earlier draft that modeled this as
    shared reference data: unlike statutory PT/EPF rates, a comp band is a
    per-company decision, not something set once for all of India. Versioned
    and effective-dated like `PtSlabRule`/`EpfRateRule`: a band change is a
    new row with a new `effective_from`, never an edit to an existing one."""

    job_profile_id: uuid.UUID
    effective_from: date
    effective_to: date | None = None
    band_min: Decimal
    band_max: Decimal


class CandidateSource(str, Enum):
    REFERRAL = "referral"
    JOB_BOARD = "job_board"
    AGENCY = "agency"
    INBOUND = "inbound"
    OTHER = "other"


class Candidate(TenantScopedModel):
    """One candidate record. `retention_deadline` is computed from the
    rejection/inactivity date plus 180 days per DPDP Rules 2025 (captain
    decision, 2026-10-20: the clock starts from rejection/inactivity, the
    conservative reading pending primary-source verification - not from
    `applied_at`), and is left unset until that date is known. `resume_ref`
    points at a `daydor.models.document.Document` row in the Document
    Vault."""

    full_name: str
    email: str
    phone: str
    resume_ref: uuid.UUID
    source: CandidateSource
    applied_at: datetime
    retention_deadline: date | None = None


class ApplicationStage(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    BACKGROUND_CHECK = "background_check"
    HIRED = "hired"
    REJECTED = "rejected"


class Application(TenantScopedModel):
    """One candidate's application against one requisition. Idempotent on
    `(requisition_id, candidate email)`, enforced by
    `candidate_intake_recorder` rather than a DB constraint, since the email
    uniqueness check spans the `Candidate` row this `Application` points
    at."""

    candidate_id: uuid.UUID
    requisition_id: uuid.UUID
    stage: ApplicationStage = ApplicationStage.APPLIED
    stage_changed_at: datetime


class OfferStatus(str, Enum):
    DRAFT = "draft"
    PENDING_GATE_APPROVAL = "pending_gate_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class Offer(TenantScopedModel):
    """One compensation offer against an `Application`. `within_band` is
    computed by `offer_band_validator` against the role's (tenant-scoped)
    `CompBand`; an out-of-band offer moves to `pending_gate_approval` and
    gets an `approval_request_id` pointing at the `offer_band_gate`'s
    `ApprovalRequest` row rather than being rejected outright - founder
    sign-off can still approve a deliberate above/below-band exception."""

    application_id: uuid.UUID
    comp_band_id: uuid.UUID
    proposed_base: Decimal
    proposed_equity: Decimal | None = None
    within_band: bool
    status: OfferStatus = OfferStatus.DRAFT
    approval_request_id: uuid.UUID | None = None


class AppointmentLetter(TenantScopedModel):
    """The written, prescribed-format appointment letter every employer must
    issue since 21 Nov 2025 under the Industrial Relations Code and OSH
    Central Rules 2026 (Domain 5.1) - a genuinely new requirement with no
    counterpart in the co-founder's repo. `appointment_letter_generator`
    drafts its content for founder/ops review; delivery to and acceptance by
    the candidate is a separate, deferred mechanism (captain decision,
    2026-10-20: to be resolved alongside the Employee Self-Service Portal's
    design), so `issued_at`/`accepted_at` are plain fields this domain sets
    directly rather than driving any delivery integration."""

    offer_id: uuid.UUID
    designation: str
    job_category: str
    principal_place_of_employment: str
    wage_breakup_json: dict
    social_security_entitlements_json: dict
    issued_at: datetime | None = None
    accepted_at: datetime | None = None


class BackgroundCheckType(str, Enum):
    IDENTITY = "identity"
    EDUCATION = "education"
    EMPLOYMENT_HISTORY = "employment_history"
    CRIMINAL_RECORD = "criminal_record"
    ADDRESS = "address"


class BackgroundCheckStatus(str, Enum):
    PENDING = "pending"
    CLEAR = "clear"
    ADVERSE = "adverse"


class BackgroundCheckRecord(TenantScopedModel):
    """One batch of third-party BGV checks ordered for a candidate, gated on
    DPDP consent (`background_check_consent_gate`) before `ordered_at` is
    set. Deliberately carries no `adverse_action_stage`/
    `pre_adverse_notice_at` fields: India has no FCRA-equivalent
    pre-adverse-action notice-and-wait requirement, so an `adverse` result
    needs no mandated waiting period before the employer can act on it
    (Domain 5.1)."""

    candidate_id: uuid.UUID
    check_types: list[BackgroundCheckType]
    vendor: str
    ordered_at: datetime | None = None
    status: BackgroundCheckStatus = BackgroundCheckStatus.PENDING
