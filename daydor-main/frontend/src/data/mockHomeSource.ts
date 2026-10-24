import type { HomeSource } from '@/data/homeSource'
import type { ApprovalDecision } from '@/data/actions'
import type { ConversationTurn, HomeData, ProposedCommand } from '@/types/home'

const MOCK_HOME: HomeData = {
  brief: {
    greeting: 'Good morning, Abhijeet',
    date: 'Tuesday, 13 October',
    summary: 'Overnight I closed 23 tasks across payroll, leave and onboarding. **3 things need you** — the PF return is due in 2 days.',
    stats: [
      { value: 3, label: 'Need you', tone: 'warning' },
      { value: 2, label: 'Running now', tone: 'brand' },
      { value: 23, label: 'Done since yesterday' },
    ],
  },
  conversation: [
    {
      kind: 'message',
      id: 'm1',
      from: 'user',
      time: '9:41 am',
      text: 'Is October payroll ready? Anything unusual?',
    },
    {
      kind: 'message',
      id: 'm2',
      from: 'daydor',
      domain: 'Payroll',
      time: '9:42 am',
      text: "Computed and waiting for you. Net pay is **₹12,48,600** — ₹38,200 more than September, almost all from Priya's revision and Arjun's 3 days of loss-of-pay.",
    },
    {
      kind: 'thinking',
      id: 't1',
      label: "Onboarding is preparing Kavya's first day…",
      steps: ['Laptop request sent to IT', 'Drafting the welcome email'],
    },
  ],
  needsYou: [
    {
      id: 'd1',
      title: 'File the October PF return',
      domain: 'Compliance',
      gate: 'Statutory filing',
      writeClass: 'irreversible',
      summary:
        "ECR for 14 members is ready. Once filed with EPFO it can't be withdrawn — only corrected with a revised return.",
      figures: [
        { label: 'Employer + employee PF', value: 50400 },
        { label: 'Members', value: 14, note: 'No new UANs this month' },
      ],
      why: 'EPF Scheme 1952: contributions due by 15 Nov. A human signs off every filing.',
      deadline: { daysLeft: 2, date: '15 Nov' },
      approveLabel: 'Approve & file',
      reviewLabel: 'See the return',
    },
    {
      id: 'd2',
      title: 'Release October salaries',
      domain: 'Payroll',
      gate: 'Maker-checker',
      writeClass: 'irreversible',
      summary: 'Payroll for 14 people is computed and ready to disburse.',
      figures: [{ label: 'Net pay', value: 1248600 }],
      why: 'Salary disbursal moves money and cannot be reversed once sent.',
      deadline: { daysLeft: 5 },
      approveLabel: 'Release ₹12,48,600',
      reviewLabel: 'Review payroll',
    },
    {
      id: 'd3',
      title: "You're about to cross 10 people — register for ESI",
      domain: 'Headcount',
      gate: 'Statutory registration',
      writeClass: 'guarded',
      summary: 'Crossing 10 employees triggers mandatory ESI registration within 15 days.',
      why: 'ESI Act, 1948: registration is mandatory once headcount crosses 10.',
      deadline: { daysLeft: 12 },
      approveLabel: 'Start registration',
      reviewLabel: 'See the rule',
    },
  ],
  runningNow: [
    {
      id: 'r1',
      title: "Preparing Kavya's first day",
      state: 'running',
      domain: 'Onboarding',
      meta: 'step 2 of 4',
      progress: 50,
    },
    {
      id: 'r2',
      title: "Waiting on Rohit's bank proof",
      state: 'waiting',
      domain: 'Core HR',
      meta: 'since yesterday',
    },
  ],
  doneToday: [
    { id: 'rd1', title: 'Approved 4 leave requests within policy', state: 'done', domain: 'Leave', meta: '8:50 am' },
    { id: 'rd2', title: 'Sent 14 payslips', state: 'done', domain: 'Payroll', meta: '8:30 am' },
    { id: 'rd3', title: 'Computed October PF contributions', state: 'done', domain: 'Compliance', meta: '7:10 am' },
    { id: 'rd4', title: "Closed Arjun's loss-of-pay adjustment", state: 'done', domain: 'Payroll', meta: '6:55 am' },
    { id: 'rd5', title: 'Verified attendance register for 14 people', state: 'done', domain: 'Payroll', meta: '6:40 am' },
  ],
  doneTodayMoreCount: 18,
}

export class MockHomeSource implements HomeSource {
  async getHome(): Promise<HomeData> {
    return MOCK_HOME
  }

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}

  async sendMessage(text: string, _aboutEmployeeId?: string): Promise<ConversationTurn[]> {
    return [
      ...MOCK_HOME.conversation,
      { kind: 'message', id: `u-${Date.now()}`, from: 'user', text },
      { kind: 'message', id: `d-${Date.now()}`, from: 'daydor', text: 'This is the design mock: nothing is answered here.' },
    ]
  }

  async runCommand(_command: ProposedCommand): Promise<void> {}
}
