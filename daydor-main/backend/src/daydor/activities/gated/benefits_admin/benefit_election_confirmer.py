"""benefit_election_confirmer activity.

Write-class: gated irreversible - separate Temporal activity after a
human-approval Temporal signal, idempotency-keyed, no automatic retry.
Trigger: Daydor ops approval of a drafted, window-validated, cost-calculated
`BenefitElection`.

Finalizes a `BenefitElection` onto the insurer's covered-lives roster -
daydor does internal tracking only for v1 (no API integration), so
"finalize" means recording the election as `status=active` with its
`effective_from` set, the record ops relies on when separately notifying the
broker/insurer. A commercial commitment with real reversal cost (removing a
life from an insurer's roster is not a clean undo) - requires the approval
gate and an idempotency key, with no automatic retry on failure.

Approval gate: `ApproverRole.DAYDOR_OPS`, not the founder - a routine,
already-authorized-pattern execution of a plan the founder already approved
via `benefit_plan_configurator`. Escalates to a Daydor-side fallback approver
after 1 hour of no response, matching the universal pattern for routine,
bounded, already-pattern-approved actions.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from temporalio import activity

from daydor.models.benefits import BenefitElection


@dataclass
class ElectionConfirmation:
    tenant_id: uuid.UUID
    benefit_election_id: uuid.UUID
    approval_request_id: uuid.UUID
    idempotency_key: str


@activity.defn
async def confirm_benefit_election(confirmation: ElectionConfirmation) -> BenefitElection:
    """Set the `BenefitElection` named by `confirmation.benefit_election_id`
    to `status=active` after Daydor ops approval. No automatic retry.
    Idempotency-keyed against a retried approval signal."""
    raise NotImplementedError
