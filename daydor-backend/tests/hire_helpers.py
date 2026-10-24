"""Shared driving helpers for the hire-flow tests (tests/test_hire_*.py). Not a test module
itself -- no test_ prefix, so pytest does not collect it."""
from __future__ import annotations

from datetime import date

from sqlalchemy import text

from daydor.db.session import tenant_session
from daydor.hire.approvals import handle_requisition_approval_router
from daydor.hire.workflow import start_hire
from daydor.queue import Worker
from daydor.workflow.engine import WorkflowEngine


def drive_to_job_posting(engine, hire_org, wf: WorkflowEngine, **extra_context):
    """start_hire() through the budget gate; returns (instance_id, requisition_id, approval_id).
    The instance is left parked in waiting_gate on g_requisition_budget."""
    tenant = hire_org["tenant"]
    context = {"channel": "company_site", "pay_range_min": "1000000", "pay_range_max": "1500000",
              **extra_context}
    with tenant_session(engine, "agent_ta", tenant) as conn:
        instance_id = start_hire(conn, wf, position_id=hire_org["position"],
                                 hiring_manager_id=hire_org["hiring_manager"],
                                 target_start_date=date(2026, 3, 1), **context)
        requisition_id = conn.execute(
            text("SELECT subject_id FROM app.workflow_instance WHERE id = :i"),
            {"i": instance_id}).scalar_one()

    router_worker = Worker(engine, "platform", "w-platform-helper")
    router_worker.register("requisition_approval_router", role="agent_ro",
                           fn=handle_requisition_approval_router(wf))
    router_worker.tick()

    with tenant_session(engine, "tenant_hr", tenant) as conn:
        instance = conn.execute(text("SELECT status, waiting_on_approval FROM app.workflow_instance "
                                     "WHERE id = :i"), {"i": instance_id}).one()
    assert instance.status == "waiting_gate"
    return instance_id, requisition_id, instance.waiting_on_approval
