"""benefit_plan_configurator activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: founder approval of a prepared benefit-plan configuration (which
`BenefitType`(s) to offer, broker/insurer, coverage tier, eligible employment
types, and cost-split defaults).

Records the founder's decision to offer a `BenefitPlan` at a given
tier/broker/cost-split - an ongoing annual cost commitment to an insurer,
decided only by the founder (Product Spec §8.3). Pre-populates the plan's
`BenefitCostSplitRule` rows with the common-case defaults (captain decision,
2026-10-20): self/spouse/children `employer_funded=True`; parents and
top-up-sum-insured `employer_funded=False` with the founder's configured
`employee_monthly_cost`. The founder may still adjust any row after this
call - these are starting defaults, not a fixed rule.

Approval gate: `ApproverRole.FOUNDER`, no fallback approver (captain
decision) - unlike every other gated-irreversible worker in this codebase,
this gate's `ApprovalGateEscalationWorkflow` instance must be started with no
`fallback_approver_user_id` reassignment stage, only a long
(1-2 week) reminder notification on timeout. No one but the founder may
commit the company to an insurance cost, so this gate never auto-approves
and never escalates to a fallback approver.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity

from daydor.models.benefits import BenefitPlan, CoveredRelation


@dataclass
class CostSplitDefault:
    covered_relation: CoveredRelation
    employer_funded: bool
    employee_monthly_cost: Decimal | None = None


@dataclass
class BenefitPlanConfiguration:
    tenant_id: uuid.UUID
    plan: BenefitPlan
    cost_split_defaults: list[CostSplitDefault]
    idempotency_key: str


@activity.defn
async def configure_benefit_plan(configuration: BenefitPlanConfiguration) -> BenefitPlan:
    """Persist `configuration.plan` and its `BenefitCostSplitRule` rows
    (pre-populated from `configuration.cost_split_defaults`) after founder
    approval. No automatic retry. Idempotency-keyed against a retried
    approval signal."""
    raise NotImplementedError
