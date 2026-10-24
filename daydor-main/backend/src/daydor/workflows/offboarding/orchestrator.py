"""Offboarding orchestrator workflow.

Domain orchestrator under the Root Orchestrator. Conducts the exit event
across domains: drafts the exit checklist, removes access and tracks asset
return, computes the final settlement, and - once the founder approves it
via the existing ApprovalRequest gate - hands the amount to Payroll &
Compliance's existing salary_disbursement worker. Owns no data of its own
beyond the FinalSettlement record it drives.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import workflow


@dataclass
class OffboardingInput:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    last_working_day: date


@workflow.defn
class OffboardingOrchestratorWorkflow:
    """Domain orchestrator for a single employee's exit event.

    Trigger: exit event raised by ops (manual trigger in this phase).
    """

    @workflow.run
    async def run(self, input: OffboardingInput) -> None:
        raise NotImplementedError
