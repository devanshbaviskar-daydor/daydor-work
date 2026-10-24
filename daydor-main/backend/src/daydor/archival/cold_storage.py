"""Stub interface for Postgres cold-storage archival of retained rows.

Distinct from `pipeline.py`'s Temporal workflow-history export: this
targets Postgres table rows (audit_log, payroll_run, payslip, and similar
time-series-heavy tables) that have aged out of their "hot" partition but
are still inside their statutory retention floor (see
`daydor.models.compliance.RetentionPolicy`).

Captain-confirmed design (Data Model Design §5.3): cold storage is a
separate table set within the same Postgres instance, not a physically
separate database. Mechanism: pg_partman-managed range partitioning
(by month) plus a detach-export-verify-drop sequence - drop only after
the retention floor for that partition's rows has actually expired, and
only after the verified-export step.

Not implemented. This is a structural placeholder for the eventual
scheduled partition-maintenance job.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class AgedPartition:
    """One source-table partition that has left the hot window."""

    source_table: str
    partition_name: str
    tenant_id: str
    period_start: datetime
    period_end: datetime


class ColdStoragePipeline:
    """Moves aged-out partitions into same-instance cold-storage tables.

    Never drops a partition without a verified export first, and never
    drops one whose rows are still inside their statutory retention floor.
    """

    async def find_aged_partitions(self, *, before: datetime) -> list[AgedPartition]:
        """Find partitions old enough to leave the hot, routinely-queried window."""
        raise NotImplementedError

    async def export_and_verify(self, partition: AgedPartition) -> bool:
        """Detach a partition, export it to its cold-storage table, and verify row counts."""
        raise NotImplementedError

    async def drop_if_retention_expired(self, partition: AgedPartition) -> bool:
        """Drop a verified-exported partition, but only once its retention floor has expired."""
        raise NotImplementedError
