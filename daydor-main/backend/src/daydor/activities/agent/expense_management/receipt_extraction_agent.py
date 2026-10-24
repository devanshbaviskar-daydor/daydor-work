"""receipt_extraction_agent activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run over a vision/OCR-capable LLM, schema-checked output.
Trigger: an employee uploads a receipt against a draft `ExpenseClaim`.

Extracts amount, vendor name, vendor GSTIN, and date from an uploaded
receipt image/PDF, fetched via `DocumentVaultClient.fetch_document` once the
receipt is stored as a `Document` row with `document_class=EXPENSE_RECEIPT`.
Read-only/draft by construction: the extracted amount is written only to
`ExpenseClaim.extracted_amount`, never to `ExpenseClaim.amount` - the
employee must confirm (or correct) the extracted figure before the claim is
submitted. A receipt that fails to extract cleanly (illegible scan, missing
field) still leaves the claim submittable on the employee's self-reported
`amount`; this worker never blocks submission.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from temporalio import activity


@dataclass
class ReceiptExtractionInput:
    tenant_id: uuid.UUID
    expense_claim_id: uuid.UUID
    receipt_document_id: uuid.UUID


@dataclass
class ReceiptExtractionResult:
    expense_claim_id: uuid.UUID
    extracted_amount: Decimal | None
    vendor_name: str | None
    vendor_gstin: str | None
    extracted_date: date | None


@activity.defn
async def extract_receipt_fields(request: ReceiptExtractionInput) -> ReceiptExtractionResult:
    """Extract amount, vendor name, vendor GSTIN, and date from the receipt
    named by `request.receipt_document_id`.

    A draft for the employee to confirm - never writes
    `ExpenseClaim.amount`, `vendor_name`, or `vendor_gstin` directly; the
    caller is responsible for routing this result through employee
    confirmation before any of those authoritative fields are updated.
    """
    raise NotImplementedError
