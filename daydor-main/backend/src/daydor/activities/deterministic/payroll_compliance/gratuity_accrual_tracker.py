"""gratuity_accrual_tracker activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after `payroll_run_builder` assembles a period's payslips, once per
active employee - see `workflows/payroll_compliance/gratuity_accrual.py`.

Computes one employee's gratuity accrual *delta* for a single payroll
period, per the Payment of Gratuity Act, 1972. The per-period delta is
added to a running `GratuityAccrualBalance` (persisted by
`gratuity_repository`) rather than this activity recomputing the lifetime
total from scratch each run - see that module's docstring for why.

Formula (Product Spec §2.4f, the Act, cross-checked against
frappe/india-payroll): gratuity for completed service =
(Basic + DA) / 26 * 15 * completed years of service, where a service period
of 6+ months in the final year rounds up to the next full year. Expressed
per-period here as a monthly accrual rate of (Basic + DA) / 26 * 15 / 12,
applied to the employee's current `gratuity_wage_base` for the period -
this is the per-period analogue of the same formula, not a different rate;
the full-year rounding rule is applied once, at final-settlement time
against the accumulated service period, not re-applied to each monthly
delta.

Eligibility gating (5 years continuous service for permanent employees, 1
year for fixed-term employees under the Code on Social Security, 2020) and
the Gratuity Act's 10-employee applicability threshold are evaluated by the
caller (`GratuityAccrualWorkflow`) before this activity is invoked - see
that module for why accrual still runs for not-yet-eligible employees.
Eligibility determines whether the accrued balance is *payable* at exit,
not whether it accrues.

Sources (verified 2026-10-20, re-checked against the Product Spec's
2026-10-03 research pass, which is the authority this activity defers to
for drift if re-verified later):
- Formula, 5-year/1-year eligibility split, >=6-month rounding: Payment of
  Gratuity Act, 1972 as amended by the Code on Social Security, 2020;
  cross-checked against frappe/india-payroll's gratuity module and the
  Product Spec's Payroll domain (Product Specification §2.4f).
- Tax-free ceiling ₹20,00,000 lifetime (Section 10(10), private sector):
  Gazette notification S.O. 1420(E), March 2019 - unchanged as of the
  Product Spec's 2026-10-03 research pass. The Product Spec explicitly
  flags and rejects a conflicting ₹25,00,000 figure as the *central
  government employee* ceiling (a different population, raised Jan 2024) -
  do not substitute it here.
- Labour Codes wage-base effect: since Nov 2025, Basic + DA must be >=~50%
  of CTC, which raises the gratuity wage base (and therefore accrual) for
  salary structures that understated Basic pre-Codes. `gratuity_wage_base`
  must be the wage base already validated/recomputed against that floor
  (see `EmploymentRecord.wage_floor_compliant`), not a stale stored Basic
  figure - re-verify this input, not just the rate, before trusting it.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity

GRATUITY_DAYS_PER_YEAR = 15
GRATUITY_WORKING_DAYS_PER_MONTH = 26
GRATUITY_TAX_FREE_CEILING = Decimal("2000000")
"""Lifetime tax-free ceiling for private-sector gratuity, Section 10(10) of
the Income Tax Act, per Gazette notification S.O. 1420(E) (March 2019).
Verified current as of 2026-10-20 against the Product Spec's 2026-10-03
research pass. Not the ₹25,00,000 central-government-employee figure - see
module docstring."""


@dataclass
class GratuityAccrualDelta:
    employee_id: uuid.UUID
    period_accrual: Decimal
    gratuity_wage_base: Decimal


@activity.defn
async def calculate_gratuity_accrual_delta(
    employee_id: uuid.UUID, gratuity_wage_base: Decimal
) -> GratuityAccrualDelta:
    """Compute one employee's gratuity accrual delta for one payroll period.

    `gratuity_wage_base` is the period's Basic + DA, already validated
    against the Labour Codes' 50%-of-CTC wage-definition floor by the
    caller - this activity does not itself re-derive the wage base from a
    salary structure.
    """
    raise NotImplementedError
