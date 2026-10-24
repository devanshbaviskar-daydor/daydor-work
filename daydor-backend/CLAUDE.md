# Working on daydor-backend

Context for Claude Code. Read `docs/backend-plan.md`, `docs/model-findings.md` and `docs/adr/` first.

## Setup
- Postgres 16 with a superuser `daydor_owner` (password `dev`) and databases `daydor_dev`, `daydor_test`.
- `pip install -e ".[dev]"`, then `alembic upgrade head` and `pytest`. Tests recreate `daydor_test` each run.

## Rules that must not be broken
1. **The model is the source of truth.** Never hand-edit `migrations/sql/0002_*`, `0003_*`,
   `0007_*` or `0010_*`: they are generated. Change `model/` (or the generators), regenerate, and add a
   new migration. `tests/test_model_drift.py` fails on any mismatch.
   - Tables, RLS, grants: `python -m daydor.model.ddl migrations/sql`
   - Gates: `python -m daydor.gates.registry`
   - Workflows: `python -m daydor.workflow.definitions`
2. **Migrations are forward-only.** Never edit an applied migration; add a new one (see 0008).
3. **Hard human gates stay human.** Agents must never be able to resolve an approval. Jev runs only on
   soft gates, fails closed, starts in shadow mode, and never receives C3/C4 or encrypted columns.
4. **Enforce in the database.** Tenant isolation, column access, maker-checker and guarded writes live in
   Postgres. Application checks are extra, never the only check.
5. **Everything is idempotent.** Queue delivery is at-least-once. Every handler and command takes an
   idempotency key or event id.
6. **Every function in `app` is opt-in.** New functions need explicit `GRANT EXECUTE`;
   `test_no_app_function_is_executable_by_public` enforces this.
7. **Roles:** business objects are owned by `daydor_schema_owner` (non-superuser, subject to FORCE RLS).
   Only functions that must see a whole tenant are owned by `daydor_system` (BYPASSRLS), and they must
   filter by tenant explicitly.

## Where things are
- Session context: `src/daydor/db/session.py` (`tenant_session`)
- Queue / outbox / timers: `src/daydor/queue/`, SQL in `migrations/sql/0005_queue.sql`
- Gates: `src/daydor/gates/` (hard, soft, Jev client), SQL in `0006_gates.sql`
- Privacy: `src/daydor/privacy/pii.py` (`encrypt_pii`/`decrypt_pii`), SQL in `0011_privacy.sql`
- Hire flow: `src/daydor/hire/` (`employee_record.py`, `requisition.py`, `approvals.py`, `posting.py`,
  `screening.py`, `interview.py`, `offer.py`, `workflow.py`), SQL in `0012_hire.sql`,
  `0013_platform_gates.sql`, `0014_hire_workflow.sql`, `0015_hire_workflow_v3.sql`
- Adapters (external vendors, mocked until wired for real): `src/daydor/adapters/`
- Agentic worker harness (placeholder, not wired in yet): `src/daydor/agents/`
- Sprint plan and status: `docs/sprint-plan.md`
- Workflows: `src/daydor/workflow/`, SQL in `0009_workflow.sql`
- Test org fixture: `tests/conftest.py` (two tenants, a five-person reporting tree, approver users)
