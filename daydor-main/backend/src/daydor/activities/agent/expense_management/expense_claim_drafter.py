"""expense_claim_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an employee submits a free-text or structured expense claim.

Turns an employee's submission (amount, date, category, business
justification) into a structured `ExpenseClaim` draft (status `draft`).
Read-only/draft by construction: this worker never sets `status` to
`submitted` or beyond, never resolves category metadata itself - that is
`expense_category_resolver`'s job - and never evaluates approval
thresholds - that is `policy_threshold_validator`'s job, run after this
draft exists.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from temporalio import activity

from daydor.models.expense import ExpenseClaim


@dataclass
class ExpenseClaimDraftInput:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    amount: Decimal
    claim_date: date
    category_code: str
    business_justification: str


@activity.defn
async def draft_expense_claim(request: ExpenseClaimDraftInput) -> ExpenseClaim:
    """Draft an `ExpenseClaim` (status `draft`) from an employee's
    submission. Never sets `status` beyond `draft`, never populates
    `receipt_document_id`/`extracted_amount` (that is
    `receipt_extraction_agent`'s job), and never sets
    `requires_manager_approval`/`missing_required_receipt`."""
    raise NotImplementedError
