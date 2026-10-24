"""Stub interface for the workflow-history archival pipeline.

Target: export completed Temporal workflow histories for the
payroll_compliance domain to durable, India-resident storage with a 7-year
retention floor, before Temporal's own retention window expires them.

Not implemented. This is a structural placeholder for the eventual
scheduled-export job (e.g. a Temporal Schedule driving a periodic
export-and-upload activity).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ArchivalTarget:
    """One workflow history selected for archival."""

    workflow_id: str
    run_id: str
    tenant_id: str
    completed_at: datetime


class ArchivalPipeline:
    """Exports completed workflow histories to long-term, India-resident storage.

    Retention floor: 7 years from `completed_at`, for any workflow history
    touching payroll or statutory compliance.
    """

    async def find_expiring_histories(self, *, before: datetime) -> list[ArchivalTarget]:
        """Find completed histories nearing Temporal's own retention cutoff."""
        raise NotImplementedError

    async def export(self, target: ArchivalTarget) -> None:
        """Export one workflow history to long-term storage."""
        raise NotImplementedError
