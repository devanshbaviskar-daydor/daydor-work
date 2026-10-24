import * as React from 'react'

import type { BenefitsSource } from '@/data/benefitsSource'
import type { BenefitElection, BenefitPlan, BenefitsData, CoverageTier, PlanType } from '@/types/benefits'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { Badge } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { FactList } from '@/components/daydor/FactList'
import { FormDialog } from '@/components/daydor/FormDialog'
import { Input } from '@/components/daydor/Input'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScreenState } from '@/components/daydor/ScreenState'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select } from '@/components/daydor/Select'
import { Simulated } from '@/components/daydor/Simulated'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'
import type { CoverageTierCode } from '@/data/actions'

export interface BenefitsScreenProps {
  source: BenefitsSource
}

const PLAN_CATALOG: Record<PlanType, { icon: 'heart' | 'shield' | 'user'; title: string; description: string }> = {
  GMC: { icon: 'heart', title: 'Group health (GMC)', description: 'Hospitalisation cover for employees and their families.' },
  GPA: { icon: 'shield', title: 'Group accident (GPA)', description: 'Accidental death and disability, 24×7.' },
  GTL: { icon: 'user', title: 'Group term life (GTL)', description: 'Life cover paid to the nominee.' },
}

const COVERAGE_TIER_LABELS: Record<CoverageTier, string> = {
  employee_only: 'Employee only',
  employee_spouse_children: 'Employee, spouse, children',
  employee_spouse_children_parents: 'Also parents (employee pays)',
}

function coverageTierLabel(tier: string): string {
  return COVERAGE_TIER_LABELS[tier as CoverageTier] ?? tier
}

function countPeopleCovered(elections: BenefitElection[]): number {
  const employeeIds = new Set(elections.map((e) => e.employeeId))
  const dependentCount = elections.reduce((sum, e) => sum + e.dependents.length, 0)
  return employeeIds.size + dependentCount
}

function PlanPanel({ plans, elections }: { plans: BenefitPlan[]; elections: BenefitElection[] }) {
  const totalAnnual = plans.reduce((sum, p) => sum + p.estimatedAnnualCost, 0)
  const peopleCovered = countPeopleCovered(elections)

  return (
    <div className="grid grid-cols-[1fr_320px] items-start gap-6">
      <div className="flex flex-col gap-3">
        {plans.length === 0 && <p className="m-0 rounded-lg border border-line bg-surface p-5 text-body text-ink-muted">No plans are set up yet.</p>}
        {plans.map((plan) => {
          const catalog = PLAN_CATALOG[plan.planType]
          return (
            <div key={plan.id} className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body font-medium text-ink">{catalog.title}</span>
                <span className="text-[12px] text-ink-muted">est. ₹{plan.estimatedAnnualCost.toLocaleString('en-IN')} / yr</span>
              </div>
              <p className="m-0 text-small text-ink-muted">{catalog.description}</p>
              <p className="m-0 text-small text-ink-muted">
                {plan.carrier} · {plan.planYear} · most people chose “{coverageTierLabel(plan.coverageTier)}” · company pays self, spouse and children; parents and top-ups are paid by the employee
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-title text-ink">What this costs</h2>
        <FactList
          items={[
            { label: 'Per year', value: totalAnnual },
            { label: 'People covered', value: `${peopleCovered}` },
            { label: 'Renews', value: plans[0]?.renewsOn ?? '—' },
          ]}
        />
      </div>
    </div>
  )
}

function MyBenefitsPanel({ data }: { data: BenefitsData }) {
  const planById = new Map(data.plans.map((p) => [p.id, p]))

  return (
    <div className="flex flex-col gap-3">
      {data.elections.map((election) => {
        const plan = planById.get(election.benefitPlanId)
        return (
          <div key={election.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-body font-medium text-ink">{election.employeeName}</span>
                <span className="text-[13px] text-ink-muted">
                  {plan ? PLAN_CATALOG[plan.planType].title : election.benefitPlanId} · {coverageTierLabel(election.coverageTier)}
                </span>
              </div>
              <span className="flex items-center gap-2"><Badge status={election.status}>
                {election.status === 'pending_confirmation' ? 'Pending confirmation' : 'Active'}
              </Badge>
              {election.status === 'active' && <Simulated why="The carrier is simulated: the enrolment was recorded, nothing was sent to an insurer." />}</span>
            </div>

            {election.status === 'pending_confirmation' && election.windowClosesAt && (
              <p className="m-0 text-[13px] text-ink-muted">Enrolment window closes {election.windowClosesAt}.</p>
            )}

            {election.dependents.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                {election.dependents.map((dep) => (
                  <span
                    key={dep.id}
                    className="rounded-sm bg-surface-sunken px-2 py-1 text-[12px] text-ink-muted"
                  >
                    {dep.fullName} · {dep.relationship}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const TIER_OPTIONS = (Object.entries(COVERAGE_TIER_LABELS) as [CoverageTier, string][]).map(([value, label]) => ({ value, label }))
const PLAN_TYPE_OPTIONS = (Object.keys(PLAN_CATALOG) as PlanType[]).map((value) => ({ value, label: PLAN_CATALOG[value].title }))

function firstOfNextMonth(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1)).toISOString().slice(0, 10)
}

export function BenefitsScreen({ source }: BenefitsScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getBenefits(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [electOpen, setElectOpen] = React.useState(false)
  const [changeOpen, setChangeOpen] = React.useState(false)
  const [planId, setPlanId] = React.useState('')
  const [tier, setTier] = React.useState<CoverageTierCode>('employee_only')
  const [premium, setPremium] = React.useState('')
  const [effective, setEffective] = React.useState(firstOfNextMonth)
  const [pType, setPType] = React.useState<PlanType>('GMC')
  const [carrier, setCarrier] = React.useState('')
  const [pYear, setPYear] = React.useState(() => String(new Date().getFullYear()))
  const [contribution, setContribution] = React.useState('')
  const [replaces, setReplaces] = React.useState('')

  const data = load.data
  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const parents = tier === 'employee_spouse_children_parents'
  const canElect = session.employee_id !== null && data.plans.length > 0
  const canPropose = session.role === 'tenant_hr' || session.role === 'tenant_founder'
  const electInvalid = !planId ? 'Choose a plan.' : parents && !(Number(premium) > 0) ? "Enter the premium for your parents' cover, as HR quoted it." : !effective ? 'Choose the day cover starts.' : null
  const changeInvalid = !carrier.trim() ? 'Name the carrier.' : !(Number(pYear) >= 2020) ? 'Enter the plan year.' : !(Number(contribution) >= 0) || contribution === '' ? 'Enter what the company contributes.' : null

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-8 px-12 py-8">
          <section className="flex flex-col gap-5">
            <PageHeader
              eyebrow={['Benefits']}
              title="Group benefits"
              description="The plans your company offers and who is enrolled. A change to the plans is proposed by HR and decided by the founder."
              actions={
                <>
                  {canElect && (
                    <Button
                      variant="primary"
                      icon="heart"
                      onClick={() => {
                        setPlanId(data.plans[0].id)
                        setElectOpen(true)
                      }}
                    >
                      Choose a plan
                    </Button>
                  )}
                  {canPropose && (
                    <Button icon="file" onClick={() => setChangeOpen(true)}>
                      Propose a plan change
                    </Button>
                  )}
                </>
              }
            />

            {(data.proposedChanges ?? []).map((c) => (
              <DecisionCard
                key={c.id}
                domain="Benefits"
                gate="Plan change"
                writeClass="guarded"
                title={`${c.replacesPlanId ? 'Change' : 'Add'} ${PLAN_CATALOG[c.planType].title} with ${c.carrier}, ${c.planYear}`}
                summary={`The company would contribute ₹${c.employerContribution.toLocaleString('en-IN')}. Nothing changes until the founder approves.`}
                canDecide={c.approvalRequestId ? (c.canDecide !== undefined ? c.canDecide : canDecide('g_benefit_plan')) : false}
                cannotDecideReason={c.approvalRequestId ? c.cannotDecideReason : 'Being prepared: the request for the founder is not raised yet.'}
                busy={isBusy(`decide:${c.id}`)}
                onApprove={() => void run(`decide:${c.id}`, () => source.resolveApproval(c.approvalRequestId!, 'approved'), { success: 'Plan change approved' })}
                onDecline={(note) => void run(`decide:${c.id}`, () => source.resolveApproval(c.approvalRequestId!, 'rejected', note), { success: 'Plan change declined' })}
              />
            ))}

            <PlanPanel plans={data.plans} elections={data.elections} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-title text-ink">{session.role === 'tenant_employee' ? 'My benefits' : 'Enrolments'}</h2>
            {data.elections.length === 0 && <p className="m-0 text-small text-ink-muted">Nobody is enrolled yet.</p>}
            <MyBenefitsPanel data={data} />
          </section>
        </div>
      </ScrollArea>

      <FormDialog
        open={electOpen}
        title="Choose a plan"
        description="Your choice is recorded and sent to the carrier."
        submitLabel="Enrol"
        invalid={electInvalid}
        busy={isBusy('elect')}
        onClose={() => setElectOpen(false)}
        onSubmit={() =>
          run(
            'elect',
            () =>
              source.elect({
                employee_id: session.employee_id!,
                benefit_plan_id: planId,
                coverage_tier: tier,
                employee_cost: parents ? Number(premium) : 0,
                effective_from: effective,
              }),
            { success: 'Enrolment recorded' },
          )
        }
      >
        <Select label="Plan" options={data.plans.map((p) => ({ value: p.id, label: `${PLAN_CATALOG[p.planType].title} · ${p.carrier} ${p.planYear}` }))} value={planId} onChange={setPlanId} />
        <Select label="Who is covered" options={TIER_OPTIONS} value={tier} onChange={(v) => setTier(v as CoverageTierCode)} />
        {parents && <Input label="Premium for parents (₹ a year, from HR)" type="number" min={1} value={premium} onChange={(e) => setPremium(e.target.value)} />}
        <Input label="Cover starts" type="date" value={effective} onChange={(e) => setEffective(e.target.value)} />
      </FormDialog>

      <FormDialog
        open={changeOpen}
        title="Propose a plan change"
        description="The founder decides it. The plans do not change before that."
        submitLabel="Propose"
        invalid={changeInvalid}
        busy={isBusy('change')}
        onClose={() => setChangeOpen(false)}
        onSubmit={() =>
          run(
            'change',
            () =>
              source.proposePlanChange({
                plan_type: pType,
                carrier: carrier.trim(),
                plan_year: Number(pYear),
                employer_contribution: Number(contribution),
                ...(replaces ? { replaces_plan_id: replaces } : {}),
              }),
            { success: 'Proposed to the founder' },
          ).then((ok) => {
            if (ok) setCarrier('')
            return ok
          })
        }
      >
        <Select label="Kind of plan" options={PLAN_TYPE_OPTIONS} value={pType} onChange={(v) => setPType(v as PlanType)} />
        <Input label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Plan year (starting)" type="number" value={pYear} onChange={(e) => setPYear(e.target.value)} />
          <Input label="Company contributes (₹)" type="number" min={0} value={contribution} onChange={(e) => setContribution(e.target.value)} />
        </div>
        <Select
          label="Replaces"
          optional
          options={[{ value: '', label: 'Nothing: a new plan' }, ...data.plans.map((p) => ({ value: p.id, label: `${PLAN_CATALOG[p.planType].title} · ${p.carrier} ${p.planYear}` }))]}
          value={replaces}
          onChange={setReplaces}
        />
      </FormDialog>
    </div>
  )
}
