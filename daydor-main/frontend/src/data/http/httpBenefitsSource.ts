import type { BenefitsSource } from '@/data/benefitsSource'
import type { BenefitsData } from '@/types/benefits'
import type { ApprovalDecision, ElectionInput, PlanChangeInput } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpBenefitsSource implements BenefitsSource {
  getBenefits(): Promise<BenefitsData> {
    return http.get<BenefitsData>('/views/benefits')
  }

  elect(input: ElectionInput): Promise<void> {
    return http.post<void>('/benefits/elections', input)
  }

  proposePlanChange(input: PlanChangeInput): Promise<void> {
    return http.post<void>('/benefits/plan-changes', input)
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }
}
