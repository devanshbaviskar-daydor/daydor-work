"""offer_band_validator activity.

Write-class: deterministic (plain Python Temporal activity, no LLM,
automatic retries).
Trigger: a draft `Offer` is created against an `Application`.

Compares `Offer.proposed_base` against the role's (tenant-scoped) `CompBand`
effective at offer time and sets `within_band`. An out-of-band offer is not
rejected here - it is left for `offer_band_gate` to route to founder
sign-off, since an above/below-band offer can be a deliberate exception, not
necessarily an error.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from temporalio import activity

from daydor.models.recruitment_ats import Offer


@dataclass
class OfferBandValidationInput:
    tenant_id: uuid.UUID
    offer_id: uuid.UUID
    comp_band_id: uuid.UUID
    proposed_base: Decimal


@activity.defn
async def validate_offer_band(request: OfferBandValidationInput) -> Offer:
    """Compare `request.proposed_base` against the `CompBand` named by
    `request.comp_band_id` effective at offer time, and set the `Offer`
    named by `request.offer_id`'s `within_band` field accordingly. Never
    changes `Offer.status` itself - that is `offer_band_gate`'s job for an
    out-of-band result."""
    raise NotImplementedError
