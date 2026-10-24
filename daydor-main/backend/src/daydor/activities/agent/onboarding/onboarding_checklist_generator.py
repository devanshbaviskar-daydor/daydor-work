"""onboarding_checklist_generator activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: after employee_record_creator creates the Core HR record.

Drafts the ops team's onboarding checklist for a new hire (documents to
collect, salary structure to confirm, induction steps) for review. Read-only:
it drafts the checklist, it does not perform any of the listed steps.

Reads the tenant's `TenantComplianceConfig.settings_json` to customize the
draft per tenant (which documents it collects, which statutory benefits it
offers, any tenant-specific induction steps) rather than drafting a fixed
checklist for every tenant - see `onboarding/prompt.md`'s "tenant's
configured onboarding policy" input, which this wires up to a concrete
source for the first time.

Must surface Aadhaar/PAN/bank-detail collection items distinctly so ops
doesn't present them as ordinary checklist items. The DPDP consent gate
itself (state and trigger logic) is owned solely by the standalone
consent_gate_trigger worker (deterministic/onboarding) - this worker never
triggers that gate, only drafts the list.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import TenantComplianceConfig


@dataclass
class OnboardingChecklistItem:
    description: str


@activity.defn
async def generate_onboarding_checklist(
    tenant_id: uuid.UUID, employee_id: uuid.UUID, compliance_config: TenantComplianceConfig
) -> list[OnboardingChecklistItem]:
    """Draft the onboarding checklist for a new hire, customized by the
    tenant's `TenantComplianceConfig.settings_json` onboarding policy
    (documents collected, statutory benefits offered, induction steps)."""
    raise NotImplementedError
