import type { BenefitsData } from '@/types/benefits'
import type { ApprovalDecision, ElectionInput, PlanChangeInput } from '@/data/actions'

/**
 * Data-fetching contract for the Benefits screen. A real implementation
 * (backed by the HTTP API once it exists) can replace MockBenefitsSource
 * without any change to the components that consume it.
 */
export interface BenefitsSource {
  getBenefits(): Promise<BenefitsData>
  /** An employee chooses a plan; the enrolment workflow sends it to the carrier. */
  elect(input: ElectionInput): Promise<void>
  /** HR or the founder proposes a change to the plan catalogue; the founder decides it. */
  proposePlanChange(input: PlanChangeInput): Promise<void>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
}
