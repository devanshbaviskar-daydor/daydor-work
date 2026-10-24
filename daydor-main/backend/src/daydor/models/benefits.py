"""Benefits Administration models. Placeholder schema only.

Voluntary group benefits scoped to what's actually common at daydor's 8-25
employee SME target size - a closed catalog, not a US-style benefits menu
(Product Spec Domain 8). Meal vouchers are deliberately excluded: they're a
CTC-structuring choice under `EmploymentRecord.other_allowances_json`
(daydor.models.payroll), not an election with a true enrollment event, so no
meal-voucher logic belongs in this module.

`BenefitPlan` and `BenefitCostSplitRule` are tenant-level reference/catalog
rows, following the same shape as `PtSlabRule`/`DefaultOffboardingTask`
(daydor.models.compliance): plan-configuration decisions the founder makes
once, consulted by every election. `BenefitElection` is the tenant-scoped
transactional row, one per employee's enrollment, versioned/effective-dated
like `EmploymentRecord` (daydor.models.payroll) since a dependent addition or
cost-split change must not rewrite history a payroll run already relied on.

Internal tracking only for v1 (captain decision, 2026-10-20): no API
integration with a benefits broker/insurer platform - `broker_or_insurer_name`
is a free-text record of an external system of truth, not a sync target.
"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel

from daydor.models.base import TenantScopedModel
from daydor.models.employee import EmploymentType


class BenefitType(str, Enum):
    """Closed catalog: Group Mediclaim, Group Personal Accident, Group Term
    Life only. Meal vouchers are not a member of this enum - see module
    docstring."""

    GMC = "gmc"
    GPA = "gpa"
    GTL = "gtl"


class DependentEligibility(str, Enum):
    """Which relations a plan's coverage extends to by default. A tenant's
    `BenefitCostSplitRule` rows still govern who actually bears the cost for
    each covered relation - this only bounds who may be added as a dependent
    at all."""

    SELF_ONLY = "self_only"
    SELF_AND_SPOUSE = "self_and_spouse"
    SELF_SPOUSE_CHILDREN = "self_spouse_children"
    SELF_SPOUSE_CHILDREN_PARENTS = "self_spouse_children_parents"


class BenefitPlan(TenantScopedModel):
    """One tenant's configured benefit offering for one `BenefitType`,
    effective-dated like `EmploymentRecord` (daydor.models.payroll) - a
    renewal or tier change is a new row with a new `effective_from`, never an
    edit to an existing one, so an election drafted against last year's plan
    isn't silently reinterpreted against this year's terms.

    Written by `benefit_plan_configurator` only after the founder's approval
    gate resolves - this row itself is the record of a commercial commitment
    to an insurer, not a draft.
    """

    benefit_type: BenefitType
    effective_from: date
    effective_to: date | None = None
    broker_or_insurer_name: str
    coverage_tier_description: str
    eligible_employment_types: list[EmploymentType]
    default_dependent_eligibility: DependentEligibility


class CoveredRelation(str, Enum):
    """Who a `BenefitCostSplitRule` row's cost split applies to.
    `TOP_UP_SUM_INSURED` covers an employee's voluntary increase to the
    plan's base sum insured, not a dependent relation."""

    SELF = "self"
    SPOUSE = "spouse"
    CHILD = "child"
    PARENT = "parent"
    TOP_UP_SUM_INSURED = "top_up_sum_insured"


class BenefitCostSplitRule(TenantScopedModel):
    """One `BenefitPlan`'s employer-vs-employee cost split for one covered
    relation. `employee_monthly_cost` is only meaningful when
    `employer_funded` is False - null whenever the employer bears the full
    cost.

    `benefit_plan_configurator` pre-populates the common-case defaults when a
    founder first configures a plan (captain decision, 2026-10-20):
    self/spouse/children rows with `employer_funded=True`, and
    parent/top-up-sum-insured rows with `employer_funded=False` and a
    founder-configurable `employee_monthly_cost`. These are starting
    defaults the founder may still adjust, not a fixed rule.
    """

    benefit_plan_id: uuid.UUID
    covered_relation: CoveredRelation
    employer_funded: bool
    employee_monthly_cost: Decimal | None = None


class BenefitElectionStatus(str, Enum):
    PENDING_CONFIRMATION = "pending_confirmation"
    ACTIVE = "active"
    TERMINATED = "terminated"


class CoveredDependent(BaseModel):
    """One covered dependent on a `BenefitElection`. Deliberately minimal -
    a relation, name, and date of birth - rather than a full PII record;
    see `BenefitElection.covered_dependents`'s docstring for why this
    is not a duplication of `Employee`'s DPDP-sensitive fields."""

    relation: CoveredRelation
    name: str
    date_of_birth: date


class BenefitElection(TenantScopedModel):
    """One employee's enrollment in one `BenefitPlan`, effective-dated like
    `EmploymentRecord` - a dependent addition or cost-split change is a new
    version, never an edit to a row a payroll cycle already fed from.

    `covered_dependents` stores relation, name, and date of birth per
    dependent only - never a duplicate of `Employee`'s DPDP-sensitive fields
    (Aadhaar, PAN, bank details), since a dependent is not itself an
    `Employee` row and has no reason to carry that data.

    `window_valid` records whether `enrollment_window_validator` found this
    election's request within the applicable window (15 days from hire for a
    new joiner, 30 days from a qualifying life event for an existing
    employee) - informational, matching the `LeaveRequest.balance_sufficient`
    pattern (daydor.models.leave_attendance): an out-of-window request is
    flagged for ops judgment, not silently rejected.

    `employee_monthly_cost`/`employer_monthly_cost` are this election's
    resolved split from `benefit_cost_calculator`, snapshotted onto the row
    at confirmation time rather than re-derived from
    `BenefitCostSplitRule` on every payroll cycle - a later cost-split rule
    change must not silently reprice an already-confirmed election.
    """

    employee_id: uuid.UUID
    benefit_plan_id: uuid.UUID
    status: BenefitElectionStatus = BenefitElectionStatus.PENDING_CONFIRMATION
    covered_dependents: list[CoveredDependent] = []
    window_valid: bool | None = None
    employee_monthly_cost: Decimal = Decimal("0")
    employer_monthly_cost: Decimal = Decimal("0")
    effective_from: date
    effective_to: date | None = None
