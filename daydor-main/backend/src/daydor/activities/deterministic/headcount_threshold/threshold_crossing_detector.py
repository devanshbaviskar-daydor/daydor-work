"""threshold_crossing_detector activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: after headcount_counter reports a new count.

Compares a tenant's current headcount against the fixed statutory thresholds
(10 for ESI/Gratuity/POSH, 20 for EPF) and reports which, if any, were newly
crossed. A fixed-rule comparison - no LLM involvement needed.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import StatutoryScheme


@dataclass
class ThresholdCrossing:
    scheme: StatutoryScheme
    threshold_headcount: int
    current_headcount: int


@activity.defn
async def detect_threshold_crossings(
    tenant_id: uuid.UUID, previous_headcount: int, current_headcount: int
) -> list[ThresholdCrossing]:
    """Return any statutory thresholds newly crossed between two headcounts."""
    raise NotImplementedError
