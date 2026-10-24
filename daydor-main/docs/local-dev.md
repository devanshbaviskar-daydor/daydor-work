# Local development setup

## Postgres

Start a local Postgres with Docker Compose:

```
docker compose up -d postgres
```

Connects on `localhost:5432`, database `daydor`, user/password `daydor`/`daydor`.
This is a local-only placeholder; no secrets belong in `docker-compose.yml`.

## Temporal Cloud (India region)

Daydor does not run a local Temporal dev server for payroll/compliance work,
because the data-residency requirement (no Aadhaar/PAN/bank payload leaving
India) applies from local development onward. Development connects directly
to a Temporal Cloud namespace provisioned in an India region:

- **Primary region:** Mumbai (`ap-south-1`)
- **Standby region:** Hyderabad (`ap-south-2`), for multi-region failover

This is a documentation placeholder only - no Temporal Cloud namespace has
been provisioned yet. When one exists, local development will need:

- `TEMPORAL_ADDRESS` - the namespace's gRPC endpoint (`<namespace>.<account>.tmprl.cloud:7233`)
- `TEMPORAL_NAMESPACE` - the namespace name
- `TEMPORAL_CLIENT_CERT` / `TEMPORAL_CLIENT_KEY` - mTLS client certificate and key for the namespace

A worker started from this repo will read those from the environment; see
`backend/src/daydor/` for where the Temporal client is constructed once that lands.

## Running tests

```
cd backend
pip install -e ".[dev]"
pytest
```
