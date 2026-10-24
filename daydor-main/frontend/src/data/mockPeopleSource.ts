import type { PeopleSource } from '@/data/peopleSource'
import type { PeopleData, PersonDetail, PersonSummary } from '@/types/people'

const MOCK_SUMMARIES: PersonSummary[] = [
  { id: 'ACM-0001', name: 'Abhijeet Singh', role: 'Founder', department: 'Leadership', status: 'active', joinDate: '1 Jan 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0007', name: 'Priya Raghavan', role: 'Product designer', department: 'Product', status: 'active', joinDate: '14 Mar 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0012', name: 'Arjun Mehta', role: 'Backend engineer', department: 'Engineering', status: 'active', joinDate: '2 May 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0015', name: 'Sneha Kulkarni', role: 'Frontend engineer', department: 'Engineering', status: 'on-leave', joinDate: '19 Jun 2024', location: 'Pune (MH)' },
  { id: 'ACM-0018', name: 'Rahul Verma', role: 'QA engineer', department: 'Engineering', status: 'active', joinDate: '3 Jul 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0021', name: 'Rohit Verma', role: 'Sales lead', department: 'Sales', status: 'active', joinDate: '11 Aug 2024', location: 'Mumbai (MH)' },
  { id: 'ACM-0024', name: 'Meera Iyer', role: 'HR generalist', department: 'People', status: 'active', joinDate: '29 Aug 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0027', name: 'Kabir Sethi', role: 'Backend engineer', department: 'Engineering', status: 'active', joinDate: '14 Sep 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0030', name: 'Ananya Rao', role: 'Finance analyst', department: 'Finance', status: 'active', joinDate: '30 Sep 2024', location: 'Chennai (TN)' },
  { id: 'ACM-0033', name: 'Vikram Nair', role: 'DevOps engineer', department: 'Engineering', status: 'active', joinDate: '6 Oct 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0036', name: 'Divya Shankar', role: 'Customer success', department: 'Support', status: 'active', joinDate: '21 Oct 2024', location: 'Hyderabad (TS)' },
  { id: 'ACM-0039', name: 'Karan Malhotra', role: 'Growth marketer', department: 'Marketing', status: 'active', joinDate: '4 Nov 2024', location: 'Delhi (DL)' },
  { id: 'ACM-0042', name: 'Ishita Bose', role: 'Recruiter', department: 'People', status: 'active', joinDate: '18 Nov 2024', location: 'Bengaluru (KA)' },
  { id: 'ACM-0045', name: 'Nikhil Chawla', role: 'Frontend engineer', department: 'Engineering', status: 'withdrawn', joinDate: '2 Dec 2024', location: 'Pune (MH)' },
]

const MOCK_PEOPLE: PeopleData = {
  headcount: MOCK_SUMMARIES.length,
  people: MOCK_SUMMARIES,
}

const MOCK_PROFILES: Record<string, PersonDetail> = {
  'ACM-0007': {
    id: 'ACM-0007',
    name: 'Priya Raghavan',
    role: 'Product designer',
    department: 'Product',
    status: 'active',
    joinDate: '14 Mar 2024',
    location: 'Bengaluru (KA)',
    employeeId: 'ACM-0007',
    manager: 'Abhijeet Singh',
    monthlyCtc: 125000,
    taxRegime: 'New',
    stats: [
      { label: 'Net pay, October', value: 108450, delta: '+₹14,300 after revision', deltaTone: 'warning' },
      { label: 'Leave balance', value: '9.5 days', delta: 'casual 4 · earned 5.5' },
      { label: 'Attendance, October', value: '100%' },
    ],
    fields: [
      { label: 'Home address', value: '12, 4th Main, HSR Layout, Bengaluru', tier: 'direct' },
      { label: 'Emergency contact', value: 'Lakshmi Raghavan · +91 98450 11223', tier: 'direct' },
      { label: 'Tax regime', value: 'New', tier: 'direct' },
      { label: 'PAN', value: 'ABCPR····F', tier: 'review', pending: 'Correction sent 12 Oct' },
      { label: 'Aadhaar', value: '•••• •••• 4410', tier: 'review' },
      { label: 'Salary bank account', value: 'HDFC ···· 4821', tier: 'gated' },
    ],
    timeline: [
      { text: 'Applied CTC revision to ₹1,25,000 / month', domain: 'Payroll', time: '1 Oct', writeClass: 'guarded' },
      { text: 'Sent September payslip', domain: 'Payroll', time: '30 Sep' },
      { by: 'person', name: 'Abhijeet Singh', text: 'Approved the revision', time: '28 Sep' },
      { text: 'Approved 2 days of casual leave within policy', domain: 'Leave', time: '22 Sep', writeClass: 'guarded' },
      { text: "Updated bank account after Priya confirmed it", domain: 'Core HR', time: '4 Sep', writeClass: 'irreversible' },
      { by: 'person', name: 'Abhijeet Singh', text: 'Approved the bank change', time: '4 Sep' },
    ],
  },
}

function fallbackProfile(summary: PersonSummary): PersonDetail {
  return {
    id: summary.id,
    name: summary.name,
    role: summary.role,
    department: summary.department,
    status: summary.status,
    joinDate: summary.joinDate,
    location: summary.location,
    employeeId: summary.id,
    manager: 'Abhijeet Singh',
    monthlyCtc: 65000,
    taxRegime: 'New',
    stats: [
      { label: 'Net pay, October', value: 58200 },
      { label: 'Leave balance', value: '12 days' },
      { label: 'Attendance, October', value: '96%' },
    ],
    fields: [
      { label: 'Home address', value: 'Not on file', tier: 'direct' },
      { label: 'Emergency contact', value: 'Not on file', tier: 'direct' },
      { label: 'Tax regime', value: 'New', tier: 'direct' },
      { label: 'PAN', value: '••••••····•', tier: 'review' },
      { label: 'Aadhaar', value: '•••• •••• ····', tier: 'review' },
      { label: 'Salary bank account', value: '•••• ···· ····', tier: 'gated' },
    ],
    timeline: [{ text: 'Joined Acme Labs', domain: 'Core HR', time: summary.joinDate ?? '' }],
  }
}

export class MockPeopleSource implements PeopleSource {
  async getPeople(): Promise<PeopleData> {
    return MOCK_PEOPLE
  }

  async getPerson(id: string): Promise<PersonDetail | null> {
    const summary = MOCK_SUMMARIES.find((p) => p.id === id)
    if (!summary) return null
    return MOCK_PROFILES[id] ?? fallbackProfile(summary)
  }
}
