# Data sources

Every screen gets its data from an interface in `src/data/*Source.ts`. Two implementations exist per interface:
`Mock*Source` (in-memory, used for tests and default dev) and `Http*Source` (`src/data/http/`).
`src/data/sources.ts` (`createSources(kind)` / the `sources` singleton) picks one; `src/router.tsx` uses it.

## Switching

| Env var | Values | Default |
|---|---|---|
| `VITE_DATA_SOURCE` | `mock` \| `http` | `mock` |
| `VITE_API_URL` | API base URL | `/api` |
| `VITE_API_TOKEN` | bearer token fallback | none |

Token lookup: `localStorage['daydor.token']`, else `VITE_API_TOKEN`. Example: `VITE_DATA_SOURCE=http VITE_API_URL=http://127.0.0.1:8000/api npm run dev`.

`src/data/http/httpClient.ts` sends `Authorization: Bearer`, JSON bodies, an `Idempotency-Key` (uuid) on POSTs, and throws
`ApiError {status, code, message}` parsed from `{error:{code,message}}` or `{detail}`. `configure({baseUrl, token})` overrides env (used by the smoke script under Node).
HTTP sources never transform response keys: the API returns exactly the TS types in `src/types`.

## Read endpoints

| Method | Path | Returns |
|---|---|---|
| getHome | GET /views/home | HomeData |
| getLeave | GET /views/leave | LeaveData |
| getHiring | GET /hire/requisitions, then GET /hire/requisitions/{id} per item | `{requisitions}` + `RequisitionDetail` assembled into HiringData |
| getPayroll | GET /views/payroll | PayrollData |
| getCompliance | GET /views/compliance | ComplianceData |
| getExpenses | GET /views/expenses | ExpensesData |
| getBenefits | GET /views/benefits | BenefitsData |
| getPeople | GET /views/people | PeopleData |
| getPerson(id) | GET /views/people/{id} (404 -> `null`) | PersonDetail |
| getDocuments | GET /views/documents | DocumentsData |
| getSettings | GET /views/settings | SettingsData |

## Action methods (new members of the Source interfaces; mocks resolve and record nothing)

| Method (sources) | Request | UI hook |
|---|---|---|
| `resolveApproval(approvalId, 'approved'\|'rejected', note?)` (Home, Leave, Expenses, Hiring, Payroll) | POST /approvals/{id}/resolve `{decision, note?}` | DecisionCard approve / review buttons (Leave, Expenses, Hiring out-of-band offer); Payroll "Approve & release" (uses `run.approval_request_id`). Review currently sends `rejected`. Home has only compact cards (no buttons) so the method is unused there. |
| `submitLeaveRequest(input)` (Leave) | POST /leave-requests `{leave_policy_id,start_date,end_date,reason}` | no button exists yet |
| `submitExpense(input)` (Expenses) | POST /expenses `{amount,category,receipt_document_id?}` | "Claim an expense" submit |
| `createPayrollRun(input)` (Payroll) | POST /payroll/runs `{legal_entity_id,period_start,period_end,retention_class_id}` | no button exists yet |
| `updateNotificationPreference(input)` (Settings) | PUT /me/notification-preferences `{kind,email,in_app,whatsapp}` | notification checkboxes |
| `startHiring(input)` (Hiring) | POST /hire/start `{job_title, department_id?, hiring_manager_id?, target_start_date?}` | "Open a role" (asks for a title via `window.prompt`) |

After a successful action the screen refetches. Input types live in `src/data/actions.ts`.

## Contract schemas and smoke test

- `npm run contract:schemas` regenerates `contract/schemas/<Type>.schema.json` from `src/types` (closed objects, `additionalProperties: false`). Committed; the API tests validate against them.
- `npm run smoke` (API must be running; `SMOKE_API_URL`, default `http://127.0.0.1:8000/api`): dev-login as `rohan.mehta@acme.test`, calls every getter through the http sources, validates against the schemas, prints PASS/FAIL, exits non-zero on failure.
