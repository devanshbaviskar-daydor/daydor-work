"""registration_deadline_scheduler activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: scheduled recheck of approved-but-not-yet-submitted registrations.

Watches `deadline_at` on approved ApprovalRequest rows for this domain (the
statutory registration/filing deadline, e.g. the EPF establishment
registration window after crossing 20 employees) and reports any that need
to escalate before breach. A fixed-rule comparison against a known deadline
- no LLM involvement needed. Distinct from the one-hour approver-response
escalation pattern: this tracks the actual government filing deadline,
typically days or weeks out, not the internal approval SLA.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from temporalio import activity


@dataclass
class DeadlineEscalation:
    approval_request_id: uuid.UUID
    deadline_at: datetime


@activity.defn
async def find_deadlines_to_escalate(tenant_id: uuid.UUID) -> list[DeadlineEscalation]:
    """Return approved registrations whose statutory deadline needs escalation before breach."""
    raise NotImplementedError
