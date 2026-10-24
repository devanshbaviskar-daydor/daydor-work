"""gratuity_repository activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `GratuityAccrualWorkflow` to read and upsert one
employee's running `GratuityAccrualBalance`.

Daydor's own persistence seam for the gratuity running-balance mechanism -
adapts the *mechanism* from the co-founder's Daydor-Build run-builder
(`daydor-backend/src/daydor/payroll/run_builder.py`'s `_accrue_gratuity`:
upsert a per-employee running balance every payroll run instead of
recomputing from scratch at exit), not its accrual rate or logic, which was
an admitted rough approximation (a flat ~15/26/12 monthly rate, no
eligibility gating, no ceiling). Storage (Postgres) is intentionally not
wired here, consistent with every other stub in this repo (see
`payroll_run_repository`, `CircuitBreaker`, `CoreHRClient`); this module
fixes the method boundary so `GratuityAccrualWorkflow` is complete and
testable independent of that wiring.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from temporalio import activity

from daydor.models.compliance import ThresholdObligation
from daydor.models.payroll import GratuityAccrualBalance


@activity.defn
async def find_gratuity_threshold_obligation(tenant_id: uuid.UUID) -> ThresholdObligation | None:
    """Look up the tenant's Gratuity Act applicability status.

    Reads the `ThresholdObligation` row for `StatutoryScheme.GRATUITY`
    tracked by the Headcount Threshold Monitor domain (the same
    10-employee crossing that gates ESI and the POSH Internal Committee).
    `is_applicable=False` (including a missing row, pre-crossing) means the
    employer has not yet crossed 10 employees, so gratuity does not yet
    accrue for any employee at this tenant.
    """
    return await _find_gratuity_threshold_obligation(tenant_id)


async def _find_gratuity_threshold_obligation(tenant_id: uuid.UUID) -> ThresholdObligation | None:
    raise NotImplementedError


@dataclass
class GratuityBalanceUpdate:
    """One employee's balance after applying a period's accrual delta.

    `accrued_amount` is capped at `GRATUITY_TAX_FREE_CEILING`
    (gratuity_accrual_tracker.GRATUITY_TAX_FREE_CEILING) by the workflow
    before this is persisted - the ceiling bounds the tracked lifetime
    balance itself, not just the eventual payout, so the balance an
    employee or founder sees already reflects the tax-free cap.
    """

    employee_id: uuid.UUID
    tenant_id: uuid.UUID
    as_of_period: date
    accrued_amount: Decimal
    gratuity_wage_base: Decimal


@activity.defn
async def find_gratuity_balance(
    tenant_id: uuid.UUID, employee_id: uuid.UUID
) -> GratuityAccrualBalance | None:
    """Look up an employee's existing running gratuity balance, if any.

    `None` means this is the employee's first accrued period - the caller
    starts a new balance at this period's delta rather than adding to one.
    """
    return await _find_gratuity_balance(tenant_id, employee_id)


async def _find_gratuity_balance(
    tenant_id: uuid.UUID, employee_id: uuid.UUID
) -> GratuityAccrualBalance | None:
    raise NotImplementedError


@activity.defn
async def upsert_gratuity_balance(update: GratuityBalanceUpdate) -> GratuityAccrualBalance:
    """Write an employee's updated running gratuity balance.

    Upserts on `employee_id` (one balance row per employee, not per
    period) - this replaces the previous `as_of_period`/`accrued_amount`/
    `gratuity_wage_base` rather than appending a new row, matching
    `GratuityAccrualBalance`'s "running balance" contract that
    `final_settlement_calculator` reads at exit.
    """
    return await _upsert_gratuity_balance(update)


async def _upsert_gratuity_balance(update: GratuityBalanceUpdate) -> GratuityAccrualBalance:
    raise NotImplementedError
