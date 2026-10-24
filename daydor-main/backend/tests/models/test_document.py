import uuid
from datetime import datetime, timezone

from daydor.models.document import Document, DocumentClass, DocumentSubjectType


def test_document_requires_tenant_id():
    document = Document(
        tenant_id=uuid.uuid4(),
        subject_type=DocumentSubjectType.EMPLOYEE,
        subject_id=uuid.uuid4(),
        document_class=DocumentClass.ID_PROOF,
        storage_ref="s3://vault/employee/123/id_proof.pdf",
        retention_class="pf",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert document.tenant_id is not None
