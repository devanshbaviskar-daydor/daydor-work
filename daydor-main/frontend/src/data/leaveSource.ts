import type { LeaveData } from '@/types/leave'
import type { ApprovalDecision, LeaveRequestInput } from '@/data/actions'

/**
 * Data-fetching contract for the Leave & Attendance screen. MockLeaveSource and
 * HttpLeaveSource both implement it; pick one via src/data/sources.ts.
 */
export interface LeaveSource {
  getLeave(): Promise<LeaveData>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
  submitLeaveRequest(input: LeaveRequestInput): Promise<void>
}
