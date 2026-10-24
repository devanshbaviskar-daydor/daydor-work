import type { BenefitsSource } from '@/data/benefitsSource'
import type { BenefitsData } from '@/types/benefits'
import type { ApprovalDecision, ElectionInput, PlanChangeInput } from '@/data/actions'

const MOCK_BENEFITS: BenefitsData = {
  plans: [
    {
      id: 'plan-gmc-2026',
      planType: 'GMC',
      carrier: 'Niva Bupa',
      planYear: '2026-27',
      employerContribution: 184000,
      coverageTier: 'employee_spouse_children',
      costSplit: {
        selfSpouseChildren: 'employer',
        parents: 'employee',
        topUps: 'employee',
      },
      estimatedAnnualCost: 184000,
      renewsOn: '2027-04-01',
    },
  ],
  elections: [
    {
      id: 'elec-1',
      employeeId: 'emp-arjun',
      employeeName: 'Arjun Mehta',
      benefitPlanId: 'plan-gmc-2026',
      coverageTier: 'employee_spouse_children',
      employeeCost: 0,
      status: 'active',
      effectiveFrom: '2026-04-01',
      dependents: [
        {
          id: 'dep-1',
          fullName: 'Neha Mehta',
          relationship: 'spouse',
          dateOfBirth: '1992-06-14',
          coveredPlanIds: ['plan-gmc-2026'],
        },
      ],
    },
    {
      id: 'elec-2',
      employeeId: 'emp-kavya',
      employeeName: 'Kavya Rao',
      benefitPlanId: 'plan-gmc-2026',
      coverageTier: 'employee_only',
      employeeCost: 0,
      status: 'pending_confirmation',
      effectiveFrom: '2026-11-05',
      lifeEventId: 'life-1',
      windowClosesAt: '2026-11-20',
      dependents: [],
    },
    {
      id: 'elec-3',
      employeeId: 'emp-rohit',
      employeeName: 'Rohit Sharma',
      benefitPlanId: 'plan-gmc-2026',
      coverageTier: 'employee_spouse_children_parents',
      employeeCost: 4200,
      status: 'active',
      effectiveFrom: '2026-04-01',
      dependents: [
        {
          id: 'dep-2',
          fullName: 'Sunita Sharma',
          relationship: 'parent',
          dateOfBirth: '1962-02-02',
          coveredPlanIds: ['plan-gmc-2026'],
        },
        {
          id: 'dep-3',
          fullName: 'Priya Sharma',
          relationship: 'spouse',
          dateOfBirth: '1990-09-21',
          coveredPlanIds: ['plan-gmc-2026'],
        },
      ],
    },
  ],
}

export class MockBenefitsSource implements BenefitsSource {
  async getBenefits(): Promise<BenefitsData> {
    return MOCK_BENEFITS
  }

  async elect(_input: ElectionInput): Promise<void> {}

  async proposePlanChange(_input: PlanChangeInput): Promise<void> {}

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}
}
