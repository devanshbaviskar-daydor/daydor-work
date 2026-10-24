import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { createSources } from '@/data/sources'
import type { Sources } from '@/data/sources'
import { ALL_SCREENS, makeSession, never, refused, renderScreen, withOverrides } from '@/test/helpers'
import { BenefitsScreen } from '@/screens/BenefitsScreen'
import { ComplianceScreen } from '@/screens/ComplianceScreen'
import { DocumentsScreen } from '@/screens/DocumentsScreen'
import { ExpensesScreen } from '@/screens/ExpensesScreen'
import { HiringScreen } from '@/screens/HiringScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { LeaveScreen } from '@/screens/LeaveScreen'
import { PayrollScreen } from '@/screens/PayrollScreen'
import { PeopleScreen } from '@/screens/PeopleScreen'
import { PersonScreen } from '@/screens/PersonScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import type { HomeData } from '@/types/home'
import type { LeaveData } from '@/types/leave'

const mock = createSources('mock')

// every screen, with the one method that loads it
type Case = { name: string; load: string; make: (s: Sources) => ReactElement; patch: (s: Sources, load: () => Promise<unknown>) => Sources; route?: string }
const CASES: Case[] = [
  { name: 'Home', load: 'getHome', make: (s) => <HomeScreen source={s.home} />, patch: (s, f) => ({ ...s, home: withOverrides(s.home, { getHome: f }) }) },
  { name: 'Leave', load: 'getLeave', make: (s) => <LeaveScreen source={s.leave} />, patch: (s, f) => ({ ...s, leave: withOverrides(s.leave, { getLeave: f }) }) },
  { name: 'Hiring', load: 'getHiring', make: (s) => <HiringScreen source={s.hiring} />, patch: (s, f) => ({ ...s, hiring: withOverrides(s.hiring, { getHiring: f }) }) },
  { name: 'Payroll', load: 'getPayroll', make: (s) => <PayrollScreen source={s.payroll} />, patch: (s, f) => ({ ...s, payroll: withOverrides(s.payroll, { getPayroll: f }) }) },
  { name: 'Compliance', load: 'getCompliance', make: (s) => <ComplianceScreen source={s.compliance} />, patch: (s, f) => ({ ...s, compliance: withOverrides(s.compliance, { getCompliance: f }) }) },
  { name: 'Expenses', load: 'getExpenses', make: (s) => <ExpensesScreen source={s.expenses} />, patch: (s, f) => ({ ...s, expenses: withOverrides(s.expenses, { getExpenses: f }) }) },
  { name: 'Benefits', load: 'getBenefits', make: (s) => <BenefitsScreen source={s.benefits} />, patch: (s, f) => ({ ...s, benefits: withOverrides(s.benefits, { getBenefits: f }) }) },
  { name: 'People', load: 'getPeople', make: (s) => <PeopleScreen source={s.people} />, patch: (s, f) => ({ ...s, people: withOverrides(s.people, { getPeople: f }) }) },
  {
    name: 'Person', load: 'getPerson', route: '/people/ACM-0007',
    make: (s) => (
      <Routes>
        <Route path="/people/:id" element={<PersonScreen source={s.people} />} />
      </Routes>
    ),
    patch: (s, f) => ({ ...s, people: withOverrides(s.people, { getPerson: f }) }),
  },
  { name: 'Documents', load: 'getDocuments', make: (s) => <DocumentsScreen source={s.documents} />, patch: (s, f) => ({ ...s, documents: withOverrides(s.documents, { getDocuments: f }) }) },
  { name: 'Settings', load: 'getSettings', make: (s) => <SettingsScreen source={s.settings} />, patch: (s, f) => ({ ...s, settings: withOverrides(s.settings, { getSettings: f }) }) },
]

describe.each(CASES)('$name screen', (c) => {
  it('says it is loading, with the shell around it', () => {
    renderScreen(c.make(c.patch(mock, () => never())), { route: c.route })
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.getByText('Acme Technologies')).toBeInTheDocument()
  })

  it('says why when the role does not have the screen (403)', async () => {
    renderScreen(c.make(c.patch(mock, () => refused(403, 'screen_not_available', 'Your role does not have this screen.'))), { route: c.route })
    expect(await screen.findByRole('alert')).toHaveTextContent('Your role does not have this screen')
  })

  it('says the service is unavailable and lets the person try again (503)', async () => {
    let calls = 0
    renderScreen(c.make(c.patch(mock, () => (++calls === 1 ? refused(503, 'workflow_engine_unavailable') : (mock as never)[c.name.toLowerCase() as never]))), { route: c.route })
    expect(await screen.findByRole('alert')).toHaveTextContent('The workflow service is not available')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('shows the real name and workspace, not a hard-coded one', async () => {
    renderScreen(c.make(mock), { session: makeSession('tenant_founder', { display_name: 'Kavya Menon', tenant_name: 'Zeta Works' }), route: c.route })
    await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull())
    expect(screen.getByText('Kavya Menon')).toBeInTheDocument()
    expect(screen.getByText('Zeta Works')).toBeInTheDocument()
    expect(within(screen.getByRole('navigation')).queryByText('Abhijeet Singh')).toBeNull()
  })
})

// --------------------------------------------------------------------------------------------------------------------- role-aware cases
const decision = { id: 'a1', title: 'Approve leave', writeClass: 'guarded' as const, approveLabel: 'Approve' }

describe('Home', () => {
  const home = (needs: HomeData['needsYou']): HomeData => ({
    brief: { greeting: 'Hello', summary: 'x', stats: [] }, conversation: [], needsYou: needs, runningNow: [], doneToday: [],
  })

  it('shows the reason, not the buttons, on a decision the role cannot make', async () => {
    const src = withOverrides(mock.home, { getHome: async () => home([{ ...decision, canDecide: false, cannotDecideReason: 'Only the founder can decide this.' }]) })
    renderScreen(<HomeScreen source={src} />)
    expect(await screen.findAllByText('Only the founder can decide this.')).not.toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull()
  })

  it('approves through the source and reloads', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined)
    const getHome = vi.fn().mockResolvedValue(home([{ ...decision, canDecide: true }]))
    renderScreen(<HomeScreen source={withOverrides(mock.home, { getHome, resolveApproval: resolve })} />)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Approve' }))
    await waitFor(() => expect(resolve).toHaveBeenCalledWith('a1', 'approved'))
    await waitFor(() => expect(getHome).toHaveBeenCalledTimes(2))
  })

  it('shows a refused decision (403) in words and does not pretend it worked', async () => {
    const resolve = vi.fn().mockImplementation(() => refused(403, 'wrong_approver_role', 'Your role cannot approve this kind of request.'))
    renderScreen(<HomeScreen source={withOverrides(mock.home, { getHome: async () => home([{ ...decision, canDecide: true }]), resolveApproval: resolve })} />)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Approve' }))
    expect(await screen.findByText('Your role cannot approve this kind of request.')).toBeInTheDocument()
  })

  it('reloads after a conflict, so the person sees what changed', async () => {
    const getHome = vi.fn().mockResolvedValue(home([{ ...decision, canDecide: true }]))
    const resolve = vi.fn().mockImplementation(() => refused(409, 'already_resolved', 'This request has already been resolved.'))
    renderScreen(<HomeScreen source={withOverrides(mock.home, { getHome, resolveApproval: resolve })} />)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Approve' }))
    expect(await screen.findByText(/already been resolved/)).toBeInTheDocument()
    await waitFor(() => expect(getHome).toHaveBeenCalledTimes(2))
  })

  it('sends what is typed and shows the answer, with a link to open', async () => {
    const send = vi.fn().mockResolvedValue([
      { kind: 'message', id: 'u', from: 'user', text: 'where is leave' },
      { kind: 'message', id: 'd', from: 'daydor', text: 'That is on the Leave screen.', action: { kind: 'open', path: '/leave', label: 'Open Leave & attendance' } },
    ])
    renderScreen(<HomeScreen source={withOverrides(mock.home, { getHome: async () => home([]), sendMessage: send })} />)
    const user = userEvent.setup()
    await user.type(await screen.findByPlaceholderText(/Ask Daydor/), 'where is leave{Enter}')
    await waitFor(() => expect(send).toHaveBeenCalledWith('where is leave', undefined))
    expect(await screen.findByText('That is on the Leave screen.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open Leave & attendance/ })).toBeInTheDocument()
  })

  it('shows a proposed command in words and runs it only on Confirm', async () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const command = { id: 'expense.submit', method: 'POST' as const, path: '/api/expenses', body: { amount: 500 }, summary: 'Submit an expense claim of 500', risk: 'low', kind: 'action', confirm_required: true, idempotency_key: 'k1' }
    const getHome = async () => ({ ...home([]), conversation: [{ kind: 'message' as const, id: 'd', from: 'daydor' as const, text: 'I can do that.', action: { kind: 'command' as const, command } }] })
    renderScreen(<HomeScreen source={withOverrides(mock.home, { getHome, runCommand: run })} />)
    const user = userEvent.setup()
    expect(await screen.findByText('Submit an expense claim of 500')).toBeInTheDocument()
    expect(run).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(run).toHaveBeenCalledWith(command))
  })
})

describe('Leave', () => {
  const leave = (over: Partial<LeaveData> = {}): LeaveData => ({
    period: 'October 2026', stats: [], requests: [], balances: [], attendance: { days: [], people: [] },
    policies: [{ id: 'p1', leaveType: 'annual', daysPerMonth: 1.5, carryForwardCap: 15 }], ...over,
  })

  it('offers "Request leave" to an employee and sends it', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    renderScreen(<LeaveScreen source={withOverrides(mock.leave, { getLeave: async () => leave(), submitLeaveRequest: submit })} />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Request leave' }))
    await user.type(screen.getByLabelText('First day'), '2026-11-02')
    await user.type(screen.getByLabelText('Last day'), '2026-11-03')
    await user.click(screen.getByRole('button', { name: 'Send request' }))
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ leave_policy_id: 'p1', start_date: '2026-11-02', end_date: '2026-11-03', reason: '' }))
  })

  it('hides "Request leave" from someone with no employee record, and when there is no policy', async () => {
    const { unmount } = renderScreen(<LeaveScreen source={withOverrides(mock.leave, { getLeave: async () => leave() })} />, { session: makeSession('tenant_ops', { employee_id: null }) })
    await screen.findByRole('button', { name: 'Leave policy' })
    expect(screen.queryByRole('button', { name: 'Request leave' })).toBeNull()
    unmount()
    renderScreen(<LeaveScreen source={withOverrides(mock.leave, { getLeave: async () => leave({ policies: undefined }) })} />)
    await screen.findByText('Leave balances')
    expect(screen.queryByRole('button', { name: 'Request leave' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Leave policy' })).toBeNull()
  })

  it('opens the policy read-only', async () => {
    renderScreen(<LeaveScreen source={withOverrides(mock.leave, { getLeave: async () => leave() })} />)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Leave policy' }))
    expect(await screen.findByText(/carries forward up to 15 days/)).toBeInTheDocument()
  })

  it('says a request is read-only to a role that cannot decide it', async () => {
    const requests = [{ ...decision, id: 'r1', canDecide: false, cannotDecideReason: 'Only People manager can decide this.' }]
    renderScreen(<LeaveScreen source={withOverrides(mock.leave, { getLeave: async () => leave({ requests }) })} />)
    expect(await screen.findByText('Only People manager can decide this.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
  })
})

describe('Payroll', () => {
  it('offers "New run" to payroll and the founder, not to a manager', async () => {
    const { unmount } = renderScreen(<PayrollScreen source={mock.payroll} />, { session: makeSession('tenant_payroll') })
    expect(await screen.findByRole('button', { name: 'New run' })).toBeInTheDocument()
    unmount()
    renderScreen(<PayrollScreen source={mock.payroll} />, { session: makeSession('tenant_manager') })
    await screen.findByText(/payroll/i)
    expect(screen.queryByRole('button', { name: 'New run' })).toBeNull()
  })

  it('starts last month by default after a confirmation', async () => {
    const create = vi.fn().mockResolvedValue(undefined)
    renderScreen(<PayrollScreen source={withOverrides(mock.payroll, { createPayrollRun: create })} />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'New run' }))
    expect(create).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Start run' }))
    await waitFor(() => expect(create).toHaveBeenCalled())
    const arg = create.mock.calls[0][0]
    expect(arg.period_start).toMatch(/^\d{4}-\d{2}-01$/)
    expect(arg.period_end >= arg.period_start).toBe(true)
  })

  it('shows the payment as waiting for the founder to a role that cannot approve it', async () => {
    renderScreen(<PayrollScreen source={mock.payroll} />, { session: makeSession('tenant_payroll', {}, { decides: ['g_pay_anomaly'] }) })
    expect(await screen.findByText(/Waiting for the founder to approve the payment/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Approve & release/ })).toBeNull()
  })

  it('marks what is simulated', async () => {
    const d = await mock.payroll.getPayroll()
    const run = { ...d.runs[0], disbursed_at: '2026-09-30T10:00:00Z' }
    const src = withOverrides(mock.payroll, { getPayroll: async () => ({ ...d, runs: [run, ...d.runs.slice(1)], filingsByRunId: { ...d.filingsByRunId, [run.payroll_run_id]: [{ legal_entity_id: 'l', scheme: 'EPF', period: '2026-09', filed_on: '2026-10-10', acknowledgement_no: 'A1' }] } }) })
    renderScreen(<PayrollScreen source={src} />)
    await screen.findByText(/Run lifecycle/)
    expect(screen.getAllByText('simulated').length).toBeGreaterThan(1)
  })
})

describe('Hiring', () => {
  const withAwaiting = async () => {
    const data = await mock.hiring.getHiring()
    const id = data.requisitions[0].id
    return { ...data, details: { ...data.details, [id]: { ...data.details[id], awaiting: 'new_hire_details' as const } } }
  }

  it('gives HR the form for the new hire’s details and everyone else the waiting line', async () => {
    const src = withOverrides(mock.hiring, { getHiring: withAwaiting })
    const { unmount } = renderScreen(<HiringScreen source={src} />, { session: makeSession('tenant_hr') })
    expect(await screen.findByText("Record the new hire's details")).toBeInTheDocument()
    unmount()
    renderScreen(<HiringScreen source={src} />, { session: makeSession('tenant_founder') })
    expect(await screen.findByText("Waiting for HR to record the new hire's details.")).toBeInTheDocument()
    expect(screen.queryByText("Record the new hire's details")).toBeNull()
  })

  it('records the details through the source', async () => {
    const record = vi.fn().mockResolvedValue(undefined)
    renderScreen(<HiringScreen source={withOverrides(mock.hiring, { getHiring: withAwaiting, recordNewHireDetails: record })} />, { session: makeSession('tenant_hr') })
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Date of birth'), '1995-04-12')
    await user.type(screen.getByLabelText('Aadhaar (last 4 digits)'), '1234')
    await user.type(screen.getByLabelText('Home address'), '1 Main Street')
    await user.click(screen.getByRole('button', { name: 'Record details' }))
    await waitFor(() => expect(record).toHaveBeenCalledWith(expect.any(String), { date_of_birth: '1995-04-12', personal_address: '1 Main Street', aadhaar_last4: '1234' }))
  })

  it('does not offer to open a role to someone who cannot', async () => {
    renderScreen(<HiringScreen source={mock.hiring} />, { session: makeSession('tenant_payroll') })
    await screen.findByText(/Hiring/)
    expect(screen.queryByRole('button', { name: 'Open a role' })).toBeNull()
  })

  it('opens a role from the seat, the manager, a date and a pay range', async () => {
    const start = vi.fn().mockResolvedValue(undefined)
    renderScreen(<HiringScreen source={withOverrides(mock.hiring, { startHiring: start })} />, { session: makeSession('tenant_hr') })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Open a role' }))
    await user.type(await screen.findByLabelText('Start by'), '2027-01-04')
    await user.type(screen.getByLabelText('Pay from (₹ a year)'), '1800000')
    await user.type(screen.getByLabelText('Pay to (₹ a year)'), '2600000')
    await user.click(await screen.findByRole('button', { name: 'Open the role' }))
    await waitFor(() => expect(start).toHaveBeenCalledWith({ position_id: 'pos-1', hiring_manager_id: 'emp-1', target_start_date: '2027-01-04', pay_range_min: 1800000, pay_range_max: 2600000 }))
  })

  it('asks the right role to decide a pending budget, and shows only the reason to others', async () => {
    const data = await mock.hiring.getHiring()
    const first = data.requisitions[0]
    const pending = { ...data, requisitions: [{ ...first, approval: { id: 'ab1', status: 'pending', gate_type: 'g_requisition_budget' } }, ...data.requisitions.slice(1)] }
    const src = withOverrides(mock.hiring, { getHiring: async () => pending })
    const { unmount } = renderScreen(<HiringScreen source={src} />, { session: makeSession('tenant_founder', {}, { decides: ['g_requisition_budget'] }) })
    expect(await screen.findByRole('button', { name: 'Approve' })).toBeInTheDocument()
    unmount()
    renderScreen(<HiringScreen source={src} />, { session: makeSession('tenant_hr', {}, { decides: ['g_aedt'] }) })
    await screen.findByText(/Approve the budget to hire/)
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
  })
})

describe('Compliance', () => {
  const data = async () => {
    const d = await mock.compliance.getCompliance()
    return d
  }

  it('lets the founder and HR tick a task off, and nobody else', async () => {
    const done = vi.fn().mockResolvedValue(undefined)
    const src = withOverrides(mock.compliance, { getCompliance: data, completeTask: done })
    const { unmount } = renderScreen(<ComplianceScreen source={src} />, { session: makeSession('tenant_hr') })
    const user = userEvent.setup()
    await user.click((await screen.findAllByRole('button', { name: 'Review checklist' }))[0])
    const mark = (await screen.findAllByRole('button', { name: 'Mark done' }))[0]
    await user.click(mark)
    await waitFor(() => expect(done).toHaveBeenCalledWith(expect.any(String)))
    unmount()
    renderScreen(<ComplianceScreen source={src} />, { session: makeSession('tenant_payroll') })
    await user.click((await screen.findAllByRole('button', { name: 'Review checklist' }))[0])
    expect(screen.queryByRole('button', { name: 'Mark done' })).toBeNull()
    expect(screen.getAllByText('Only the founder or HR can tick tasks off.').length).toBeGreaterThan(0)
  })

  it('marks a filing as simulated', async () => {
    renderScreen(<ComplianceScreen source={mock.compliance} />)
    await screen.findByText(/Filed this year/)
    expect(screen.getAllByText('simulated').length).toBeGreaterThan(0)
  })
})

describe('Expenses', () => {
  it('offers a claim only to someone who is an employee', async () => {
    const { unmount } = renderScreen(<ExpensesScreen source={mock.expenses} />)
    expect(await screen.findByRole('button', { name: 'Claim an expense' })).toBeInTheDocument()
    unmount()
    renderScreen(<ExpensesScreen source={mock.expenses} />, { session: makeSession('tenant_ops', { employee_id: null }) })
    await screen.findAllByText('Expenses')
    expect(screen.queryByRole('button', { name: 'Claim an expense' })).toBeNull()
  })

  it('submits the amount that was typed, not a made-up one', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    renderScreen(<ExpensesScreen source={withOverrides(mock.expenses, { submitExpense: submit })} />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Claim an expense' }))
    await user.type(screen.getByLabelText('Amount (₹)'), '640')
    await user.click(screen.getByRole('button', { name: /Submit ₹640 claim/ }))
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ amount: 640, category: 'meals' }))
  })

  it('has no button that pretends to ask the employee something', async () => {
    renderScreen(<ExpensesScreen source={mock.expenses} />)
    await screen.findAllByText('Expenses')
    expect(screen.queryByRole('button', { name: /^Ask / })).toBeNull()
  })
})

describe('Benefits', () => {
  const benefits = async () => ({
    ...(await mock.benefits.getBenefits()),
    proposedChanges: [{ id: 'c1', planType: 'GPA' as const, carrier: 'Bajaj Allianz', planYear: '2027-28', employerContribution: 12000, status: 'awaiting_founder' as const, approvalRequestId: 'ar1', canDecide: false, cannotDecideReason: 'Only Founder can decide this.' }],
  })

  it('shows a proposed change as waiting for the founder, without buttons for HR', async () => {
    renderScreen(<BenefitsScreen source={withOverrides(mock.benefits, { getBenefits: benefits })} />, { session: makeSession('tenant_hr') })
    expect(await screen.findByText(/Bajaj Allianz, 2027-28/)).toBeInTheDocument()
    expect(screen.getByText('Only Founder can decide this.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
  })

  it('offers a plan change to HR and the founder only, and enrolment to an employee', async () => {
    const src = withOverrides(mock.benefits, { getBenefits: benefits })
    const { unmount } = renderScreen(<BenefitsScreen source={src} />, { session: makeSession('tenant_employee') })
    await screen.findByText(/Group benefits/)
    expect(screen.queryByRole('button', { name: 'Propose a plan change' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Choose a plan' })).toBeInTheDocument()
    unmount()
    renderScreen(<BenefitsScreen source={src} />, { session: makeSession('tenant_hr', { employee_id: null }) })
    expect(await screen.findByRole('button', { name: 'Propose a plan change' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Choose a plan' })).toBeNull()
  })

  it('enrols with a zero cost, and asks for the premium only for the parents tier', async () => {
    const elect = vi.fn().mockResolvedValue(undefined)
    renderScreen(<BenefitsScreen source={withOverrides(mock.benefits, { elect })} />, { session: makeSession('tenant_employee', { employee_id: 'emp-9' }) })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Choose a plan' }))
    expect(screen.queryByLabelText(/Premium for parents/)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Enrol' }))
    await waitFor(() => expect(elect).toHaveBeenCalledWith(expect.objectContaining({ employee_id: 'emp-9', coverage_tier: 'employee_only', employee_cost: 0 })))
  })
})

describe('People and Person', () => {
  it('shows the directory with a count, and no hard-coded cities', async () => {
    renderScreen(<PeopleScreen source={mock.people} />)
    expect(await screen.findByText('14 people')).toBeInTheDocument()
    expect(screen.queryByText(/Bengaluru, Pune, Mumbai/)).toBeNull()
  })

  it('leaves out pay for a role that does not get it, and the dead tabs', async () => {
    const person = { ...(await mock.people.getPerson('ACM-0007'))!, monthlyCtc: undefined, taxRegime: undefined, stats: [], fields: [] }
    renderScreen(
      <Routes>
        <Route path="/people/:id" element={<PersonScreen source={withOverrides(mock.people, { getPerson: async () => person })} />} />
      </Routes>,
      { route: '/people/ACM-0007' },
    )
    await screen.findAllByText('Priya Raghavan')
    expect(screen.queryByText('Monthly CTC')).toBeNull()
    expect(screen.queryByText('Tax regime')).toBeNull()
    for (const tab of ['Pay', 'Leave', 'Documents', 'Activity']) expect(screen.queryByRole('tab', { name: tab })).toBeNull()
  })

  it('"Ask about" goes to Home with the question', async () => {
    renderScreen(
      <Routes>
        <Route path="/people/:id" element={<PersonScreen source={mock.people} />} />
        <Route path="/" element={<p>home</p>} />
      </Routes>,
      { route: '/people/ACM-0007' },
    )
    await userEvent.setup().click(await screen.findByRole('button', { name: /Ask about Priya/ }))
    expect(await screen.findByText('home')).toBeInTheDocument()
  })
})

describe('Documents', () => {
  it('says so when the role is not shown the retention policy', async () => {
    const docs = await mock.documents.getDocuments()
    const src = withOverrides(mock.documents, { getDocuments: async () => ({ documents: docs.documents.map((d) => ({ ...d, retentionClass: undefined })) }) })
    renderScreen(<DocumentsScreen source={src} />)
    await userEvent.setup().click(await screen.findByText(docs.documents[0].title === 'Payslip' ? 'Payslip' : docs.documents[0].title, { selector: 'td *, td' }).catch(() => screen.getAllByRole('row')[1]))
    expect(await screen.findAllByText('Not shown to your role')).not.toHaveLength(0)
  })
})

describe('Settings', () => {
  it('shows the legal entity read-only, with the reason', async () => {
    renderScreen(<SettingsScreen source={mock.settings} />)
    expect(await screen.findByLabelText('Legal entity name')).toHaveAttribute('readonly')
    expect(screen.getAllByText(/made by Daydor support during the pilot/).length).toBeGreaterThan(0)
  })

  it('shows only the profile to a role that does not read the legal entity', async () => {
    const s = await mock.settings.getSettings()
    const src = withOverrides(mock.settings, { getSettings: async () => ({ ...s, workspace: { ...s.workspace, legalEntityName: '', workLocations: [] } }) })
    renderScreen(<SettingsScreen source={src} />, { session: makeSession('tenant_employee') })
    expect(await screen.findByText('Notifications')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Workspace' })).toBeNull()
    expect(screen.queryByText('Legal entity')).toBeNull()
  })

  it('puts a notification toggle back and says why when the server refuses it', async () => {
    const s = await mock.settings.getSettings()
    const update = vi.fn().mockImplementation(() => refused(503, 'x'))
    renderScreen(<SettingsScreen source={withOverrides(mock.settings, { getSettings: async () => ({ ...s, workspace: { ...s.workspace, legalEntityName: '' } }), updateNotificationPreference: update })} />)
    const box = within((await screen.findByText(s.profile.notifications[0].label)).closest('div')!.parentElement!).getAllByRole('checkbox')[0] as HTMLInputElement
    const before = box.checked
    await userEvent.setup().click(box)
    expect(await screen.findByText('The workflow service is not available')).toBeInTheDocument()
    await waitFor(() => expect(box.checked).toBe(before))
  })
})

it('every screen key the session knows has a screen', () => {
  expect(ALL_SCREENS).toHaveLength(10)
})
