import type { PayrollSource } from '@/data/payrollSource'
import type { ApprovalDecision, PayrollRunInput } from '@/data/actions'
import type { FilingRecord, PayrollData, Payslip } from '@/types/payroll'

const LEGAL_ENTITY_ID = 'le-acme-labs'
const LEGAL_ENTITY_NAME = 'Acme Labs Pvt Ltd'

function pf(basic: number): { employee: number; employer: number } {
  return { employee: Math.round(basic * 0.12), employer: Math.round(basic * (0.0367 + 0.0833 + 0.005)) }
}

function esi(gross: number): { employee: number; employer: number } {
  if (gross > 21000) return { employee: 0, employer: 0 }
  return { employee: Math.round(gross * 0.0075), employer: Math.round(gross * 0.0325) }
}

const KARNATAKA_PT_MONTHLY = 200

function tds(gross: number): number {
  if (gross <= 60000) return 0
  if (gross <= 100000) return Math.round((gross - 60000) * 0.1)
  return Math.round(4000 + (gross - 100000) * 0.2)
}

function buildPayslip(input: {
  id: string
  runId: string
  employeeId: string
  name: string
  role: string
  pan: string
  uan: string
  bank: string
  basic: number
  hra: number
  special: number
  lta?: number
  issuedAt: string | null
  changeNote?: string
}): Payslip {
  const earnings = [
    { label: 'Basic', amount: input.basic },
    { label: 'House rent allowance', amount: input.hra },
    { label: 'Special allowance', amount: input.special },
    ...(input.lta ? [{ label: 'Leave travel allowance', amount: input.lta }] : []),
  ]
  const gross = earnings.reduce((sum, e) => sum + e.amount, 0)
  const pfAmounts = pf(input.basic)
  const esiAmounts = esi(gross)
  const ptAmount = KARNATAKA_PT_MONTHLY
  const tdsAmount = tds(gross)

  const deductions = [
    { component: 'pf_employee' as const, label: 'Employee PF (EPF 12%)', rate_description: '12% of basic', amount: pfAmounts.employee },
    ...(esiAmounts.employee > 0
      ? [{ component: 'esi_employee' as const, label: 'Employee ESI (0.75%)', rate_description: '0.75% of gross, capped at ₹21,000 gross', amount: esiAmounts.employee }]
      : []),
    { component: 'pt' as const, label: 'Professional tax', rate_description: 'Karnataka PT slab', amount: ptAmount },
    { component: 'tds' as const, label: 'Income tax (TDS)', rate_description: 'New regime bracket', amount: tdsAmount },
  ]

  const employerContributions = [
    { component: 'pf_employer' as const, label: 'Employer PF (3.67% + 8.33% + 0.5%)', rate_description: '12.5% of basic', amount: pfAmounts.employer },
    ...(esiAmounts.employer > 0
      ? [{ component: 'esi_employer' as const, label: 'Employer ESI (3.25%)', rate_description: '3.25% of gross, capped at ₹21,000 gross', amount: esiAmounts.employer }]
      : []),
  ]

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)

  return {
    payslip_id: input.id,
    payroll_run_id: input.runId,
    employee_id: input.employeeId,
    employee_name: input.name,
    employee_role: input.role,
    pan: input.pan,
    uan: input.uan,
    bank_account_masked: input.bank,
    paid_days: '31 of 31',
    gross_pay: gross,
    net_pay: gross - totalDeductions,
    tax_withheld: tdsAmount,
    issued_at: input.issuedAt,
    earnings,
    deductions,
    employerContributions,
    changeNote: input.changeNote,
  }
}

const OCT_RUN_ID = 'run-2026-10'
const SEP_RUN_ID = 'run-2026-09'

const octPayslips: Payslip[] = [
  buildPayslip({
    id: 'payslip-oct-priya',
    runId: OCT_RUN_ID,
    employeeId: 'emp-priya',
    name: 'Priya Raghavan',
    role: 'Product designer',
    pan: 'ABCPR····F',
    uan: '1012 3456 7890',
    bank: 'HDFC ···· 4821',
    basic: 62500,
    hra: 25000,
    special: 31250,
    lta: 6250,
    issuedAt: null,
    changeNote: 'CTC revision from 1 Oct',
  }),
  buildPayslip({
    id: 'payslip-oct-arjun',
    runId: OCT_RUN_ID,
    employeeId: 'emp-arjun',
    name: 'Arjun Mehta',
    role: 'Engineer',
    pan: 'ABCPA····G',
    uan: '1012 3456 7891',
    bank: 'ICICI ···· 2290',
    basic: 41000,
    hra: 16400,
    special: 20500,
    issuedAt: null,
    changeNote: '3 days loss-of-pay',
  }),
  buildPayslip({
    id: 'payslip-oct-sneha',
    runId: OCT_RUN_ID,
    employeeId: 'emp-sneha',
    name: 'Sneha Kulkarni',
    role: 'Engineer',
    pan: 'ABCPS····H',
    uan: '1012 3456 7892',
    bank: 'HDFC ···· 7734',
    basic: 48000,
    hra: 19200,
    special: 24000,
    issuedAt: null,
  }),
  buildPayslip({
    id: 'payslip-oct-rahul',
    runId: OCT_RUN_ID,
    employeeId: 'emp-rahul',
    name: 'Rahul Verma',
    role: 'Support lead',
    pan: 'ABCPV····I',
    uan: '1012 3456 7893',
    bank: 'Axis ···· 5512',
    basic: 32000,
    hra: 12800,
    special: 16000,
    issuedAt: null,
  }),
  buildPayslip({
    id: 'payslip-oct-kavya',
    runId: OCT_RUN_ID,
    employeeId: 'emp-kavya',
    name: 'Kavya Nair',
    role: 'Recruiter',
    pan: 'ABCPK····J',
    uan: '1012 3456 7894',
    bank: 'HDFC ···· 9981',
    basic: 36000,
    hra: 14400,
    special: 18000,
    issuedAt: null,
    changeNote: 'Joins 3 Nov — prorated next month',
  }),
]

const octGross = octPayslips.reduce((sum, p) => sum + p.gross_pay, 0)
const octNet = octPayslips.reduce((sum, p) => sum + p.net_pay, 0)

const sepPayslips: Payslip[] = octPayslips
  .filter((p) => p.employee_name !== 'Kavya Nair')
  .map((p) => ({
    ...p,
    payslip_id: p.payslip_id.replace('oct', 'sep'),
    payroll_run_id: SEP_RUN_ID,
    issued_at: '2026-09-30T10:00:00+05:30',
    changeNote: undefined,
  }))

const sepGross = sepPayslips.reduce((sum, p) => sum + p.gross_pay, 0)
const sepNet = sepPayslips.reduce((sum, p) => sum + p.net_pay, 0)

const sepFilings: FilingRecord[] = [
  { legal_entity_id: LEGAL_ENTITY_ID, scheme: 'EPF', period: '2026-09', filed_on: '2026-10-14', acknowledgement_no: 'EPFO-TRN-884210' },
  { legal_entity_id: LEGAL_ENTITY_ID, scheme: 'ESI', period: '2026-09', filed_on: '2026-10-14', acknowledgement_no: 'ESIC-TRN-220147' },
  { legal_entity_id: LEGAL_ENTITY_ID, scheme: 'PT', period: '2026-09', filed_on: '2026-10-05', acknowledgement_no: 'KA-PT-SEP26-0931' },
  { legal_entity_id: LEGAL_ENTITY_ID, scheme: 'TDS', period: '2026-09', filed_on: null, acknowledgement_no: null },
]

const MOCK_PAYROLL: PayrollData = {
  runs: [
    {
      payroll_run_id: OCT_RUN_ID,
      legal_entity_id: LEGAL_ENTITY_ID,
      legal_entity_name: LEGAL_ENTITY_NAME,
      period_start: '2026-10-01',
      period_end: '2026-10-31',
      period_label: 'October 2026',
      pay_date: '31 Oct 2026',
      status: 'awaiting_disbursal_approval',
      gross_total: octGross,
      net_total: octNet,
      anomaly_score: 0.18,
      anomaly_decision: 'escalated',
      approval_request_id: 'appr-run-oct',
      disbursed_at: null,
      payslip_ids: octPayslips.map((p) => p.payslip_id),
      employee_count: 14,
      joiners: 1,
      leavers: 0,
    },
    {
      payroll_run_id: SEP_RUN_ID,
      legal_entity_id: LEGAL_ENTITY_ID,
      legal_entity_name: LEGAL_ENTITY_NAME,
      period_start: '2026-09-01',
      period_end: '2026-09-30',
      period_label: 'September 2026',
      pay_date: '30 Sep 2026',
      status: 'filed',
      gross_total: sepGross,
      net_total: sepNet,
      anomaly_score: 0.04,
      anomaly_decision: 'clear',
      approval_request_id: 'appr-run-sep',
      disbursed_at: '2026-09-30T10:00:00+05:30',
      payslip_ids: sepPayslips.map((p) => p.payslip_id),
      employee_count: 13,
      joiners: 0,
      leavers: 0,
    },
  ],
  payslipsByRunId: {
    [OCT_RUN_ID]: octPayslips,
    [SEP_RUN_ID]: sepPayslips,
  },
  filingsByRunId: {
    [OCT_RUN_ID]: [],
    [SEP_RUN_ID]: sepFilings,
  },
}

export class MockPayrollSource implements PayrollSource {
  async getPayroll(): Promise<PayrollData> {
    return MOCK_PAYROLL
  }

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}

  async createPayrollRun(_input: PayrollRunInput): Promise<void> {}
}
