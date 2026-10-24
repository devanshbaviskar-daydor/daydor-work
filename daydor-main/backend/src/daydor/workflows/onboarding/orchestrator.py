"""Onboarding orchestrator workflow.

Domain orchestrator under the Root Orchestrator. Conducts the hire event
across domains: creates the Core HR record, signals the Headcount
Threshold Monitor to recheck, and hands the new employee off to the
Payroll & Compliance domain for the next payroll cycle. Owns no data of
its own - it sequences calls into the domains that do.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date

from temporalio import workflow


@dataclass
class OnboardingInput:
    tenant_id: uuid.UUID
    full_name: str
    date_of_joining: date


@workflow.defn
class OnboardingOrchestratorWorkflow:
    """Domain orchestrator for a single employee's hire event.

    Trigger: new-hire event raised by ops (manual trigger in this phase).
    """

    @workflow.run
    async def run(self, input: OnboardingInput) -> None:
        raise NotImplementedError
