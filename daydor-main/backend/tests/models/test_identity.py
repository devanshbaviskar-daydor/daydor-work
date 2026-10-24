import uuid

from daydor.models.identity import User, UserRole


def test_daydor_ops_user_has_nullable_tenant_id():
    user = User(email="ops@daydor.com", role=UserRole.DAYDOR_OPS)
    assert user.tenant_id is None
    assert user.employee_id is None


def test_founder_user_scoped_to_tenant_and_employee():
    user = User(
        tenant_id=uuid.uuid4(),
        email="founder@acme.com",
        role=UserRole.FOUNDER,
        employee_id=uuid.uuid4(),
    )
    assert user.tenant_id is not None
    assert user.employee_id is not None
