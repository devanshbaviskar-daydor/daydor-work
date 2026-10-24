import type { HiringData } from '@/types/hiring'
import type { ApprovalDecision, DirectoryPerson, HireStartInput, NewHireDetailsInput, OpenPosition } from '@/data/actions'

/**
 * Data-fetching contract for the Hiring screen. MockHiringSource and
 * HttpHiringSource both implement it; pick one via src/data/sources.ts.
 */
export interface HiringSource {
  getHiring(): Promise<HiringData>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
  startHiring(input: HireStartInput): Promise<void>
  /** Seats a role can be opened for (read-only lookups for the form). */
  listOpenPositions(): Promise<OpenPosition[]>
  listPeople(): Promise<DirectoryPerson[]>
  /** HR records the new hire's personal details once there is a hire to record them for. */
  recordNewHireDetails(requisitionId: string, input: NewHireDetailsInput): Promise<void>
}
