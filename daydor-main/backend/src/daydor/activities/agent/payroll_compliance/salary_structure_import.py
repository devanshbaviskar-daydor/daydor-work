"""salary_structure_import activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: ops uploads a salary-structure spreadsheet during onboarding or a
compensation change, in place of manual spreadsheet entry.

Parses a messy uploaded salary-structure spreadsheet (CTC breakup) into
structured EmploymentRecord fields for ops confirmation. Also validates the
draft against the Labour Codes 50%-of-CTC wage floor and sets
wage_floor_compliant. Read-only: it drafts the structure, it never writes
the EmploymentRecord itself - the confirmed draft is what the founder
sign-off wage-structure-change gate approves.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity


@dataclass
class DraftEmploymentRecord:
    tenant_id: uuid.UUID
    employee_id: uuid.UUID
    ctc_annual: Decimal
    basic_da_monthly: Decimal
    other_allowances_json: dict
    wage_floor_compliant: bool


@activity.defn
async def import_salary_structure(tenant_id: uuid.UUID, employee_id: uuid.UUID, document_id: uuid.UUID) -> DraftEmploymentRecord:
    """Draft EmploymentRecord fields from an uploaded salary-structure spreadsheet."""
    raise NotImplementedError
