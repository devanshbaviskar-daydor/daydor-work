"""Approval Gate Escalation orchestrator workflow.

Domain orchestrator under the Root Orchestrator. Drives the timeout policy
for one `ApprovalRequest` gate instance, independent of which domain opened
it (payroll disbursal, statutory filing, threshold confirmation, offboarding
F&F, DPDP consent).

Two-stage escalation: a first timer races the `resolve` signal. If the gate
is still unresolved when that timer fires, it notifies without changing gate
ownership and starts a second, grace-period timer. If that also elapses
unresolved, the gate is reassigned to the configured fallback approver. The
`resolve` signal can arrive at any point and ends the workflow immediately,
whichever stage it finds in progress.

A gate type with no fallback approver (e.g. DPDP consent, per
`ApprovalRequest`'s docstring) must not be driven by this workflow - pass
one of the other ApproverRole gate types in `fallback_approver_user_id`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from daydor.activities.deterministic.approval_gate.escalation_notifier import (
        EscalationNotice,
        notify_gate_timeout,
    )
    from daydor.activities.deterministic.approval_gate.fallback_reassigner import (
        ReassignmentRequest,
        reassign_to_fallback_approver,
    )


@dataclass
class ApprovalGateEscalationInput:
    tenant_id: uuid.UUID
    approval_request_id: uuid.UUID
    gate_type: str
    fallback_approver_user_id: uuid.UUID
    first_timeout_seconds: float
    grace_period_seconds: float


@workflow.defn
class ApprovalGateEscalationWorkflow:
    """Domain orchestrator for one approval gate's timeout escalation.

    Trigger: started alongside the `ApprovalRequest` row by the domain
    workflow that opened the gate (e.g. payroll disbursal approval).
    """

    def __init__(self) -> None:
        self._resolved = False

    @workflow.signal
    def resolve(self) -> None:
        """The gate was approved or rejected by whoever currently holds it.
        Ends the escalation workflow; does not run on an already-resolved
        gate."""
        self._resolved = True

    @workflow.run
    async def run(self, input: ApprovalGateEscalationInput) -> None:
        try:
            await workflow.wait_condition(
                lambda: self._resolved, timeout=input.first_timeout_seconds
            )
            return
        except TimeoutError:
            pass

        await workflow.execute_activity(
            notify_gate_timeout,
            EscalationNotice(
                tenant_id=input.tenant_id,
                approval_request_id=input.approval_request_id,
                gate_type=input.gate_type,
            ),
            start_to_close_timeout=timedelta(minutes=5),
        )

        try:
            await workflow.wait_condition(
                lambda: self._resolved, timeout=input.grace_period_seconds
            )
            return
        except TimeoutError:
            pass

        await workflow.execute_activity(
            reassign_to_fallback_approver,
            ReassignmentRequest(
                tenant_id=input.tenant_id,
                approval_request_id=input.approval_request_id,
                fallback_approver_user_id=input.fallback_approver_user_id,
            ),
            start_to_close_timeout=timedelta(minutes=5),
        )
