import uuid

from daydor.models.tenant import Tenant, TenantStatus


def test_tenant_has_required_fields():
    tenant = Tenant(
        legal_name="Acme Pvt Ltd",
        cin="U12345MH2020PTC000001",
        primary_state_code="MH",
        data_residency_region="IN",
    )
    assert tenant.status == TenantStatus.ONBOARDING
    assert tenant.founder_user_id is None


def test_tenant_founder_user_id_optional_fk():
    tenant = Tenant(
        legal_name="Acme Pvt Ltd",
        cin="U12345MH2020PTC000001",
        primary_state_code="MH",
        founder_user_id=uuid.uuid4(),
        status=TenantStatus.ACTIVE,
    )
    assert tenant.founder_user_id is not None
