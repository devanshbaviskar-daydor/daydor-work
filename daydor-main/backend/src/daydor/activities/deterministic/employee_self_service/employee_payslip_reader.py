"""employee_payslip_reader activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee opens the Payslips screen on the Employee Self-Service
Portal, or `employee_qa_agent` asks a pay question on their behalf.

Pure read over the already-merged Payroll domain's `Payslip`/
`PayslipLineItem` tables, scoped to the caller's own `employee_id`. No new
data model: this worker reads existing Payroll rows, it does not write or
derive anything. Must be called only with an `employee_id` that
`self_service_scope_guard` has already cleared for the active session -
this worker does not re-check scope itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.payroll import Payslip, PayslipLineItem


@dataclass
class PayslipQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""


@dataclass
class PayslipWithLineItems:
    payslip: Payslip
    line_items: list[PayslipLineItem]


@activity.defn
async def read_employee_payslips(query: PayslipQuery) -> list[PayslipWithLineItems]:
    """Return every `Payslip` (with its `PayslipLineItem` rows) for
    `query.employee_id`, newest first. Read-only: never mutates a `Payslip`
    or `PayslipLineItem`, and never reads another employee's payslip -
    callers must pass an `employee_id` already cleared by
    `self_service_scope_guard`."""
    raise NotImplementedError
