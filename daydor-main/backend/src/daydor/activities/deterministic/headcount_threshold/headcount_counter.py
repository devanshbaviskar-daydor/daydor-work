"""headcount_counter activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: scheduled headcount recheck, and employee hire/exit events.

Counts active employees for a tenant from Core HR data. Pure arithmetic over
already-fetched records - no judgment calls, so it belongs in the
deterministic tier rather than the agent tier.
"""

from __future__ import annotations

import uuid

from temporalio import activity


@activity.defn
async def count_active_headcount(tenant_id: uuid.UUID) -> int:
    """Return the current count of active employees for a tenant."""
    raise NotImplementedError
