"""benefit_cost_calculator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called while drafting or confirming a `BenefitElection`, once its
covered dependents are known.

Computes the employee-vs-employer monthly cost split for a draft
`BenefitElection`'s covered dependents, per the tenant's
`BenefitCostSplitRule` rows for that `BenefitPlan` - summing each covered
relation's employer/employee contribution (zero employee cost wherever
`employer_funded=True`). Fixed-formula aggregation over already-known
inputs - no LLM judgment, and no plan-level policy decision of its own: it
reads the tenant's configured split rules rather than deriving them.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity

from daydor.models.benefits import BenefitCostSplitRule, CoveredRelation


@dataclass
class CostCalculationQuery:
    tenant_id: uuid.UUID
    benefit_plan_id: uuid.UUID
    covered_relations: list[CoveredRelation]
    """One entry per covered dependent plus `CoveredRelation.SELF`."""


@dataclass
class BenefitCostSplitResult:
    employee_monthly_cost: Decimal
    employer_monthly_cost: Decimal


@activity.defn
async def calculate_benefit_cost_split(
    query: CostCalculationQuery, split_rules: list[BenefitCostSplitRule]
) -> BenefitCostSplitResult:
    """Sum each of `query.covered_relations`' employer/employee monthly cost
    from the matching `split_rules` row for `query.benefit_plan_id`, per
    `CoveredRelation`. A relation with `employer_funded=True` contributes
    `Decimal("0")` to `employee_monthly_cost`."""
    raise NotImplementedError
