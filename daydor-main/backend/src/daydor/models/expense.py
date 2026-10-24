"""Expense claim, category rule, and reimbursement models. Placeholder schema only.

Domain 7: Employee expense claims, categorization, and reimbursement -
designed from first principles, since neither reference repo had any usable
logic here (Product Spec Domain 7). Leave Travel Allowance (LTA, Section
10(5)) is not part of this catalog - it is a payroll allowance against the
employee's declared tax regime and belongs with `EmploymentRecord`, not an
`ExpenseClaim`.

Receipt discipline is a tax requirement, not just good UX: under Section
17(2), a genuine cost-to-cost reimbursement of official expenditure is not
taxable income to the employee and not subject to Section 192 TDS - but only
if it is receipt-backed, has a stated business purpose, and matches the bill
rather than a round-number allowance. An unreceipted claim above
`ExpenseCategoryRule.requires_receipt_above` risks recharacterization as
taxable salary on audit, which is why `ExpenseClaim.missing_required_receipt`
exists as a flag `policy_threshold_validator` sets, not a hard stop.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel

from daydor.models.base import TenantScopedModel


class ExpenseCategoryRule(BaseModel):
    """Versioned, effective-dated expense category rule, keyed by
    `category_code` - not tenant-scoped, like `PtSlabRule`/`EpfRateRule`,
    since these are policy defaults rather than a per-tenant preference for
    v1. A rule change is a new row with a new `effective_from`, never an
    edit to an existing one, so a past claim always recomputes against the
    rule that was actually in force when it was filed.

    `itc_eligible` is false for meals/food/club-adjacent categories per GST
    Section 17(5)'s blocked-credit list - input tax credit cannot be claimed
    on those categories regardless of GSTIN, so `vendor_gstin` on a meals
    claim is tracked for record-keeping only, never fed into an ITC claim.

    `claim_shape` is fixed to `itemized` for v1 (captain decision,
    2026-10-20): a flat per-diem-with-attestation claim shape is a noted
    future extension, deferred until a design-partner customer needs it -
    not built here.
    """

    category_code: str
    effective_from: date
    effective_to: date | None = None
    requires_receipt_above: Decimal = Decimal("500")
    manager_approval_threshold: Decimal = Decimal("5000")
    founder_approval_threshold: Decimal = Decimal("25000")
    itc_eligible: bool = True
    claim_shape: str = "itemized"


class ExpenseClaimStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    REIMBURSED = "reimbursed"


class ExpenseClaim(TenantScopedModel):
    """One employee's expense claim.

    `extracted_amount` is `receipt_extraction_agent`'s draft read of the
    receipt - informational only, never the authoritative `amount` the
    employee confirms before submit. `requires_manager_approval` and
    `missing_required_receipt` are set by `policy_threshold_validator`,
    informational flags that never block submission themselves.
    `approval_request_id` ties this claim to `expense_approval_gate`, the
    same pattern `LeaveRequest.approval_request_id` uses for its gate.
    `reimbursed_at` is set only once a `ReimbursementBatch` containing this
    claim (via `ReimbursementBatchLine`) is disbursed.
    """

    employee_id: uuid.UUID
    category_code: str
    amount: Decimal
    claim_date: date
    business_justification: str
    status: ExpenseClaimStatus = ExpenseClaimStatus.DRAFT
    receipt_document_id: uuid.UUID | None = None
    extracted_amount: Decimal | None = None
    vendor_name: str | None = None
    vendor_gstin: str | None = None
    requires_manager_approval: bool = False
    missing_required_receipt: bool = False
    approval_request_id: uuid.UUID | None = None
    reimbursed_at: datetime | None = None


class ReimbursementBatchStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    DISBURSED = "disbursed"


class ReimbursementBatch(TenantScopedModel):
    """One period's batch of approved expense claims awaiting reimbursement.

    Feeds directly into the next `PayrollRun` per the captain's integration
    decision (Option A, 2026-10-20) - no independent disbursement path or
    faster off-cycle run for v1, the same `salary_disbursement` worker
    Payroll already owns handles the money movement.
    """

    period_start: date
    period_end: date
    status: ReimbursementBatchStatus = ReimbursementBatchStatus.DRAFT


class ReimbursementBatchLine(TenantScopedModel):
    """One claim's inclusion in a `ReimbursementBatch`."""

    reimbursement_batch_id: uuid.UUID
    expense_claim_id: uuid.UUID
    amount: Decimal
