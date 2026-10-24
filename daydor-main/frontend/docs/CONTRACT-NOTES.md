# Contract notes (types not changed; recorded for the backend/product)

1. Two different `FilingRecord` types: `types/payroll.ts` (snake_case: legal_entity_id, scheme, period, filed_on, acknowledgement_no) and `types/compliance.ts` (camelCase, with id, authority, amount, dueDate, status). Same name, different shape and casing. Schema generation is per top-level type so both work, but the names collide in any shared namespace.
2. Mixed casing: hiring and payroll use snake_case (mirroring Daydor-Build), most other types use camelCase (`payslipsByRunId`/`employerContributions` inside snake_case payroll types). The API must emit each exactly as typed.
3. Benefits (`BenefitsData`) exposes per-employee elections, dependents (with dates of birth) and employee costs. A founder may not be entitled to read this; access/redaction policy is undecided and the type has no field to signal redaction.
4. `HiringData` is not an API shape; it is assembled client-side from the list and one detail request per requisition (N+1 requests).
5. `Decision` (home.ts, reused by leave.ts) has no approval-id field; the HTTP sources and screens assume `Decision.id` is the approval request id for `POST /approvals/{id}/resolve`. If not, a field is needed. Expense claims use `approvalRequest.id`; payroll uses `approval_request_id`; hiring offers use `offer.approval.id`.
6. `DecisionCard` "Review" button has no matching decision value (`approved|rejected` only); it currently sends `rejected`. A `needs_changes`/ask value may be wanted.
7. No TS type exists for the `POST /hire/start` body; the minimal body `{job_title, department_id?, hiring_manager_id?, target_start_date?}` is invented (`HireStartInput` in `src/data/actions.ts`). The Open-a-role UI is only a button; the title comes from `window.prompt`.
8. Expense category: UI uses `ExpenseCategoryCode`; `POST /expenses` takes `category` (sent as that code). The claim dialog has hard-coded amount 1180 and no receipt upload, so `receipt_document_id` is never sent.
9. Notification preference keys: `NotificationPreference.key` is sent as `kind`; channel `inApp` maps to `in_app`.
10. `PersonDetail.monthlyCtc`, `PersonProfileField.tier` ('gated') imply role-based field redaction that the type does not model.
11. Optional fields in types (e.g. `FilingRecord.filedOn?`) produce schemas where the key may be absent; `null` is not accepted. Backends must omit rather than send `null` unless the type says `| null`.
12. Schema generation worked with the type checker on (TypeScript ~7.0.2); `--no-type-check` was not needed (`node scripts/gen-schemas.mjs --no-type-check` is available as a fallback).
13. Screens still hard-code "Acme Labs" / "Abhijeet Singh" in the sidebar and header text; none of that comes from the API.
