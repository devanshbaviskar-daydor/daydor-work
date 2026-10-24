import type { PayrollData } from '@/types/payroll'
import type { ApprovalDecision, PayrollRunInput } from '@/data/actions'

/**
 * Data-fetching contract for the Payroll screen. MockPayrollSource and
 * HttpPayrollSource both implement it; pick one via src/data/sources.ts.
 */
export interface PayrollSource {
  getPayroll(): Promise<PayrollData>
  /** "Approve & release": resolves the run's approval request. */
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
  createPayrollRun(input: PayrollRunInput): Promise<void>
}
