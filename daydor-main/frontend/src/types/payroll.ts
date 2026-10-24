export type PayrollRunStatus =
  | 'draft'
  | 'built'
  | 'anomaly_check'
  | 'awaiting_disbursal_approval'
  | 'disbursed'
  | 'payslips_issued'
  | 'filed'

export type AnomalyDecision = 'clear' | 'escalated'

/**
 * Mirrors Daydor-Build's `payroll_run` table and run-lifecycle endpoints
 * (`POST /runs`, `/request-disbursal`, `/disburse`, `/issue-payslips`, `/file`) —
 * field names kept exact per the co-founder's API comparison, domain 2.
 */
export interface PayrollRun {
  payroll_run_id: string
  legal_entity_id: string
  legal_entity_name: string
  period_start: string
  period_end: string
  period_label: string
  pay_date: string
  status: PayrollRunStatus
  gross_total: number
  net_total: number
  anomaly_score: number | null
  anomaly_decision?: AnomalyDecision
  approval_request_id: string | null
  disbursed_at: string | null
  payslip_ids: string[]
  employee_count: number
  joiners: number
  leavers: number
}

/**
 * daydor's own differentiator (Product Spec §2.4): four named statutory
 * calculators, not Daydor-Build's generic component_code/amount pair.
 */
export type StatutoryComponent = 'pf_employee' | 'pf_employer' | 'esi_employee' | 'esi_employer' | 'pt' | 'tds'

export interface PayslipLine {
  component: StatutoryComponent
  label: string
  rate_description: string
  amount: number
}

export interface PayslipEarning {
  label: string
  amount: number
}

/** Mirrors Daydor-Build's `payslip` table field names exactly. */
export interface Payslip {
  payslip_id: string
  payroll_run_id: string
  employee_id: string
  employee_name: string
  employee_role: string
  pan: string
  uan: string
  bank_account_masked: string
  paid_days: string
  gross_pay: number
  net_pay: number
  tax_withheld: number
  issued_at: string | null
  earnings: PayslipEarning[]
  deductions: PayslipLine[]
  employerContributions: PayslipLine[]
  changeNote?: string
}

/** For the compliance-filing side of a run — one per (legal entity, scheme, period). */
export interface FilingRecord {
  legal_entity_id: string
  scheme: string
  period: string
  filed_on: string | null
  acknowledgement_no: string | null
}

export interface PayrollData {
  runs: PayrollRun[]
  payslipsByRunId: Record<string, Payslip[]>
  filingsByRunId: Record<string, FilingRecord[]>
}
