"""offer_band_gate activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: founder (or, on timeout, the configured fallback approver)
resolves the `ApprovalRequest` opened for an out-of-band `Offer` flagged by
`offer_band_validator`.

Applies a resolved founder approval/rejection decision to an out-of-band
`Offer`: sets `status` to `approved` or `rejected`. A compensation-
governance decision with real budget/pay-equity consequences, so the
approver is the founder (`ApproverRole.FOUNDER`), not ops. No response
escalates to a fallback approver after 24-48 hours (captain decision,
2026-10-20 - a v1 default, not the universal 1-hour pattern). Gate
escalation timing across all domains is intended to become per-tenant/
per-client configurable in a future release; this figure is that system's
v1 default value, not a permanent hardcode.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.recruitment_ats import Offer, OfferStatus


@dataclass
class OfferBandGateDecision:
    tenant_id: uuid.UUID
    offer_id: uuid.UUID
    approval_request_id: uuid.UUID
    decision: OfferStatus
    idempotency_key: str


@activity.defn
async def apply_offer_band_decision(decision: OfferBandGateDecision) -> Offer:
    """Apply a resolved founder (or fallback-approver) decision to the
    `Offer` named by `decision.offer_id`, setting its status to
    `decision.decision` (`approved` or `rejected`). Idempotency-keyed
    against a retried approval signal; no automatic retry on failure."""
    raise NotImplementedError
