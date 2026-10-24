from datetime import datetime, timezone

import pytest

from daydor.archival.cold_storage import AgedPartition, ColdStoragePipeline


async def test_find_aged_partitions_not_implemented():
    pipeline = ColdStoragePipeline()
    with pytest.raises(NotImplementedError):
        await pipeline.find_aged_partitions(before=datetime.now(timezone.utc))


async def test_export_and_verify_not_implemented():
    pipeline = ColdStoragePipeline()
    partition = AgedPartition(
        source_table="audit_log",
        partition_name="audit_log_2025_01",
        tenant_id="tenant-1",
        period_start=datetime(2025, 1, 1, tzinfo=timezone.utc),
        period_end=datetime(2025, 2, 1, tzinfo=timezone.utc),
    )
    with pytest.raises(NotImplementedError):
        await pipeline.export_and_verify(partition)


async def test_drop_if_retention_expired_not_implemented():
    pipeline = ColdStoragePipeline()
    partition = AgedPartition(
        source_table="audit_log",
        partition_name="audit_log_2025_01",
        tenant_id="tenant-1",
        period_start=datetime(2025, 1, 1, tzinfo=timezone.utc),
        period_end=datetime(2025, 2, 1, tzinfo=timezone.utc),
    )
    with pytest.raises(NotImplementedError):
        await pipeline.drop_if_retention_expired(partition)
