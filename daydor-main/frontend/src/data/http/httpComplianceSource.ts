import type { ComplianceSource } from '@/data/complianceSource'
import type { ComplianceData } from '@/types/compliance'
import type { ApprovalDecision } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpComplianceSource implements ComplianceSource {
  getCompliance(): Promise<ComplianceData> {
    return http.get<ComplianceData>('/views/compliance')
  }

  completeTask(taskId: string): Promise<void> {
    return http.post<void>(`/compliance/tasks/${encodeURIComponent(taskId)}/complete`)
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }
}
