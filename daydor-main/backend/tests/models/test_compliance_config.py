import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from daydor.models.compliance import (
    RETENTION_POLICIES,
    EpfRateRule,
    EsiRateRule,
    PtSlabRule,
    RetentionAnchorField,
    RetentionRecordType,
    TenantComplianceConfig,
)


def test_tenant_compliance_config_requires_tenant_id():
    config = TenantComplianceConfig(
        tenant_id=uuid.uuid4(),
        settings_json={"notify_on_threshold_crossing": True},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    assert config.tenant_id is not None


def test_pt_slab_rule_is_not_tenant_scoped():
    rule = PtSlabRule(
        state_code="KA",
        effective_from=date(2026, 2, 1),
        slab_min=Decimal("15000"),
        slab_max=Decimal("25000"),
        monthly_amount=Decimal("200"),
    )
    assert not hasattr(rule, "tenant_id")
    assert rule.effective_to is None


def test_epf_and_esi_rate_rules_not_tenant_scoped():
    epf = EpfRateRule(
        effective_from=date(2026, 1, 1),
        wage_ceiling=Decimal("15000"),
        employee_rate_percent=Decimal("12"),
        employer_rate_percent=Decimal("12"),
    )
    esi = EsiRateRule(
        effective_from=date(2026, 1, 1),
        wage_ceiling=Decimal("21000"),
        employee_rate_percent=Decimal("0.75"),
        employer_rate_percent=Decimal("3.25"),
    )
    assert not hasattr(epf, "tenant_id")
    assert not hasattr(esi, "tenant_id")


def test_retention_policies_cover_four_clocks():
    by_class = {policy.retention_class: policy for policy in RETENTION_POLICIES}

    assert by_class[RetentionRecordType.TDS].retention_years == 8
    assert by_class[RetentionRecordType.TDS].anchor_field == RetentionAnchorField.FILED_ON

    assert by_class[RetentionRecordType.PF].retention_years == 7
    assert by_class[RetentionRecordType.PF].anchor_field == RetentionAnchorField.CREATED_AT

    assert by_class[RetentionRecordType.ESI].retention_years == 5
    assert by_class[RetentionRecordType.ESI].anchor_field == RetentionAnchorField.LAST_ENTRY_DATE

    assert by_class[RetentionRecordType.GRATUITY].anchor_field == RetentionAnchorField.EMPLOYEE_DATE_OF_EXIT
