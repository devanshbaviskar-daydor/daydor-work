"""payroll_run_repository activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: called by `run_builder` before and after the per-employee
calculator fan-out, and once more to persist the assembled run.

Daydor's own persistence seam for the payroll-run assembly step - not a
port of the co-founder's run-builder code, just the interface the
idempotency and transactional-write design needs. Storage (Postgres) is
intentionally not wired here, consistent with every other stub in this
repo (see `CircuitBreaker`, `CoreHRClient`); this module fixes the method
boundaries so `run_builder` is complete and testable independent of that
wiring.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import activity

from daydor.models.payroll import Payslip, PayslipLineItem, PayrollRun


@dataclass
class PayrollRunKey:
    """The idempotency key for one payroll run: a legal entity may not have
    two runs covering the same period."""

    tenant_id: uuid.UUID
    legal_entity_id: uuid.UUID
    period_start: date
    period_end: date


@dataclass
class PayrollRunAssembly:
    """One fully-computed payroll run, ready to persist in a single
    transaction: the run header plus every employee's payslip and its PF/
    ESI/PT/TDS line items."""

    run: PayrollRun
    payslips: list[Payslip]
    line_items: list[PayslipLineItem]


@activity.defn
async def find_existing_payroll_run(key: PayrollRunKey) -> PayrollRun | None:
    """Look up a payroll run already persisted for this idempotency key.

    Called both before and after the compute phase in `run_builder`, so
    that a run created by a concurrent attempt between the two checks is
    still caught before this attempt writes a duplicate.
    """
    return await _find_existing_payroll_run(key)


async def _find_existing_payroll_run(key: PayrollRunKey) -> PayrollRun | None:
    raise NotImplementedError


@activity.defn
async def persist_payroll_run(assembly: PayrollRunAssembly) -> PayrollRun:
    """Write the run, its payslips, and their line items in one transaction.

    Must re-check `find_existing_payroll_run` for `assembly.run`'s
    idempotency key inside the same transaction immediately before the
    insert (the post-compute half of the concurrency-safe double-check) and
    return the already-existing run instead of inserting a duplicate if one
    now exists.
    """
    return await _persist_payroll_run(assembly)


async def _persist_payroll_run(assembly: PayrollRunAssembly) -> PayrollRun:
    raise NotImplementedError
