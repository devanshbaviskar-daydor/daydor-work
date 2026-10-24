from datetime import datetime, timezone

import pytest

from daydor.archival.pipeline import ArchivalPipeline, ArchivalTarget


async def test_find_expiring_histories_not_implemented():
    pipeline = ArchivalPipeline()
    with pytest.raises(NotImplementedError):
        await pipeline.find_expiring_histories(before=datetime.now(timezone.utc))


async def test_export_not_implemented():
    pipeline = ArchivalPipeline()
    target = ArchivalTarget(
        workflow_id="wf-1", run_id="run-1", tenant_id="tenant-1", completed_at=datetime.now(timezone.utc)
    )
    with pytest.raises(NotImplementedError):
        await pipeline.export(target)
