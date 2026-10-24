"""Compliance sub-orchestrator workflow.

Domain sub-orchestrator under Payroll & Statutory Compliance. Drives
statutory filings (PF, ESI, PT, TDS) and threshold-driven registrations.
A missed filing deadline here is a penalty that has already happened by
the time anyone notices, unlike a wage error caught pre-disbursal - hence
the separate orchestrator with its own failure handling.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import workflow

from daydor.models.compliance import StatutoryScheme


@dataclass
class ComplianceFilingInput:
    tenant_id: uuid.UUID
    scheme: StatutoryScheme
    period_start: date
    period_end: date


@workflow.defn
class ComplianceOrchestratorWorkflow:
    """Sub-orchestrator for one tenant's statutory filing cycle.

    Trigger: scheduled (filing-due-date approach) and threshold crossings
    raised by the Headcount Threshold Monitor domain.
    """

    @workflow.run
    async def run(self, input: ComplianceFilingInput) -> None:
        raise NotImplementedError
