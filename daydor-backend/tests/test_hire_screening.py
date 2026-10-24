"""Hire flow steps 5-8 (application -> screening -> interview -> offer), driven end to end
through the real WorkflowEngine + queue, using version 3 of 'hire'
(see migrations/sql/0015_hire_workflow_v3.sql)."""
from datetime import date, datetime
from decimal import Decimal

import pytest
from sqlalchemy import text

from daydor.db.session import tenant_session
from daydor.gates.hard import resolve
from daydor.hire.interview import handle_interview_scheduler
from daydor.hire.offer import handle_offer_letter_generator
from daydor.hire.posting import handle_job_posting_publisher
from daydor.hire.requisition import open_requisition
from daydor.hire.screening import handle_candidate_screener_assess, handle_candidate_screener_intake, \
    intake_application, submit_application
from daydor.queue import Worker
from daydor.workflow.engine import WorkflowEngine, gate_resolved_handler
from tests.factories import insert
from tests.hire_helpers import drive_to_job_posting

# Scope simplification (see daydor.hire.interview / daydor.hire.offer docstrings): there is no
# calendar or comp-negotiation engine, so interview timing is decided up front, at start_hire()
# time, rather than computed by the step that actually uses it later.
SCHEDULED_AT = datetime(2026, 2, 10, 10, 0).isoformat()


@pytest.fixture
def comp_band(engine, hire_org):
    with engine.begin() as conn:
        return insert(conn, "comp_band", tenant_id=hire_org["tenant"], job_profile_id=hire_org["job_profile"],
                     currency="INR", band_min="1000000", band_mid="1250000", band_max="1500000",
                     effective_from="2026-01-01")


def _resolve_and_relay(engine, wf, tenant, role, user_id, approval_id, worker_suffix):
    with tenant_session(engine, role, tenant, user_id=user_id) as conn:
        assert resolve(conn, approval_id, "approved") == "approved"
    workflow_worker = Worker(engine, "workflow", f"w-workflow-{worker_suffix}")
    workflow_worker.register("workflow.gate_resolved", role="agent_ro", fn=gate_resolved_handler(wf))
    workflow_worker.tick()


def _ta_worker(engine, wf, name="w-ta"):
    w = Worker(engine, "ta", name)
    w.register("job_posting_publisher", role="agent_ta", fn=handle_job_posting_publisher())
    w.register("candidate_screener_intake", role="agent_ta", fn=handle_candidate_screener_intake(wf))
    w.register("candidate_screener_assess", role="agent_ta", fn=handle_candidate_screener_assess(wf))
    w.register("interview_scheduler", role="agent_ta", fn=handle_interview_scheduler(wf))
    w.register("offer_letter_generator", role="agent_ta", fn=handle_offer_letter_generator(wf))
    return w


def _drive_to_screening_result(engine, hire_org, wf, *, comp_band_id, proposed_base, worker_name="w-ta"):
    """requisition -> budget-approved -> posted -> candidate applied -> screened (parked on
    g_aedt). Returns (instance_id, requisition_id, ta_worker)."""
    tenant = hire_org["tenant"]
    instance_id, requisition_id, budget_approval_id = drive_to_job_posting(
        engine, hire_org, wf, comp_band_id=str(comp_band_id), proposed_base=proposed_base,
        interviewer_employee_id=str(hire_org["hiring_manager"]), scheduled_at=SCHEDULED_AT)
    _resolve_and_relay(engine, wf, tenant, "tenant_founder", hire_org["founder_user"], budget_approval_id,
                      f"{worker_name}-budget")

    ta_worker = _ta_worker(engine, wf, worker_name)
    ta_worker.tick()  # job_posting_publisher

    with tenant_session(engine, "agent_ta", tenant) as conn:
        submit_application(conn, wf, instance_id, full_name="Jordan Candidate",
                           email=f"{worker_name}@example.test", phone="555-0100", resume_ref="resume-1",
                           source="referral")
    ta_worker.tick()  # candidate_screener_intake
    ta_worker.tick()  # candidate_screener_assess
    return instance_id, requisition_id, ta_worker


def _drive_to_offer(engine, hire_org, wf, *, comp_band_id, proposed_base, worker_name="w-ta"):
    """Continues _drive_to_screening_result through AEDT sign-off, interview, and offer.
    Returns (instance_id, requisition_id, final_instance_row)."""
    tenant = hire_org["tenant"]
    instance_id, requisition_id, ta_worker = _drive_to_screening_result(
        engine, hire_org, wf, comp_band_id=comp_band_id, proposed_base=proposed_base, worker_name=worker_name)

    with tenant_session(engine, "tenant_hr", tenant) as conn:
        aedt_approval_id = conn.execute(text("SELECT waiting_on_approval FROM app.workflow_instance "
                                             "WHERE id = :i"), {"i": instance_id}).scalar_one()
    assert aedt_approval_id is not None
    _resolve_and_relay(engine, wf, tenant, "tenant_hr", hire_org["hr_user"], aedt_approval_id,
                      f"{worker_name}-aedt")

    ta_worker.tick()  # interview_scheduler
    ta_worker.tick()  # offer_letter_generator

    with tenant_session(engine, "tenant_hr", tenant) as conn:
        instance = conn.execute(text("SELECT status, waiting_on_approval FROM app.workflow_instance "
                                     "WHERE id = :i"), {"i": instance_id}).one()
    return instance_id, requisition_id, instance


def test_application_intake_is_idempotent_per_requisition_and_email(engine, hire_org):
    tenant = hire_org["tenant"]
    with tenant_session(engine, "agent_ta", tenant) as conn:
        req_id = open_requisition(conn, position_id=hire_org["position"],
                                  hiring_manager_id=hire_org["hiring_manager"],
                                  target_start_date=date(2026, 3, 1))
        a = intake_application(conn, requisition_id=req_id, full_name="Jordan Candidate",
                               email="dup@example.test", phone="555-0101", resume_ref="r1", source="referral")
        b = intake_application(conn, requisition_id=req_id, full_name="Jordan Candidate",
                               email="dup@example.test", phone="555-0101", resume_ref="r1", source="referral")
    assert a == b


def test_screening_requires_aedt_signoff_before_interview(engine, hire_org, comp_band):
    tenant = hire_org["tenant"]
    wf = WorkflowEngine()
    instance_id, requisition_id, _ = _drive_to_screening_result(
        engine, hire_org, wf, comp_band_id=comp_band, proposed_base="1200000", worker_name="w-aedt")

    with tenant_session(engine, "tenant_hr", tenant) as conn:
        instance = conn.execute(text("SELECT state, status, waiting_on_approval FROM app.workflow_instance "
                                     "WHERE id = :i"), {"i": instance_id}).one()
        screened = conn.execute(text("SELECT count(*) FROM screening_result sr JOIN application a "
                                     "ON a.id = sr.application_id WHERE a.requisition_id = :r"),
                                {"r": requisition_id}).scalar_one()
    assert instance.state == "s06_screening_result"
    assert instance.status == "waiting_gate"
    assert instance.waiting_on_approval is not None
    assert screened == 1


def test_offer_within_band_needs_no_extra_gate(engine, hire_org, comp_band):
    wf = WorkflowEngine()
    instance_id, requisition_id, instance = _drive_to_offer(
        engine, hire_org, wf, comp_band_id=comp_band, proposed_base="1200000", worker_name="w-inband")
    assert instance.status == "completed"

    with tenant_session(engine, "tenant_hr", hire_org["tenant"]) as conn:
        offer = conn.execute(text("SELECT within_band, proposed_base FROM offer o "
                                  "JOIN application a ON a.id = o.application_id "
                                  "WHERE a.requisition_id = :r"), {"r": requisition_id}).one()
    assert offer.within_band is True
    assert offer.proposed_base == Decimal("1200000")


def test_offer_outside_band_requires_founder_approval(engine, hire_org, comp_band):
    wf = WorkflowEngine()
    instance_id, requisition_id, instance = _drive_to_offer(
        engine, hire_org, wf, comp_band_id=comp_band, proposed_base="2000000", worker_name="w-outband")
    assert instance.status == "waiting_gate"
    assert instance.waiting_on_approval is not None

    with tenant_session(engine, "tenant_hr", hire_org["tenant"]) as conn:
        offer = conn.execute(text("SELECT within_band FROM offer o JOIN application a "
                                  "ON a.id = o.application_id WHERE a.requisition_id = :r"),
                             {"r": requisition_id}).one()
    assert offer.within_band is False

    _resolve_and_relay(engine, wf, hire_org["tenant"], "tenant_founder", hire_org["founder_user"],
                      instance.waiting_on_approval, "offerband")
    with tenant_session(engine, "tenant_hr", hire_org["tenant"]) as conn:
        final_status = conn.execute(text("SELECT status FROM app.workflow_instance WHERE id = :i"),
                                    {"i": instance_id}).scalar_one()
    assert final_status == "completed"
