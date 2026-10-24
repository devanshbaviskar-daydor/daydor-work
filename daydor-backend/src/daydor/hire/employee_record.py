"""employee-record-writer: the hire flow's writer for `employee`, `employment_record` (and,
later, `payroll_profile`). See docs/model-findings.md finding 10 for why the 4 PII columns on
`employee` start NULL here and are populated afterwards through daydor.privacy.pii.encrypt_pii,
once consent_record rows exist to reference the now-created employee_id.
"""
from __future__ import annotations

import json
from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Connection, text

from daydor.queue import emit_event
from daydor.queue.worker import Job


def hire_employee(conn: Connection, *, hire_event_id: str, full_name: str, work_email: str,
                  employment_type: str, legal_entity_id: UUID, department_id: UUID, location_id: UUID,
                  state_code: str, date_of_joining: date, date_of_birth: date, personal_address: str,
                  aadhaar_last4: str, position_id: UUID | None = None) -> UUID:
    """Create the employee row if hire_event_id has not been seen for this tenant before, and
    return its id either way. The 4 encrypted PII columns are left NULL; populate them with
    daydor.privacy.pii.encrypt_pii once consent_record rows exist for this employee."""
    row = conn.execute(
        text("INSERT INTO employee (hire_event_id, full_name, work_email, employment_type, "
             "legal_entity_id, department_id, location_id, position_id, state_code, date_of_joining, "
             "is_active, date_of_birth, personal_address, aadhaar_last4) "
             "VALUES (:hire_event_id, :full_name, :work_email, :employment_type, :legal_entity_id, "
             ":department_id, :location_id, :position_id, :state_code, :date_of_joining, true, "
             ":date_of_birth, :personal_address, :aadhaar_last4) "
             "ON CONFLICT (tenant_id, hire_event_id) DO NOTHING RETURNING id"),
        {"hire_event_id": hire_event_id, "full_name": full_name, "work_email": work_email,
         "employment_type": employment_type, "legal_entity_id": legal_entity_id,
         "department_id": department_id, "location_id": location_id, "position_id": position_id,
         "state_code": state_code, "date_of_joining": date_of_joining, "date_of_birth": date_of_birth,
         "personal_address": personal_address, "aadhaar_last4": aadhaar_last4},
    ).scalar_one_or_none()
    if row is not None:
        emit_event(conn, "employee.hired", "employee", row, {"hire_event_id": hire_event_id})
        return row
    return conn.execute(text("SELECT id FROM employee WHERE hire_event_id = :h"),
                        {"h": hire_event_id}).scalar_one()


def open_employment_record(conn: Connection, *, employee_id: UUID, effective_from: date,
                           job_profile_id: UUID, fte: Decimal, ctc_annual: Decimal,
                           basic_da_monthly: Decimal, tax_regime_election: str, flsa_status: str,
                           comp_band_id: UUID | None = None, wage_floor_compliant: bool = True,
                           other_allowances: dict | None = None) -> UUID:
    """Open the first (or a later) effective-dated employment_record for an employee. Idempotent
    on (employee_id, effective_from): re-running with the same date returns the existing row."""
    row = conn.execute(
        text("INSERT INTO employment_record (employee_id, effective_from, job_profile_id, comp_band_id, "
             "fte, ctc_annual, basic_da_monthly, other_allowances_json, wage_floor_compliant, "
             "tax_regime_election, flsa_status) "
             "VALUES (:employee_id, :effective_from, :job_profile_id, :comp_band_id, :fte, :ctc_annual, "
             ":basic_da_monthly, CAST(:other_allowances AS jsonb), :wage_floor_compliant, "
             ":tax_regime_election, :flsa_status) "
             "ON CONFLICT (tenant_id, employee_id, effective_from) DO NOTHING RETURNING id"),
        {"employee_id": employee_id, "effective_from": effective_from, "job_profile_id": job_profile_id,
         "comp_band_id": comp_band_id, "fte": fte, "ctc_annual": ctc_annual,
         "basic_da_monthly": basic_da_monthly, "other_allowances": json.dumps(other_allowances or {}),
         "wage_floor_compliant": wage_floor_compliant, "tax_regime_election": tax_regime_election,
         "flsa_status": flsa_status},
    ).scalar_one_or_none()
    if row is not None:
        emit_event(conn, "employment_record.opened", "employment_record", row,
                   {"employee_id": str(employee_id)})
        return row
    return conn.execute(
        text("SELECT id FROM employment_record WHERE employee_id = :e AND effective_from = :f"),
        {"e": employee_id, "f": effective_from}).scalar_one()


def handle_employee_record_writer(conn: Connection, job: Job) -> dict:
    """Queue handler for kind 'employee_record_writer' (queue 'hr', role agent_hr). Expects the
    hire_employee()/open_employment_record() keyword arguments nested under job.payload["data"]:
    {"employee": {...}, "employment_record": {...}}. The generated hire-flow skeleton does not
    yet carry this payload on its own (see daydor.workflow.definitions); callers that enqueue
    this job directly must supply it."""
    data = job.payload.get("data", {})
    employee_id = hire_employee(conn, **data["employee"])
    open_employment_record(conn, employee_id=employee_id, **data["employment_record"])
    return {"employee_id": str(employee_id)}
