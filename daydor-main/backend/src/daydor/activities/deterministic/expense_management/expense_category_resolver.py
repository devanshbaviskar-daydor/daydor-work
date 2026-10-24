"""expense_category_resolver activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `policy_threshold_validator` before it evaluates a
claim's approval/receipt requirements, and by any reporting path that needs
a category's ITC-eligibility metadata.

Resolves the single `ExpenseCategoryRule` applicable to one `category_code`
as of a given date, narrowed to the row whose `effective_from`/
`effective_to` window covers that date. Fixed lookup - no LLM judgment. Not
tenant-scoped, since the rule itself is a policy default (Domain 7.4), not a
per-tenant preference, for v1.
"""

from __future__ import annotations

from datetime import date

from temporalio import activity

from daydor.models.expense import ExpenseCategoryRule


@activity.defn
async def resolve_expense_category(category_code: str, as_of: date) -> ExpenseCategoryRule:
    """Resolve the `ExpenseCategoryRule` in force for `category_code` on
    `as_of`.

    Raises if no rule's effective-dated window covers `as_of` for that
    category - a gap in the versioned rule table is a data problem, not
    something this activity should paper over with a stale fallback.
    """
    raise NotImplementedError
