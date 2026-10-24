"""Payroll sub-orchestrator workflow.

Domain sub-orchestrator under Payroll & Statutory Compliance. Drives wage
calculation through to salary disbursal for one payroll run. Disbursal is
a separate gated activity behind a human-approval signal; a wage
calculation error here is caught before that gate, never after.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import workflow


@dataclass
class PayrollRunInput:
    tenant_id: uuid.UUID
    period_start: date
    period_end: date


@workflow.defn
class PayrollOrchestratorWorkflow:
    """Sub-orchestrator for one tenant's payroll run.

    Trigger: scheduled (monthly payroll cycle start).
    """

    @workflow.run
    async def run(self, input: PayrollRunInput) -> None:
        raise NotImplementedError
