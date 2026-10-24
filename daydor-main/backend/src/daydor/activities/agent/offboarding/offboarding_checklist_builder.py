"""offboarding_checklist_builder activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: exit event raised for an employee (date_of_exit recorded).

Drafts the ops team's exit checklist for a departing employee (access
removal across systems, asset return, exit interview, final settlement
sign-off) for review. Read-only: it drafts the checklist, it does not
perform any of the listed steps.

Reads the tenant's `TenantComplianceConfig.settings_json` to customize the
draft per tenant (which systems/access to revoke, whether an exit interview
or final-settlement sign-off step applies) rather than drafting a fixed
checklist for every tenant - see `offboarding/prompt.md`'s "tenant's
offboarding policy" input, which this wires up to a concrete source for
the first time.

Starts from `daydor.models.compliance.DEFAULT_OFFBOARDING_TASKS`, an
India-researched default catalog (IT asset return/access revocation, exit
interview, F&F settlement, statutory exit documentation), and narrows it to
what the tenant's policy and this employee's actual access/assets apply -
it is a starting default, never a fixed checklist issued unfiltered.

This worker only drafts the access-revocation instruction; it never revokes
access itself (agent-tier workers are read-only by construction - see the
write-class tier framework). `activities/gated/offboarding/` has no
revocation-executing activity yet - whichever worker is later built to
actually perform revocation is the one that needs the irreversible
write-class tier, since revoking access is hard to undo cleanly; that
worker doesn't exist in this codebase yet, so it isn't tiered here.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.compliance import TenantComplianceConfig


@dataclass
class OffboardingChecklistItem:
    description: str


@activity.defn
async def build_offboarding_checklist(
    tenant_id: uuid.UUID, employee_id: uuid.UUID, compliance_config: TenantComplianceConfig
) -> list[OffboardingChecklistItem]:
    """Draft the exit checklist for a departing employee, customized by the
    tenant's `TenantComplianceConfig.settings_json` offboarding policy
    (access/systems to revoke, exit interview and final-settlement steps)."""
    raise NotImplementedError
