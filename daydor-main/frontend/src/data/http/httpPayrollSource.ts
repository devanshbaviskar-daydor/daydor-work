import type { PayrollSource } from '@/data/payrollSource'
import type { PayrollData } from '@/types/payroll'
import type { ApprovalDecision, PayrollRunInput } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpPayrollSource implements PayrollSource {
  getPayroll(): Promise<PayrollData> {
    return http.get<PayrollData>('/views/payroll')
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }

  createPayrollRun(input: PayrollRunInput): Promise<void> {
    return http.post<void>('/payroll/runs', input)
  }
}
