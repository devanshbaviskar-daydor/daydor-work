import uuid
from datetime import datetime, timezone

from daydor.models.audit import AuditActorKind, AuditLogEntry


def test_audit_log_entry_has_no_updated_at():
    entry = AuditLogEntry(
        tenant_id=uuid.uuid4(),
        created_at=datetime.now(timezone.utc),
        actor_kind=AuditActorKind.DETERMINISTIC_WORKER,
        event_type="employee.pan_updated",
        subject_table="employee",
        subject_id=uuid.uuid4(),
        occurred_at=datetime.now(timezone.utc),
    )
    assert entry.actor_user_id is None
    assert not hasattr(entry, "updated_at")
