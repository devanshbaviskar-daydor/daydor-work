import type { LeaveSource } from '@/data/leaveSource'
import type { LeaveData } from '@/types/leave'
import type { ApprovalDecision, LeaveRequestInput } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpLeaveSource implements LeaveSource {
  getLeave(): Promise<LeaveData> {
    return http.get<LeaveData>('/views/leave')
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }

  submitLeaveRequest(input: LeaveRequestInput): Promise<void> {
    return http.post<void>('/leave-requests', input)
  }
}
