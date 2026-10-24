export type PlanType = 'GMC' | 'GPA' | 'GTL'

export type CoverageTier = 'employee_only' | 'employee_spouse_children' | 'employee_spouse_children_parents'

export type CostSplitPayer = 'employer' | 'employee'

export interface BenefitPlan {
  id: string
  planType: PlanType
  carrier: string
  planYear: string
  employerContribution: number
  coverageTier: CoverageTier
  costSplit: {
    selfSpouseChildren: CostSplitPayer
    parents: CostSplitPayer
    topUps: CostSplitPayer
  }
  estimatedAnnualCost: number
  renewsOn: string
}

export type ElectionStatus = 'pending_confirmation' | 'active'

export interface Dependent {
  id: string
  fullName: string
  relationship: 'spouse' | 'child' | 'parent'
  dateOfBirth: string
  coveredPlanIds: string[]
}

export interface LifeEvent {
  id: string
  eventType: 'marriage' | 'birth' | 'new_hire'
  eventDate: string
  status: 'open' | 'closed'
  windowClosesAt: string
}

export interface BenefitElection {
  id: string
  employeeId: string
  employeeName: string
  benefitPlanId: string
  coverageTier: CoverageTier
  employeeCost: number
  status: ElectionStatus
  effectiveFrom: string
  lifeEventId?: string
  windowClosesAt?: string
  dependents: Dependent[]
}

/** A change to the plan catalogue that HR or the founder proposed and the founder has yet to approve (g_benefit_plan). */
export interface ProposedPlanChange {
  id: string
  planType: PlanType
  carrier: string
  planYear: string
  employerContribution: number
  status: 'awaiting_founder'
  replacesPlanId?: string
  approvalRequestId?: string
  /** Whether the signed-in role may decide it, and why not (see Decision in types/home.ts). */
  canDecide?: boolean
  cannotDecideReason?: string
}

export interface BenefitsData {
  plans: BenefitPlan[]
  elections: BenefitElection[]
  /** Present only for the roles that may see proposals (HR, founder). */
  proposedChanges?: ProposedPlanChange[]
}
