import uuid
from datetime import timedelta

import pytest
from temporalio import activity
from temporalio.client import WorkflowHandle
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from daydor.activities.deterministic.approval_gate.escalation_notifier import (
    EscalationNotice,
)
from daydor.activities.deterministic.approval_gate.fallback_reassigner import (
    ReassignmentRequest,
)
from daydor.workflows.approval_gate.orchestrator import (
    ApprovalGateEscalationInput,
    ApprovalGateEscalationWorkflow,
)

TASK_QUEUE = "approval-gate-test-queue"


def _input(**overrides) -> ApprovalGateEscalationInput:
    defaults = dict(
        tenant_id=uuid.uuid4(),
        approval_request_id=uuid.uuid4(),
        gate_type="payroll_disbursement_approval",
        fallback_approver_user_id=uuid.uuid4(),
        first_timeout_seconds=timedelta(hours=1).total_seconds(),
        grace_period_seconds=timedelta(hours=1).total_seconds(),
    )
    defaults.update(overrides)
    return ApprovalGateEscalationInput(**defaults)


class RecordingActivities:
    """Stand-ins for the real (NotImplementedError) deterministic activities,
    recording each call so the test can assert on ordering and payload
    without depending on their eventual real implementation."""

    def __init__(self) -> None:
        self.notified: list[EscalationNotice] = []
        self.reassigned: list[ReassignmentRequest] = []

    @activity.defn(name="notify_gate_timeout")
    async def notify_gate_timeout(self, notice: EscalationNotice) -> None:
        self.notified.append(notice)

    @activity.defn(name="reassign_to_fallback_approver")
    async def reassign_to_fallback_approver(self, request: ReassignmentRequest) -> None:
        self.reassigned.append(request)


@pytest.fixture
async def env():
    async with await WorkflowEnvironment.start_time_skipping() as environment:
        yield environment


async def _start(environment: WorkflowEnvironment, activities: RecordingActivities, input: ApprovalGateEscalationInput) -> WorkflowHandle:
    return await environment.client.start_workflow(
        ApprovalGateEscalationWorkflow.run,
        input,
        id=f"approval-gate-escalation-{uuid.uuid4()}",
        task_queue=TASK_QUEUE,
    )


async def test_resolved_before_first_timeout_never_notifies_or_escalates(env):
    activities = RecordingActivities()
    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[ApprovalGateEscalationWorkflow],
        activities=[activities.notify_gate_timeout, activities.reassign_to_fallback_approver],
    ):
        handle = await _start(env, activities, _input())
        await handle.signal(ApprovalGateEscalationWorkflow.resolve)
        await handle.result()

    assert activities.notified == []
    assert activities.reassigned == []


async def test_resolved_during_grace_period_notifies_but_does_not_reassign(env):
    activities = RecordingActivities()
    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[ApprovalGateEscalationWorkflow],
        activities=[activities.notify_gate_timeout, activities.reassign_to_fallback_approver],
    ):
        handle = await _start(env, activities, _input())
        await env.sleep(timedelta(hours=1, minutes=5))
        await handle.signal(ApprovalGateEscalationWorkflow.resolve)
        await handle.result()

    assert len(activities.notified) == 1
    assert activities.reassigned == []


async def test_unresolved_through_both_timeouts_notifies_then_reassigns(env):
    activities = RecordingActivities()
    gate_input = _input()
    async with Worker(
        env.client,
        task_queue=TASK_QUEUE,
        workflows=[ApprovalGateEscalationWorkflow],
        activities=[activities.notify_gate_timeout, activities.reassign_to_fallback_approver],
    ):
        handle = await _start(env, activities, gate_input)
        await handle.result()

    assert len(activities.notified) == 1
    assert activities.notified[0].approval_request_id == gate_input.approval_request_id
    assert len(activities.reassigned) == 1
    assert activities.reassigned[0].fallback_approver_user_id == gate_input.fallback_approver_user_id
