"""benefit_payroll_feed activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: the payroll run-builder assembly step (`PayrollRunBuilderWorkflow`,
daydor.workflows.payroll_compliance.run_builder), once per confirmed,
cost-bearing `BenefitElection` active for the period.

Produces a flat (not slab-based, not percentage-of-gross)
`PayslipLineItemType.BENEFIT` deduction line from a confirmed
`BenefitElection`'s already-resolved `employee_monthly_cost` and
`employer_monthly_cost` - zero for a wholly employer-funded benefit. Additive
to `wage_calculator`'s existing inputs: this worker never recomputes or
otherwise touches gross pay, the PF/ESI wage base, or gratuity's
(Basic+DA)-based accrual formula, all of which stay defined independent of
benefits. Only `status=active` elections feed a payroll period - a
`pending_confirmation` or `terminated` election produces no line.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity

from daydor.models.benefits import BenefitElection
from daydor.models.payroll import PayslipLineItem


@dataclass
class BenefitPayrollFeedQuery:
    tenant_id: uuid.UUID
    payslip_id: uuid.UUID
    election: BenefitElection


@activity.defn
async def feed_benefit_deduction(query: BenefitPayrollFeedQuery) -> PayslipLineItem | None:
    """Return a `PayslipLineItemType.BENEFIT` line item for `query.payslip_id`
    carrying `query.election`'s `employee_monthly_cost`/
    `employer_monthly_cost` as a flat amount, or `None` when `query.election`
    is not `status=active` for the period. Never recomputes gross pay, the
    PF/ESI wage base, or gratuity's wage base."""
    raise NotImplementedError
