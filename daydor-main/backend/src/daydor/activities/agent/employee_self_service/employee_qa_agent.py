"""employee_qa_agent activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output. Never writes: unlike every other
agent-tier worker in this domain, this one has no downstream apply/confirm
step at all - it only answers.
Trigger: an employee asks a free-text question on the Employee Self-Service
Portal's chat surface.

Answers a free-text question about the employee's own pay, leave,
attendance, or documents by calling `employee_payslip_reader`,
`employee_leave_balance_reader`, `employee_attendance_reader`, and
`employee_document_reader` - never querying Payroll/Leave & Attendance/
Document Vault data directly itself. Refuses any question that names or
implies a colleague (asking about another employee's pay, leave, or
anything else), using the frontend design system's established refusal
copy verbatim (`frontend/design-system/reference/previews/Phone.html`):
"I can only help with your own pay, leave and documents. For anything
about a colleague, please ask your HR contact." Must be called only with
an `employee_id` that `self_service_scope_guard` has already cleared for
the active session - this worker does not re-check scope itself, and never
accepts a colleague's name or employee_id as a parameter to broaden its
own query scope.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

REFUSAL_MESSAGE = (
    "I can only help with your own pay, leave and documents. For anything "
    "about a colleague, please ask your HR contact."
)


@dataclass
class EmployeeQaQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""
    question_text: str


@activity.defn
async def answer_employee_question(query: EmployeeQaQuery) -> str:
    """Answer `query.question_text` using only
    `employee_payslip_reader`/`employee_leave_balance_reader`/
    `employee_attendance_reader`/`employee_document_reader` results scoped
    to `query.employee_id`. Returns `REFUSAL_MESSAGE` verbatim - never a
    paraphrase - for any question that names or implies a colleague rather
    than the caller themselves. Never writes to any model and never calls
    `profile_update_drafter`, `profile_field_writer`,
    `bank_detail_change_drafter`, or `bank_detail_verification_gate`."""
    raise NotImplementedError
