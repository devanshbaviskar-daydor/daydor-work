"""Document model: the vault.

Distinguishes statutory filing evidence (long, legally-mandated retention)
from operational documents (offer letters, ID proofs) with their own,
shorter or consent-bound retention.
"""

from __future__ import annotations

import uuid
from enum import Enum

from daydor.models.base import TenantScopedModel


class DocumentSubjectType(str, Enum):
    EMPLOYEE = "employee"
    TENANT = "tenant"
    FILING = "filing"


class DocumentClass(str, Enum):
    STATUTORY_FILING = "statutory_filing"
    ID_PROOF = "id_proof"
    OFFER_LETTER = "offer_letter"
    POLICY_ACK = "policy_ack"
    EXPENSE_RECEIPT = "expense_receipt"
    OTHER = "other"


class Document(TenantScopedModel):
    """One vault entry. `subject_id` is polymorphic, resolved by `subject_type`."""

    subject_type: DocumentSubjectType
    subject_id: uuid.UUID
    document_class: DocumentClass
    storage_ref: str
    retention_class: str
