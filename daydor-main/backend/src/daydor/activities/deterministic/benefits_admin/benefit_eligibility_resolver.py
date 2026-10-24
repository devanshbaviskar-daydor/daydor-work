"""benefit_eligibility_resolver activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee's hire event, or an ops-mediated enrollment request that
needs its eligible-plan set resolved before drafting.

Determines which of a tenant's active `BenefitPlan` rows an employee is
eligible for, by matching the employee's `EmploymentType` against each
plan's `eligible_employment_types`. Fixed set-membership check against
already-known inputs - no LLM judgment, and no cost-split or dependent
eligibility decision: this worker answers only "which plans", not "what does
it cost" (`benefit_cost_calculator`'s job) or "which dependents may be
added" (each plan's own `default_dependent_eligibility`).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.benefits import BenefitPlan
from daydor.models.employee import EmploymentType


@dataclass
class EligibilityQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    employment_type: EmploymentType


@activity.defn
async def resolve_benefit_eligibility(
    query: EligibilityQuery, active_plans: list[BenefitPlan]
) -> list[BenefitPlan]:
    """Return the subset of `active_plans` whose `eligible_employment_types`
    includes `query.employment_type`. Never consults cost-split rules or
    dependent eligibility - eligibility is plan membership only."""
    raise NotImplementedError
