import type { ComplianceSource } from '@/data/complianceSource'
import type { ComplianceData } from '@/types/compliance'
import type { ApprovalDecision } from '@/data/actions'

const MOCK_COMPLIANCE: ComplianceData = {
  legalEntityName: 'Acme Labs',
  stats: [
    { label: 'Due in the next 30 days', value: '6' },
    { label: 'Need your approval', value: '2', delta: 'PF return, PT challan', deltaTone: 'warning' },
    { label: 'Filed on time this year', value: '31 of 31', delta: 'no penalties', deltaTone: 'success' },
  ],
  obligations: [
    {
      id: 'ob1',
      legalEntityId: 'le1',
      scheme: 'ESI',
      headcountAtCheck: 11,
      threshold: 10,
      applicable: true,
      crossedAt: '2026-09-22',
      registrationDeadline: '2026-10-07',
      approvalRequestId: 'ar1',
      checklist: [
        { id: 'ci1', title: 'Register for an ESIC employer code', status: 'pending', dueDate: '2026-10-07', blocking: true },
        { id: 'ci2', title: 'Enrol all eligible employees under the new code', status: 'pending', dueDate: '2026-10-14' },
        { id: 'ci3', title: 'Confirm first contribution cycle with payroll', status: 'pending', dueDate: '2026-10-21' },
      ],
    },
    {
      id: 'ob2',
      legalEntityId: 'le1',
      scheme: 'EPF',
      headcountAtCheck: 14,
      threshold: 20,
      applicable: false,
      checklist: [],
    },
    {
      id: 'ob3',
      legalEntityId: 'le1',
      scheme: 'Gratuity',
      headcountAtCheck: 14,
      threshold: 10,
      applicable: true,
      crossedAt: '2026-03-01',
      checklist: [
        { id: 'ci4', title: 'Set up gratuity accrual tracking in payroll', status: 'done', completedAt: '2026-03-18' },
        { id: 'ci5', title: 'Review gratuity trust/insurance arrangement', status: 'pending', dueDate: '2026-12-31' },
      ],
    },
    {
      id: 'ob4',
      legalEntityId: 'le1',
      scheme: 'POSH',
      headcountAtCheck: 14,
      threshold: 10,
      applicable: true,
      crossedAt: '2026-03-01',
      checklist: [
        { id: 'ci6', title: 'Constitute an Internal Committee (IC)', status: 'done', completedAt: '2026-03-25' },
        { id: 'ci7', title: 'File the IC’s annual report with the District Officer', status: 'pending', dueDate: '2027-01-31' },
      ],
    },
  ],
  filings: [
    {
      id: 'fr1',
      legalEntityId: 'le1',
      scheme: 'ESI',
      period: 'Registration',
      authority: 'ESIC',
      dueDate: '2026-10-07',
      status: 'overdue',
    },
    {
      id: 'fr2',
      legalEntityId: 'le1',
      scheme: 'PT',
      period: 'Sep 2026',
      authority: 'Karnataka PT',
      amount: 2600,
      dueDate: '2026-10-20',
      status: 'needs-you',
    },
    {
      id: 'fr3',
      legalEntityId: 'le1',
      scheme: 'TDS',
      period: 'Oct 2026',
      authority: 'Income Tax · Challan 281',
      amount: 84300,
      dueDate: '2026-11-07',
      status: 'upcoming',
    },
    {
      id: 'fr4',
      legalEntityId: 'le1',
      scheme: 'EPF',
      period: 'Oct 2026',
      authority: 'EPFO',
      amount: 50400,
      dueDate: '2026-11-15',
      status: 'needs-you',
    },
    {
      id: 'fr5',
      legalEntityId: 'le1',
      scheme: 'ESI',
      period: 'Oct 2026',
      authority: 'ESIC',
      amount: 10800,
      dueDate: '2026-11-15',
      status: 'upcoming',
    },
    {
      id: 'fr6',
      legalEntityId: 'le1',
      scheme: 'PT',
      period: 'Oct 2026',
      authority: 'Karnataka Labour Dept',
      dueDate: '2026-11-30',
      status: 'upcoming',
    },
    {
      id: 'fr7',
      legalEntityId: 'le1',
      scheme: 'PT',
      period: 'Aug 2026',
      filedOn: '2026-09-18',
      acknowledgementNo: 'KPT-2026-08-7731',
      documentId: 'doc-pt-aug',
      authority: 'Karnataka PT',
      amount: 2600,
      dueDate: '2026-09-20',
      status: 'filed',
    },
    {
      id: 'fr8',
      legalEntityId: 'le1',
      scheme: 'EPF',
      period: 'Sep 2026',
      filedOn: '2026-10-14',
      acknowledgementNo: 'EPFO-ECR-2026-09-4410',
      documentId: 'doc-epf-sep',
      authority: 'EPFO',
      amount: 49800,
      dueDate: '2026-10-15',
      status: 'filed',
    },
  ],
}

export class MockComplianceSource implements ComplianceSource {
  async getCompliance(): Promise<ComplianceData> {
    return MOCK_COMPLIANCE
  }

  async completeTask(_taskId: string): Promise<void> {}

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}
}
