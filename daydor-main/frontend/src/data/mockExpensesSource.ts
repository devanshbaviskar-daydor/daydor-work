import type { ExpensesSource } from '@/data/expensesSource'
import type { ApprovalDecision, ExpenseInput } from '@/data/actions'
import type { ExpensesData } from '@/types/expenses'

const MOCK_EXPENSES: ExpensesData = {
  categoryRules: [
    { categoryCode: 'meals', label: 'Meals', requiresReceiptAbove: 500, managerApprovalThreshold: 5000, itcEligible: false },
    { categoryCode: 'travel', label: 'Travel', requiresReceiptAbove: 500, managerApprovalThreshold: 5000, itcEligible: true },
    {
      categoryCode: 'client_entertainment',
      label: 'Client entertainment',
      requiresReceiptAbove: 500,
      managerApprovalThreshold: 5000,
      itcEligible: false,
    },
    { categoryCode: 'office_supplies', label: 'Office supplies', requiresReceiptAbove: 500, managerApprovalThreshold: 5000, itcEligible: true },
    {
      categoryCode: 'professional_development',
      label: 'Professional development',
      requiresReceiptAbove: 500,
      managerApprovalThreshold: 5000,
      itcEligible: true,
    },
  ],
  claims: [
    {
      id: 'exp1',
      employeeId: 'emp-sneha',
      employeeName: 'Sneha Kulkarni',
      amount: 7860,
      categoryCode: 'client_entertainment',
      submittedAt: '2026-10-09T21:58:00+05:30',
      receiptDocumentId: 'doc-toit-7860',
      vendor: 'Toit Brewpub',
      receiptDate: '9 Oct 2026',
      note: 'Dinner with Zeta Health’s team after the pilot review.',
      extractedFields: [
        { label: 'Vendor', value: 'Toit Brewpub' },
        { label: 'Date', value: '9 Oct 2026' },
        { label: 'Amount', value: 7860 },
        { label: 'Category', value: 'Client entertainment' },
      ],
      policyFlags: [
        {
          kind: 'needs_founder_approval',
          message: 'Client entertainment above ₹5,000 needs a founder.',
        },
      ],
      approvalRequest: {
        id: 'appr1',
        stage: 'founder',
        approverName: 'Abhijeet Singh',
        status: 'pending',
      },
    },
    {
      id: 'exp2',
      employeeId: 'emp-rohit',
      employeeName: 'Rohit Verma',
      amount: 6450,
      categoryCode: 'travel',
      submittedAt: '2026-10-11T08:15:00+05:30',
      receiptDocumentId: 'doc-travel-6450',
      vendor: 'IndiGo Airlines',
      receiptDate: '11 Oct 2026',
      note: 'Client visit — Bengaluru to Mumbai, same-day return.',
      extractedFields: [
        { label: 'Vendor', value: 'IndiGo Airlines' },
        { label: 'Date', value: '11 Oct 2026' },
        { label: 'Amount', value: 6450 },
        { label: 'Category', value: 'Travel' },
      ],
      policyFlags: [
        {
          kind: 'needs_founder_approval',
          message: 'Travel above ₹5,000 needs a founder.',
        },
      ],
      approvalRequest: {
        id: 'appr2',
        stage: 'founder',
        approverName: 'Abhijeet Singh',
        status: 'pending',
      },
    },
    {
      id: 'exp3',
      employeeId: 'emp-priya',
      employeeName: 'Priya Raghavan',
      amount: 1180,
      categoryCode: 'meals',
      submittedAt: '2026-10-14T13:42:00+05:30',
      receiptDocumentId: 'doc-bluetokai-1180',
      vendor: 'Blue Tokai Coffee Roasters',
      receiptDate: '14 Oct 2026',
      note: 'Coffee with candidate Ishaan after his interview.',
      extractedFields: [
        { label: 'Vendor', value: 'Blue Tokai Coffee' },
        { label: 'Date', value: '14 Oct 2026' },
        { label: 'Amount', value: 1180 },
        { label: 'GSTIN', value: '29AAJCB12?4F1Z5', confidence: 'low', flag: 'Unclear' },
      ],
      policyFlags: [],
      approvalRequest: {
        id: 'appr3',
        stage: 'manager',
        approverName: 'Rohit Verma',
        status: 'pending',
      },
    },
    {
      id: 'exp4',
      employeeId: 'emp-kabir',
      employeeName: 'Kabir Sethi',
      amount: 2340,
      categoryCode: 'office_supplies',
      submittedAt: '2026-10-02T11:05:00+05:30',
      note: 'Keyboard and mouse for the new hire’s desk — receipt lost before upload.',
      extractedFields: [
        { label: 'Vendor', value: 'Reliance Digital' },
        { label: 'Date', value: '2 Oct 2026' },
        { label: 'Amount', value: 2340 },
        { label: 'Category', value: 'Office supplies' },
      ],
      policyFlags: [
        {
          kind: 'missing_receipt',
          message: 'No receipt attached — required above ₹500.',
        },
      ],
      approvalRequest: {
        id: 'appr4',
        stage: 'manager',
        approverName: 'Rohit Verma',
        status: 'approved',
      },
      reimbursedAt: '2026-09-30T10:00:00+05:30',
      reimbursementBatchId: 'batch-sep',
    },
    {
      id: 'exp5',
      employeeId: 'emp-meera',
      employeeName: 'Meera Iyer',
      amount: 9999,
      categoryCode: 'professional_development',
      submittedAt: '2026-09-28T09:30:00+05:30',
      receiptDocumentId: 'doc-conf-9999',
      vendor: 'ReactConf India',
      receiptDate: '28 Sep 2026',
      note: 'Conference ticket — approved by Abhijeet ahead of the Sep batch.',
      extractedFields: [
        { label: 'Vendor', value: 'ReactConf India' },
        { label: 'Date', value: '28 Sep 2026' },
        { label: 'Amount', value: 9999 },
        { label: 'Category', value: 'Professional development' },
      ],
      policyFlags: [],
      approvalRequest: {
        id: 'appr5',
        stage: 'founder',
        approverName: 'Abhijeet Singh',
        status: 'approved',
      },
      reimbursedAt: '2026-09-30T10:00:00+05:30',
      reimbursementBatchId: 'batch-sep',
    },
  ],
  reimbursementBatches: [
    {
      id: 'batch-sep',
      payrollRunLabel: 'September salary',
      disbursedAt: '2026-09-30T10:00:00+05:30',
      scheduledDisbursementDate: '30 Sep 2026',
      claimIds: ['exp4', 'exp5'],
      totalAmount: 12339,
    },
    {
      id: 'batch-oct',
      payrollRunLabel: 'October salary',
      scheduledDisbursementDate: '31 Oct 2026',
      claimIds: [],
      totalAmount: 0,
    },
  ],
}

export class MockExpensesSource implements ExpensesSource {
  async getExpenses(): Promise<ExpensesData> {
    return MOCK_EXPENSES
  }

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}

  async submitExpense(_input: ExpenseInput): Promise<void> {}
}
