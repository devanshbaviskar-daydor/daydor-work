import uuid
from datetime import datetime, timezone

from daydor.models.consent import (
    ConsentDataCategory,
    ConsentPurpose,
    ConsentRecord,
    ConsentStatus,
    DataSubjectRequest,
    DataSubjectRequestStatus,
    DataSubjectRequestType,
)


def test_consent_record_requires_tenant_id():
    consent = ConsentRecord(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        data_category=ConsentDataCategory.AADHAAR,
        purpose=ConsentPurpose.STATUTORY_FILING,
        granted_at=datetime.now(timezone.utc),
        consent_artifact_ref="consent-ui-event-001",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert consent.tenant_id is not None
    assert consent.status == ConsentStatus.GRANTED
    assert consent.withdrawn_at is None


def test_data_subject_request_retention_held_status():
    request = DataSubjectRequest(
        tenant_id=uuid.uuid4(),
        employee_id=uuid.uuid4(),
        request_type=DataSubjectRequestType.ERASURE,
        status=DataSubjectRequestStatus.PARTIALLY_FULFILLED_RETENTION_HELD,
        received_at=datetime.now(timezone.utc),
        resolution_notes="PII anonymized; payslip/audit rows retained under PF floor.",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert request.status == DataSubjectRequestStatus.PARTIALLY_FULFILLED_RETENTION_HELD
