"""escalation_notifier activity.

Write-class: deterministic - plain Python, no LLM, automatic retries.
Trigger: the first (notify-only) timer in ApprovalGateEscalationWorkflow
elapses with the gate still pending.

Alerts the parties relevant to an unresolved approval gate - the assigned
approver and whoever else the gate type's policy names - without changing
who may resolve it. Stamps `ApprovalRequest.notified_at` so the alert is
sent at most once per gate even if the activity is retried.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class EscalationNotice:
    tenant_id: uuid.UUID
    approval_request_id: uuid.UUID
    gate_type: str


@activity.defn
async def notify_gate_timeout(notice: EscalationNotice) -> None:
    """Alert relevant parties that an approval gate has missed its first
    timeout. Does not change gate ownership. Idempotent against retry."""
    raise NotImplementedError
