"""employee_document_reader activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: an employee opens the Documents screen on the Employee
Self-Service Portal, or `employee_qa_agent` asks a document question on
their behalf.

Pure read over the already-merged Document Vault's `Document` table,
scoped to the caller's own `employee_id` as `subject_id` (with
`subject_type=EMPLOYEE`). No new data model: this worker reads existing
vault entries, it does not write or derive anything. Must be called only
with an `employee_id` that `self_service_scope_guard` has already cleared
for the active session - this worker does not re-check scope itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.document import Document


@dataclass
class EmployeeDocumentQuery:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    """Must already be scope-checked by `self_service_scope_guard` against
    the active session before this worker is called."""


@activity.defn
async def read_employee_documents(query: EmployeeDocumentQuery) -> list[Document]:
    """Return every `Document` row with `subject_type=EMPLOYEE` and
    `subject_id=query.employee_id`. Read-only: never mutates a `Document`,
    and never reads a document belonging to another subject - callers must
    pass an `employee_id` already cleared by `self_service_scope_guard`.
    Excludes nothing by `document_class`: tenant- or filing-scoped
    documents are never returned since they never match this `subject_id`
    filter in the first place."""
    raise NotImplementedError
