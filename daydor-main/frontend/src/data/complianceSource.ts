import type { ComplianceData } from '@/types/compliance'
import type { ApprovalDecision } from '@/data/actions'

/**
 * Data-fetching contract for the Compliance screen. A real implementation
 * (backed by the HTTP API once it exists) can replace MockComplianceSource
 * without any change to the components that consume it.
 */
export interface ComplianceSource {
  getCompliance(): Promise<ComplianceData>
  /** Tick a task off its checklist (founder or HR). */
  completeTask(taskId: string): Promise<void>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
}
