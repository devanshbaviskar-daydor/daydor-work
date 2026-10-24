"""Stub client for the document vault MCP server. No real transport wired yet."""

from __future__ import annotations

import uuid

from daydor.mcp.circuit_breaker import CircuitBreaker

INTEGRATION_NAME = "document_vault"


class DocumentVaultClient:
    """Storage and retrieval of compliance-sensitive documents.

    Every call routes through `self._breaker` (this integration's
    `CircuitBreaker`) so a flapping document-vault MCP server trips once
    rather than once per in-flight caller.
    """

    def __init__(self, breaker: CircuitBreaker):
        self._breaker = breaker

    async def store_document(self, tenant_id: uuid.UUID, document_bytes: bytes, metadata: dict) -> uuid.UUID:
        """Store a document and return its vault-assigned id."""
        return await self._breaker.call(lambda: self._store_document(tenant_id, document_bytes, metadata))

    async def _store_document(self, tenant_id: uuid.UUID, document_bytes: bytes, metadata: dict) -> uuid.UUID:
        raise NotImplementedError

    async def fetch_document(self, tenant_id: uuid.UUID, document_id: uuid.UUID) -> bytes:
        """Fetch a stored document by id."""
        return await self._breaker.call(lambda: self._fetch_document(tenant_id, document_id))

    async def _fetch_document(self, tenant_id: uuid.UUID, document_id: uuid.UUID) -> bytes:
        raise NotImplementedError
