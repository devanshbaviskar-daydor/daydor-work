"""Headcount Threshold Monitor orchestrator workflow.

Domain orchestrator under the Root Orchestrator. Watches tenant headcount
against the 10-employee (ESI / Gratuity Act / POSH Internal Committee) and
20-employee (EPF) thresholds, and drives the worker activities that detect
crossings and generate the resulting compliance obligations.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import workflow


@dataclass
class HeadcountThresholdMonitorInput:
    tenant_id: uuid.UUID


@workflow.defn
class HeadcountThresholdMonitorWorkflow:
    """Domain orchestrator for the Headcount Threshold Monitor.

    Trigger: scheduled (periodic headcount recheck) and on-demand
    (employee hire/exit events raised by the Onboarding domain).
    """

    @workflow.run
    async def run(self, input: HeadcountThresholdMonitorInput) -> None:
        raise NotImplementedError
