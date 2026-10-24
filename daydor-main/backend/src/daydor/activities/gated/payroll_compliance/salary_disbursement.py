"""salary_disbursement activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: founder approval of a computed payroll run.

Initiates the actual bank transfer of net pay to employees for one payroll
run. Money movement is irreversible, so it runs only after the approval
gate, is idempotency-keyed against double-initiation, and is never
automatically retried on failure.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class DisbursementRequest:
    tenant_id: uuid.UUID
    payroll_run_id: uuid.UUID
    idempotency_key: str


@activity.defn
async def disburse_salaries(request: DisbursementRequest) -> None:
    """Initiate salary disbursement for one payroll run. No automatic retry."""
    raise NotImplementedError
