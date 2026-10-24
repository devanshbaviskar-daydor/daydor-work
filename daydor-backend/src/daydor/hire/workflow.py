"""The hire flow's hand-written workflow definition, replacing the generated skeleton for
`name='hire'` (daydor.workflow.definitions generates one for every model flow; this module is
the hand-written override its own docstring says flows may use).

Five corrections over what the generator would produce for the same steps:

1. **Gate placement.** The generator attaches a step's gate to the transition *entering* that
   step's own state (literally: "step k's gate guards advancing into state k"). That reads
   correctly for a gate whose condition is known before the step runs. It reads backwards for
   `g_requisition_budget` (docs/model-findings.md finding 11): you want the founder's approval
   checked *after* the requisition is drafted and *before* a job posting goes out, not before the
   approval-routing step is even allowed to start. So here the gate sits on
   s03_approval_request's own outgoing transition.
2. **Real payload, not just an id.** Every entered state's enqueued job carries the instance's
   full `context` (see `daydor.workflow.engine.WorkflowEngine._enter`) alongside `subject_id`.
3. **Position check and requisition drafting are not queued steps.** `job_requisition.id` has to
   exist before `WorkflowEngine.start()` can use it as the instance's subject_id (ids are never
   insertable explicitly -- see daydor.hire.requisition's docstring) -- so both run synchronously
   in `start_hire()`, below, before the instance starts. s01_position/s02_job_requisition stay in
   the state graph with no `enter_jobs` of their own, purely so the transition log
   (`app.workflow_transition`) still shows every model step in order for audit, even though the
   real work already happened by the time they're entered.

4. **s04_job_posting does not auto-advance (added in Sprint 2).** Nothing about "a posting is
   live" implies "a candidate exists" -- advancing into s05_application has to wait for a real
   candidate to apply. See `daydor.hire.screening.submit_application`, the function that actually
   fires this transition, and `daydor.hire.posting`'s docstring for why its own handler no longer
   does.
5. **g_aedt and g_offer_band also move, for the same reason as g_requisition_budget (Sprint 2).**
   The generator would gate *entering* s06_screening_result / s08_offer. Both gates actually
   depend on something only known once that state's own work is done (whether the tool's
   automated recommendation needs HR sign-off; whether the offer is outside the comp band), so
   both sit on those states' own outgoing transitions instead, conditional on a `requires_*` flag
   the state's own handler sets via `context_patch`.

Scope boundary: this covers hire flow steps 1-8 (position check through offer). `s08_offer`'s
"advance" goes to "done" as a stopping point, not the model's real terminal state -- Sprint 3
extends it through background_check, employee creation and consent. Versions:
`app.workflow_definition` version 1 is the generated skeleton (`0010_workflow_seed.sql`), version
2 is Sprint 1's steps 1-4 (`0014_hire_workflow.sql`), version 3 (this one) is Sprint 2's steps
5-8 (`0015_hire_workflow_v3.sql`).
"""
from __future__ import annotations

import json
from datetime import date
from uuid import UUID

from sqlalchemy import Connection

from daydor.hire.requisition import open_requisition
from daydor.workflow.engine import WorkflowEngine

HIRE_DEFINITION = {
    "title": "Requisition to first payslip (hand-written, steps 1-8)",
    "description": "Seat check, requisition, budget approval, job posting, screening, interview, offer.",
    "initial": "start",
    "states": {
        "start": {"terminal": False, "on": {"advance": {"to": "s01_position"}}},
        "s01_position": {
            "terminal": False,
            "on": {"advance": {"to": "s02_job_requisition"}},
        },
        "s02_job_requisition": {
            "terminal": False,
            "on": {"advance": {"to": "s03_approval_request"}},
        },
        "s03_approval_request": {
            "terminal": False,
            "enter_jobs": [{"queue": "platform", "kind": "requisition_approval_router"}],
            "on": {"advance": {"to": "s04_job_posting", "gate": "g_requisition_budget"}},
        },
        "s04_job_posting": {
            "terminal": False,
            "enter_jobs": [{"queue": "ta", "kind": "job_posting_publisher"}],
            "on": {"advance": {"to": "s05_application"}},
        },
        "s05_application": {
            "terminal": False,
            "enter_jobs": [{"queue": "ta", "kind": "candidate_screener_intake"}],
            "on": {"advance": {"to": "s06_screening_result"}},
        },
        "s06_screening_result": {
            "terminal": False,
            "enter_jobs": [{"queue": "ta", "kind": "candidate_screener_assess"}],
            "on": {"advance": {"to": "s07_interview", "gate": "g_aedt", "gate_if": "requires_g_aedt"}},
        },
        "s07_interview": {
            "terminal": False,
            "enter_jobs": [{"queue": "ta", "kind": "interview_scheduler"}],
            "on": {"advance": {"to": "s08_offer"}},
        },
        "s08_offer": {
            "terminal": False,
            "enter_jobs": [{"queue": "ta", "kind": "offer_letter_generator"}],
            "on": {"advance": {"to": "done", "gate": "g_offer_band", "gate_if": "requires_g_offer_band"}},
        },
        "done": {"terminal": True},
    },
}


def start_hire(conn: Connection, engine: WorkflowEngine, *, position_id: UUID, hiring_manager_id: UUID,
               target_start_date: date, **extra_context) -> UUID:
    """Confirm the seat, draft the requisition, and start the hire workflow instance against it,
    advancing synchronously through the two already-done steps so the transition log records
    them. Returns the workflow_instance id. `extra_context` (channel, pay_range_min/max, ...) is
    whatever later steps need; it rides in the instance's context alongside position_id/
    hiring_manager_id/target_start_date, which are added automatically."""
    requisition_id = open_requisition(conn, position_id=position_id, hiring_manager_id=hiring_manager_id,
                                      target_start_date=target_start_date)
    context = {"position_id": str(position_id), "hiring_manager_id": str(hiring_manager_id),
              "target_start_date": target_start_date.isoformat(), **extra_context}
    instance_id = engine.start(conn, "hire", "job_requisition", requisition_id, context)
    engine.fire(conn, instance_id, "advance")  # start -> s01_position
    engine.fire(conn, instance_id, "advance")  # s01_position -> s02_job_requisition
    engine.fire(conn, instance_id, "advance")  # s02_job_requisition -> s03_approval_request (enqueues the router)
    return instance_id


def seed_sql(version: int) -> str:
    """Each call is a one-off, hand-authored migration (like 0011-0014), not a regenerate-in-place
    tool: bumping `version` here and re-running does not touch earlier versions' already-applied
    migration files (0014 for version 2 stays exactly as it was committed)."""
    body = json.dumps(HIRE_DEFINITION, sort_keys=True).replace("'", "''")
    return "\n".join([
        "-- Hand-written, NOT generated: see daydor.hire.workflow.HIRE_DEFINITION for why.",
        f"-- Supersedes 'hire' version {version - 1}.",
        "SET ROLE daydor_schema_owner;",
        "",
        "UPDATE app.workflow_definition SET active = false WHERE name = 'hire' AND active;",
        "INSERT INTO app.workflow_definition (name, version, definition, source) "
        f"VALUES ('hire', {version}, '{body}'::jsonb, 'hand-written');",
        "",
        "RESET ROLE;",
        "",
    ])


if __name__ == "__main__":  # pragma: no cover
    from pathlib import Path
    Path("migrations/sql/0015_hire_workflow_v3.sql").write_text(seed_sql(3))
    print("wrote migrations/sql/0015_hire_workflow_v3.sql")
