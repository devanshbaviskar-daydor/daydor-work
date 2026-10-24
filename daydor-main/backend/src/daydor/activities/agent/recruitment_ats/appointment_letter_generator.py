"""appointment_letter_generator activity.

Write-class: agent (read-only/draft) - Temporal activity wrapping a short
LangGraph run, schema-checked output.
Trigger: an `Offer` reaches `accepted`.

Drafts the mandatory appointment letter content (designation, job category,
principal place of employment, wage break-up, social security entitlements)
for founder/ops review before issuance - a new worker with no counterpart in
the co-founder's repo, required since 21 Nov 2025 under the Industrial
Relations Code and OSH Central Rules 2026 (Domain 5.1). Never issues the
letter itself: issuance is a human action that sets `issued_at` once the
draft is reviewed. Delivery to and acceptance by the candidate is a
separate, deferred mechanism (captain decision, 2026-10-20: to be resolved
alongside the Employee Self-Service Portal's design) - this worker only
produces draft content; `issued_at`/`accepted_at` are tracked as plain
fields with no delivery integration here.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity


@dataclass
class AppointmentLetterDraftInput:
    tenant_id: uuid.UUID
    offer_id: uuid.UUID


@dataclass
class AppointmentLetterDraft:
    offer_id: uuid.UUID
    designation: str
    job_category: str
    principal_place_of_employment: str
    wage_breakup_json: dict
    social_security_entitlements_json: dict


@activity.defn
async def draft_appointment_letter(request: AppointmentLetterDraftInput) -> AppointmentLetterDraft:
    """Draft appointment-letter content for `request.offer_id` - designation,
    job category, principal place of employment, wage break-up, and social
    security entitlements - for founder/ops review. Never sets `issued_at`
    or `accepted_at` itself, and never delivers the letter to the
    candidate."""
    raise NotImplementedError
