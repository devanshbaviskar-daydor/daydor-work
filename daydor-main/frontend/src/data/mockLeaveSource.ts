import type { LeaveSource } from '@/data/leaveSource'
import type { ApprovalDecision, LeaveRequestInput } from '@/data/actions'
import type { LeaveData } from '@/types/leave'

const MOCK_LEAVE: LeaveData = {
  period: 'Week of 12 Oct',
  stats: [
    { label: 'In today', value: '11 of 14' },
    { label: 'On leave today', value: '2', delta: 'Sneha, Rahul' },
    { label: 'Absent, not on leave', value: '1', delta: 'Arjun — no punch by 10 am', deltaTone: 'warning' },
    { label: 'Requests with managers', value: '3', delta: 'none overdue' },
  ],
  requests: [
    {
      id: 'lr1',
      title: 'Arjun asks for casual leave, 20–21 Oct',
      domain: 'Leave',
      gate: 'Manager approval',
      writeClass: 'guarded',
      summary: 'Family function in Pune. Rahul is also out on the 21st.',
      figures: [{ label: 'Casual leave left', value: '1 day', note: '1 day short — the second day would be unpaid' }],
      approveLabel: 'Approve',
      reviewLabel: 'Approve 1 day only',
    },
    {
      id: 'lr2',
      title: '15 Oct, 1 day',
      domain: 'Sick leave · Sneha',
      writeClass: 'guarded',
    },
    {
      id: 'lr3',
      title: '15 Oct, 1 day',
      domain: 'Earned leave · Meera',
      writeClass: 'guarded',
    },
  ],
  balances: [
    { leaveType: 'Earned leave', balanceDays: 15 },
    { leaveType: 'Casual leave', balanceDays: 12 },
    { leaveType: 'Sick leave', balanceDays: 6 },
    { leaveType: 'Maternity leave', balanceDays: 0 },
  ],
  attendance: {
    days: [
      { label: 'Mon', sub: '12' },
      { label: 'Tue', sub: '13', today: true },
      { label: 'Wed', sub: '14' },
      { label: 'Thu', sub: '15' },
      { label: 'Fri', sub: '16' },
      { label: 'Sat', sub: '17' },
      { label: 'Sun', sub: '18' },
    ],
    people: [
      { name: 'Priya Raghavan', marks: 'PP---OO' },
      { name: 'Arjun Mehta', marks: 'PA---OO' },
      { name: 'Sneha Kulkarni', marks: 'LLL--OO' },
      { name: 'Rahul Verma', marks: 'HL---OO' },
      { name: 'Rohit Verma', marks: 'PP---OO' },
      { name: 'Meera Iyer', marks: 'PP-L-OO' },
      { name: 'Kabir Sethi', marks: 'PP---OO' },
    ],
    moreCount: 7,
  },
}

export class MockLeaveSource implements LeaveSource {
  async getLeave(): Promise<LeaveData> {
    return MOCK_LEAVE
  }

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}

  async submitLeaveRequest(_input: LeaveRequestInput): Promise<void> {}
}
