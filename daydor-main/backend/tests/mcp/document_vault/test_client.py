import datetime
import uuid

import pytest

from daydor.mcp.circuit_breaker import CircuitBreaker
from daydor.mcp.document_vault.client import DocumentVaultClient
from daydor.models.integration import IntegrationCircuitBreakerState


def _breaker() -> CircuitBreaker:
    state = IntegrationCircuitBreakerState(
        integration_name="document_vault", updated_at=datetime.datetime.now(datetime.timezone.utc)
    )
    return CircuitBreaker(state)


async def test_store_document_not_implemented():
    client = DocumentVaultClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.store_document(uuid.uuid4(), b"test", {})


async def test_fetch_document_not_implemented():
    client = DocumentVaultClient(_breaker())
    with pytest.raises(NotImplementedError):
        await client.fetch_document(uuid.uuid4(), uuid.uuid4())
