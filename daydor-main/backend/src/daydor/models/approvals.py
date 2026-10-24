"""Cross-domain approval gate model. Placeholder schema only.

Added as a prerequisite for Gap 2 (registration deadline) and Gap 9
(offboarding F&F) from the Data Model Design's reconciliation against the
Product Spec. One row per gate instance, pointing at whatever row the
approval is about via a polymorphic `(subject_table, subject_id)` pair
rather than a foreign key per gate type, since the Product Spec catalogs
many gate types (maker-checker on a payroll run, founder confirmation on a
threshold crossing, DPDP consent on sensitive-field collection, statutory
filing submission, and others) across domains.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from daydor.models.base import TenantScopedModel


class ApproverRole(str, Enum):
    """Who is entitled to resolve a gate. DATA_PRINCIPAL covers the DPDP
    consent gate, where the approver is the employee the data is about.
    MANAGER covers the leave-request approval gate (Domain 4.3), where the
    approver is the requesting employee's manager - a day-to-day operational
    decision, not a founder-level one. EMPLOYEE_SELF covers the Employee
    Self-Service Portal's bank-detail change gate (Domain 6.1): the gate
    resolves automatically via self-service OTP/micro-deposit, never a human
    approver, but is still modeled as an `ApproverRole` for consistency with
    every other gated action (captain decision, 2026-10-20)."""

    FOUNDER = "founder"
    DAYDOR_OPS = "daydor_ops"
    DATA_PRINCIPAL = "data_principal"
    MANAGER = "manager"
    EMPLOYEE_SELF = "employee_self"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class ApprovalRequest(TenantScopedModel):
    """One approval-gate instance guarding a gated-irreversible action.

    Escalation on timeout is two-stage, driven by the execution engine (see
    `ApprovalGateEscalationWorkflow`): `notified_at` is set when the first
    timeout elapses and relevant parties are alerted, without changing who
    may resolve the gate. `escalated_at` is set only if the gate is still
    unresolved after the further grace period, when a fallback approver
    takes over the gate - this row only records *that* each stage happened,
    not the timing policy itself. The DPDP consent gate type never sets
    `notified_at` or `escalated_at`: there is no fallback approver for
    consent, enforced in application logic rather than a DB constraint.
    """

    gate_type: str
    subject_table: str
    subject_id: uuid.UUID
    required_approver_role: ApproverRole
    status: ApprovalStatus = ApprovalStatus.PENDING
    resolved_by_user_id: uuid.UUID | None = None
    resolved_at: datetime | None = None
    notified_at: datetime | None = None
    escalated_at: datetime | None = None
    fallback_approver_user_id: uuid.UUID | None = None
    idempotency_key: str
    deadline_at: datetime | None = None
