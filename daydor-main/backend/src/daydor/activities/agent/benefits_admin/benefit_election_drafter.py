"""benefit_election_drafter activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: ops receives a free-text or structured enrollment/dependent-addition
request from an employee (elections are ops-mediated for v1, not self-serve
via the Employee Self-Service Portal - captain decision, 2026-10-20, even
though that portal is now in scope).

Turns an ops-mediated enrollment or dependent-addition request into a
structured `BenefitElection` draft (`status=pending_confirmation`).
Read-only/draft by construction: this worker never validates the enrollment
window itself (`enrollment_window_validator`'s job, downstream of this
draft), never computes the cost split (`benefit_cost_calculator`'s job), and
never finalizes the election (`benefit_election_confirmer`'s job, gated on
Daydor ops approval). It only turns the request into the structured shape
those downstream workers consume.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.benefits import BenefitElection, BenefitPlan


@dataclass
class BenefitElectionRequest:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    request_text: str


@activity.defn
async def draft_benefit_election(
    request: BenefitElectionRequest, eligible_plans: list[BenefitPlan]
) -> BenefitElection:
    """Draft a `BenefitElection` (status `pending_confirmation`) from a
    free-text or structured enrollment/dependent-addition request, matched
    against `eligible_plans`. Never sets `window_valid`, never computes
    `employee_monthly_cost`/`employer_monthly_cost`, and never sets status to
    `active`."""
    raise NotImplementedError
