"""policy_threshold_validator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: when an employee submits a drafted `ExpenseClaim`, after
`expense_category_resolver` has resolved that category's current
`ExpenseCategoryRule`.

Flags a submitted claim's `requires_manager_approval` and
`missing_required_receipt` against its resolved `ExpenseCategoryRule`:
`requires_manager_approval` is set once `amount` exceeds
`manager_approval_threshold` (and implies founder approval instead once it
exceeds `founder_approval_threshold` - the gate itself,
`expense_approval_gate`, is responsible for routing to the correct
approver role from these two thresholds); `missing_required_receipt` is set
once `amount` exceeds `requires_receipt_above` and `receipt_document_id` is
still null. Informational only - this activity never blocks submission or
mutates `status`; it is `expense_approval_gate`'s job to act on
`requires_manager_approval`, and a human reviewer's job to act on
`missing_required_receipt`.
"""

from __future__ import annotations

from dataclasses import dataclass

from temporalio import activity

from daydor.models.expense import ExpenseCategoryRule, ExpenseClaim


@dataclass
class PolicyThresholdFlags:
    requires_manager_approval: bool
    requires_founder_approval: bool
    missing_required_receipt: bool


@activity.defn
async def validate_policy_thresholds(
    claim: ExpenseClaim, category_rule: ExpenseCategoryRule
) -> PolicyThresholdFlags:
    """Evaluate `claim.amount` against `category_rule`'s thresholds and
    `claim.receipt_document_id`'s presence, returning the flags for the
    caller to persist onto `claim`. Never mutates `claim` itself and never
    blocks submission - informational only."""
    raise NotImplementedError
