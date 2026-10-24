"""reimbursement_batch_builder activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: the start of a payroll period's run, immediately before
`PayrollRunBuilderWorkflow` assembles that period's `PayrollRun` - analogous
to `payroll_run_builder`'s own role for payroll, assembling this domain's
unit of work the run-builder then consumes.

Assembles one period's approved, unreimbursed `ExpenseClaim` rows (status
`approved`, `reimbursed_at` null, `claim_date` within `[period_start,
period_end]`) into a `ReimbursementBatch` with one `ReimbursementBatchLine`
per claim. Feeds directly into the next `PayrollRun` per the captain's
integration decision (Option A, 2026-10-20): reimbursement folds into
Payroll's existing `salary_disbursement` worker on the monthly cycle - this
activity does not itself disburse, mark claims `reimbursed`, or open any
independent, faster disbursement path.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import activity

from daydor.models.expense import ReimbursementBatch


@dataclass
class ReimbursementBatchBuilderRequest:
    tenant_id: uuid.UUID
    period_start: date
    period_end: date


@activity.defn
async def build_reimbursement_batch(request: ReimbursementBatchBuilderRequest) -> ReimbursementBatch:
    """Assemble `request.tenant_id`'s approved, unreimbursed claims for
    `[request.period_start, request.period_end]` into a `ReimbursementBatch`
    (status `draft`) with its `ReimbursementBatchLine` rows.

    Idempotent on `(tenant_id, period_start, period_end)`, matching
    `payroll_run_builder`'s own idempotency property - a tenant must not get
    two batches for the same period no matter how many times the trigger
    fires.
    """
    raise NotImplementedError
