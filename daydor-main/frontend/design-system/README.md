Daydor runs the employee lifecycle for small Indian companies with a team of AI agents — a root orchestrator, domain orchestrators (Payroll, Compliance, Onboarding, Leave…) and dozens of narrow workers. Humans don't operate HR in Daydor; they **supervise and decide**. Every screen is built for that job.

## Principles

1. **Agents do, humans decide.** The interface exists to put the right decision in front of the right person, with enough context to make it in under a minute. Everything else happens without asking.
2. **One voice.** People talk to *Daydor*. Domains appear as quiet labels ("Payroll", "Compliance"); worker agents appear only inside a Receipt. Never show the org chart by default.
3. **Outcome first, receipt on demand.** Lead with what happened and what it means. The trace — every step, source and audit ID — is one click away, never in the way.
4. **Irreversible is loud; everything else is quiet.** Money out, statutory filings and access revocation are the only things that get the `irreversible` colour and a confirmation step. Read-only work never notifies anyone.
5. **Protect attention.** The home screen never shows more than three open decisions; similar gates are batched; finished work recedes to muted text. If a founder has to scroll to find what needs them, the screen has failed.

## Surfaces

- **Founder home** (see the Home page): a `Brief` at the top, the conversation in the centre (`Message`, `Thinking`, `Composer`), and a right rail (`rail-width`) with *Needs you* (`DecisionCard` compact), *Running now* and *Done today* (`RunRow`).
- **Decision view**: opening a rail item shows the full `DecisionCard` in the conversation, with its `Receipt` beneath it. Irreversible approvals confirm in a `Dialog`.
- **Founder on a phone** (see the Phone page): the rail becomes the home list; decisions open full-width. Founders can approve everything on a phone, irreversible gates included: the confirm `Dialog` becomes a bottom sheet and the primary button requires device re-authentication (Face ID, fingerprint or PIN) — "Confirm with Face ID".
- **Employee app**: the same conversation and components, white-labelled through the `action` tokens, and **scoped to the person only**: their pay, leave, attendance, documents and their own pending confirmations (e.g. new bank details). Daydor never answers about anyone else; it says so plainly and points to the HR contact: "I can only help with your own pay, leave and documents. For anything about a colleague, please ask your HR contact." The composer has no scope picker here.
## Navigation

- **Desktop:** `Sidebar` (see components/Sidebar/README.md for the destination list) plus ⌘K. Home is where work arrives; the other pages are places to look things up and see the whole picture.
- **⌘K `CommandBar`:** ask Daydor, jump to a person or page, or start an action. Irreversible actions never run from it; they open their decision.
- **Phone:** `TabBar` with Ask as the raised centre tab — founder: Home · Decisions · Ask · People · More; employee: Home · Pay · Ask · Leave · Me.

## Domain views

Lookup pages for when a founder wants to see the whole picture; work still arrives on Home. Each page follows the same order: `PageHeader` (with the page's one decision as its primary action) → `Stepper` (where the lifecycle is) → `StatRow` (the figures, each with a comparison) → the detail, with Daydor's explanation beside it.

- **Payroll run** (PayrollRun page): stepper from attendance close to payslips; only the rows that changed, each with the reason; Daydor's summary and Receipt alongside.
- **Compliance** (Compliance page): statutory calendar grouped by month with `ObligationRow`s; needs-you and overdue rows tinted, everything else plain.
- **Onboarding** (Onboarding page): a vertical `Stepper` across domains (Talent, Core HR, Compliance, IT, Payroll), each step naming the domain doing it; problems as a `Callout` beside it.
- **Person** (Person page): `FactList` with locked sensitive fields, figures, and a `Timeline` of every agent and human action on their record.

- **Hiring** (Hiring page): one role per tab; an offer-outside-band `DecisionCard` above a `StageBoard` (Applied → Screening → Interview → Offer → Background check → Hired). Every `CandidateCard` names its one blocker, and blockers read differently by who holds them: you (warning), someone outside the company such as the candidate's background-check consent (info, clock), Daydor (live dot), handed on (success).
- **Leave & attendance** (Leave page): today's numbers, an `AttendanceGrid` for the week, and requests as **routine** DecisionCards. Insufficient balance is shown as a figure with what it means ("1 day short — the second day would be unpaid"), never as a block.
- **Expenses** (Expenses page): only claims above the manager limit (₹5,000) reach the founder; each shows its receipt through `ReceiptReview`. The batch table shows what rides on the next salary — reimbursements are paid with payroll, never separately.
- **Benefits** (Benefits page): `ChoiceCard`s for the closed set GMC, GPA and GTL, with cost split and a running cost. Nothing is bought from this page — it asks the broker for quotes. If it sits unfinished, Daydor reminds the founder after a week; it is never escalated to anyone else.

### Gate pacing

Not every human gate is urgent, and the UI must say which is which.

- **Urgent** (filings, disbursal, F&F, threshold registrations): normal DecisionCard with a `Deadline`; irreversible ones carry the lock.
- **Routine** (leave, expense claims; 24–48h to escalate): `pace: 'routine'` — no shadow, no deadline colour, a `note` that says who has it and when it escalates ("With Rohit · comes to you Thu if he hasn't decided"). They count in Home's Needs you only when they're actually the founder's.
- **External** (a candidate's background-check consent): not a decision anyone inside can make. Shown as an `external` blocker and an `awaiting-consent` badge, never as a DecisionCard; Daydor follows up.
- **Rare commitments** (benefit plan setup): live on their settings page with a weekly reminder; no deadline, no fallback approver.

## Employee self-service

Employees use the phone surface (EmployeeApp and ExpenseClaim pages), in the client's theme, and only about themselves.

- **Home:** last salary and payslip, leave left by type, my benefits (GMC/GPA/GTL coverage and any top-up deducted from pay), quick actions: Request leave, Claim an expense.
- **Leave:** asked in plain words in Ask; Daydor drafts the request (type, dates, balance after) for the employee to send, then tracks it with a vertical `Stepper` ("With Rohit, your manager").
- **Expenses:** photo → `ReceiptReview` (check what Daydor read; low-confidence fields flagged) → category and "Why was this for work?" → tracked to the salary it's paid with.
- **My details:** `ProfileField` in three tiers — change any time (address, emergency contact, tax regime), checked by HR (PAN, Aadhaar), protected (salary bank account).
- **Bank account change:** the one irreversible action an employee can take. Full-screen `VerifyCode` with an SMS code, the masked new account shown first, notice to the old number and email afterwards, and HR involvement after 3 wrong codes.
- **Questions about anyone else** get the standard refusal: "I can only help with your own pay, leave and documents. For anything about a colleague, please ask your HR contact."

### Data Daydor reads for you

When an agent drafts a value from a document or photo (receipt amount, date, vendor, GSTIN), it is shown as a draft — dashed underline, "Read from the receipt — check before you submit" — until the person confirms it. The confirmed value is the authoritative one, never the model's reading. Photos sit on `photo-ground` and are shown as taken, never restyled as documents.

## Notifications

Daydor reaches people outside the app only when a person is needed. See the Notifications page.

- **Send:** a decision that needs someone, an escalation (stuck or about to miss a statutory deadline), a failure that needs action, and the morning brief (opt-in, 9 am IST).
- **Never send:** read-only work, finished work (it goes in the brief), anything an agent will retry by itself.
- **WhatsApp** (approved Business templates): one short message per decision, opening with the bold action ("Needs you: October PF return") and the amount and deadline. Reversible decisions can be answered with quick replies (Approve / Decline / Open). **Irreversible decisions are never approved from a message**; the only button is "Review in Daydor" with the lock, which opens the app and asks for device re-auth.
- **Email:** subject `Needs you: <action> (due <date>)`; body = one heading, one paragraph of what and why, the key figures, a single primary button, the deadline, and a line on why the person got it. Sender "Daydor for <Company>".
- Quiet hours 9 pm–8 am IST, except a statutory deadline within 24 hours. Batch: at most one message per hour per person; similar decisions are grouped ("4 leave requests").
- Employees get notifications only about themselves (payslip ready, leave decided, a document to sign), in the client's branding.

## Documents

Generated documents belong to the client company and always render on light paper (`DocumentPage`, `Payslip`).

- Client letterhead and accent; Daydor only as "Prepared with daydor" in the footer.
- Money with paise and Indian grouping; net pay and CTC also in words via `amountInWords`.
- Statutory forms issued by the government (Form 16 Part A from TRACES, EPFO/ESIC challans) are attached as issued — never redesigned. Daydor adds a cover summary at most.
- Print: A4, no app chrome.

## When things go wrong

See the States page. Every failure state tells the person what happened to their data, and what happens next.

- **Inspection or audit active** → a `paused` `Banner` across the app; all writes stop until a human ends it; the rail's Running section explains the pause.
- **A run failed** → a `danger` `Callout` in the conversation: what failed, that nothing irreversible happened, when Daydor retries. Irreversible actions never retry silently.
- **Two workflows collide on one employee** → a `warning` `Callout`: which one Daydor paused, why, and the recommended resolution as the primary button.
- **A decision is stuck** (past deadline, or a delegate hasn't acted) → it moves to a *Stuck* section of the rail with an `escalation` line and "Take it back" / "Remind".
- **A statutory obligation is already late** → a `danger` `Banner` plus the decision at the top of Needs you.
- **Nothing yet / nothing now** → `EmptyState`: first run starts a setup conversation; an empty Needs you says "Nothing needs you".

## Content fundamentals

Daydor writes like a capable colleague who has already done the work: warm, brief, exact.

- Daydor speaks as **I** ("I've computed October payroll"); the reader is **you**. Domains do things in status lines: "Payroll is computing October…".
- Outcome in the first sentence, explanation in the second, nothing in the third unless asked. "Computed and waiting for you. Net pay is ₹12,48,600 — ₹38,200 more than September, almost all from Priya's revision."
- Say what was done, what needs the reader, and by when. Never "I'm just an AI", never "Great question!".
- Decision titles are imperative actions: "File the October PF return", "Release October salaries". Approve buttons name the consequence: "Approve & file".
- Delegation is one decision at a time: "Delegate" hands this card to one named person, who sees it in their own Needs you list; the founder's card collapses to "Delegated to Rohit · just now". There are no standing delegation rules.
- Every gate states *why* a human must decide, citing the law or policy: "EPF Scheme 1952: contributions due by 15 Nov."
- Failures say what happened to the person's data and what happens next: "The PT portal didn't respond. Nothing was submitted. I'll retry at 11 am."
- Sentence case everywhere. No emoji. At most one exclamation mark per screen, for a real milestone.
- Indian terms as people use them: CTC, PF, ESI, PT, TDS, UAN, ECR, F&F, Form 16, LOP.

### Numbers, money and dates

- Money with Indian grouping through `Amount` / `Daydor.formatINR()`: `₹1,25,000`. Lakh/crore (`₹12.49 L`) only in summaries, never on anything someone reconciles.
- Tabular numerals for every figure; right-aligned in tables.
- Dates `13 Oct 2026`, ranges `20–21 Oct`, periods `Oct 2026`, times `9:42 am` (IST). Relative time in the conversation ("2 min ago"), absolute in receipts and records.
- Identifiers — run IDs, audit IDs, UAN, PAN, IFSC — in `code`.

## Visual foundations

The feel is quiet and AI-native: generous whitespace, one teal, refined type, motion only where something is alive.

### Colour

- Three themes: **Light**, **Dark**, and a **White-label sample** (light with a client's colour). Every pair below is checked in each.
- Grounds: `canvas` for the conversation and brief; `surface` for anything raised (cards, composer, rail, dialogs); `surface-sunken` for the person's own message bubble, expanded receipts and hovers.
- Text: `ink`, and `ink-muted` for everything secondary. Both reach 4.5:1 on canvas, surface, surface-sunken and brand-soft in both themes.
- `brand` (Daydor teal) is the agent's colour: the Daydor avatar, the live dot, progress, "running now" counts. Not used for decoration.
- `action` is the white-label slot for primary buttons, links and selection. Daydor themes alias it to `brand`; a client theme overrides only `action`, `action-strong`, `action-soft`, `on-action`, and the colour must hold 4.5:1 against `surface` and `on-action`.
- A client theme is light-based. Until the client also has a dark variant (`client-<id>-dark`, with a lighter `action` that holds 3:1 on the dark `surface`), the employee app shows that client in light mode only — never a light client colour on dark surfaces.
- `irreversible` (burnt orange) is reserved for the irreversible write class: the label on decisions, gate steps in receipts, the confirm strip in dialogs. Never use it for anything else.
- Status colours (`success`, `warning`, `danger`, `info`, each with `-soft`) never change per client and always come with an icon and a word.
- `focus` is a fixed blue ring, 2px with 2px offset, never themed.
- No gradients for decoration (the only gradient is the shimmer on `Thinking` text), no coloured side borders, no glow.

### Type

- **Geist** for everything, **Geist Mono** for identifiers. Medium (500) for headings — lighter than v1, which reads calmer at size — 600 only for card titles.
- `display` the brief greeting · `title-lg` page titles · `title` decision and dialog titles · `reading` (15/24) Daydor's prose · `body` (14/21) UI text · `small` receipts and helper text · `label` buttons and fields · `eyebrow` domain labels and section heads · `figure` key amounts · `code`.
- Negative tracking on large sizes (`-0.025em` at 28px); none at body sizes.

### Space, shape, depth

- 4px grid, used generously: `space-6` between messages, `space-8` between brief sections, `space-5` inside decision cards.
- Conversation and brief cap at `conversation-max` (720px); the rail is `rail-width` (340px).
- Corners: `radius-sm` chips and small buttons · `radius-md` buttons, inputs, rail rows · `radius-lg` cards, receipts, dialogs, bubbles · `radius-xl` the composer · `radius-full` avatars, live dots, send.
- Borders first (`line`); `shadow-sm` for cards and composer, `shadow-md` for the focused composer and menus, `shadow-lg` for dialogs. Dark theme relies on borders more than shadows.
- Controls: `control-sm` (28px) inside cards and the rail, `control-md` (36px) default, `control-lg` (44px) on phones.

### Motion

Motion means *an agent is doing something*. Nothing else moves.

- Live dot: a 1.6s teal pulse on running work and on the Daydor avatar while it streams.
- Shimmer: a slow sweep across `Thinking` text.
- Arrival: messages and decision cards rise 4px and fade in over ~220ms.
- Hovers are 120ms colour changes. No bounces, no confetti on approval.
- All of it stops under `prefers-reduced-motion`; the words carry the state.

### States

- Hover: fills move to `surface-sunken`; primary darkens to `action-strong`.
- Focus: the `focus` ring on every interactive element; fields and the composer also turn their border `focus`.
- Disabled: 45% opacity. Prefer explaining why over disabling.
- Selected rail item: `brand-soft` ground.
- Resolved decision: collapses to a one-line record with the outcome mark, who decided and when — it stays in the conversation as history.

## Iconography

- **Lucide**, outline, 1.75px stroke (2px at 12–13px), round caps, `currentColor`. 16px default, 13–14px in chips, 12px in badges.
- Fixed meanings: `eye` read-only, `shield` reversible, `lock` irreversible, `scale` a legal reason, `database` a data source, `file` a document, `calendar` a deadline.
- No sparkles, robots or brains for "AI". Daydor's presence is the teal avatar and the live dot.
- The bundle carries only the glyphs its components need; apps import `lucide-react`.

## Logo

No designed logo yet. The wordmark is **daydor** in Geist 600, lowercase, tracking −0.03em, in `brand`. The agent avatar is a `brand` disc with a lowercase "d" in `on-brand`. Don't add symbols or taglines. In the employee app the client's logo replaces the wordmark; Daydor appears only as "Powered by daydor" in settings.

## Building with Tailwind + shadcn/ui

Stack: React, Tailwind, shadcn/ui (Radix), TanStack Table. Load `tokens.css`, then map shadcn's variables onto it once in `globals.css`:

```css
:root, [data-theme] {
  --background: var(--canvas);
  --foreground: var(--ink);
  --card: var(--surface);
  --card-foreground: var(--ink);
  --popover: var(--surface);
  --popover-foreground: var(--ink);
  --primary: var(--action);
  --primary-foreground: var(--on-action);
  --secondary: var(--surface-sunken);
  --secondary-foreground: var(--ink);
  --muted: var(--surface-sunken);
  --muted-foreground: var(--ink-muted);
  --accent: var(--surface-sunken);   /* shadcn's accent = hover fill */
  --accent-foreground: var(--ink);
  --destructive: var(--danger);
  --border: var(--line);
  --input: var(--line-strong);
  --ring: var(--focus);
  --radius: 8px;                     /* radius-md */
}
```

- Switch themes with `data-theme="light" | "dark"` on `<html>`; a client theme is `data-theme="client-<id>"` carrying only the four `action` values.
- Expose tokens to Tailwind by name (`bg-surface`, `text-ink-muted`, `border-line`, `text-irreversible`) and remove Tailwind's default palette so off-system colours can't creep in.
- The components here are the reference look and behaviour. Implement them over shadcn primitives: `Dialog` → `AlertDialog`, `Select` → `Select`/`Command`, `Receipt` → `Collapsible`, rail → `ScrollArea`; the conversation streams through your LangGraph run events (`Thinking` steps map to node starts, `Receipt` steps to Langfuse spans, `auditId` to the Postgres audit row).
