import * as React from 'react'

import type { HiringSource } from '@/data/hiringSource'
import type { ApplicationStage, PipelineItem, RequisitionSummary } from '@/types/hiring'
import type { CandidateBlocker } from '@/components/daydor/CandidateCard'
import type { Status } from '@/components/daydor/Badge'
import type { StageBoardItem } from '@/components/daydor/StageBoard'
import { Badge } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { Dialog } from '@/components/daydor/Dialog'
import { FormDialog } from '@/components/daydor/FormDialog'
import { Input } from '@/components/daydor/Input'
import { ScreenState } from '@/components/daydor/ScreenState'
import { Select } from '@/components/daydor/Select'
import { Simulated } from '@/components/daydor/Simulated'
import { StageBoard } from '@/components/daydor/StageBoard'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'
import type { DirectoryPerson, OpenPosition } from '@/data/actions'

export interface HiringScreenProps {
  source: HiringSource
}

const STAGES: { key: ApplicationStage; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'background_check', label: 'Background check' },
  { key: 'hired', label: 'Hired' },
]

function formatINR(value: number): string {
  return '₹' + value.toLocaleString('en-IN')
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

function pipelineItemToCard(item: PipelineItem): StageBoardItem | null {
  const { application, candidate, screening, interview, offer, background_check: backgroundCheck } = item
  if (!candidate) return null

  let meta: string | undefined
  let signal: Status | undefined
  let signalNote: string | undefined
  let blocker: CandidateBlocker | undefined

  switch (application.stage) {
    case 'applied':
      meta = `Applied ${timeAgo(application.stage_changed_at)} · ${candidate.source}`
      blocker = { kind: 'agent', text: 'Daydor is screening' }
      break
    case 'screening':
      meta = candidate.source
      if (screening) {
        signal = screening.recommendation === 'shortlist' ? 'shortlist' : 'hold'
        signalNote = `Score ${screening.score}`
        if (screening.approval?.status === 'pending') {
          blocker = { kind: 'you', text: 'Needs you: shortlist?' }
        }
      }
      break
    case 'interview':
      meta = interview
        ? `Round · ${new Date(interview.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
        : undefined
      if (interview && !interview.recommendation) {
        blocker = { kind: 'you', text: 'Needs your feedback' }
      }
      break
    case 'offer':
      if (offer) {
        meta = `${formatINR(offer.proposed_base)} proposed`
        if (!offer.within_band && offer.approval?.status === 'pending') {
          blocker = { kind: 'you', text: 'Above band — needs you' }
        } else if (offer.accepted_at) {
          meta = `${formatINR(offer.proposed_base)} · accepted`
        }
      }
      break
    case 'background_check':
      if (offer?.accepted_at) meta = 'Offer accepted'
      if (backgroundCheck?.status === 'awaiting_consent') {
        signal = 'awaiting-consent'
        blocker = {
          kind: 'external',
          text: `Waiting on ${candidate.full_name.split(' ')[0]} to consent · sent ${timeAgo(backgroundCheck.consent_requested_at ?? application.stage_changed_at)}`,
        }
      } else if (backgroundCheck?.status === 'clear') {
        blocker = { kind: 'done', text: 'Cleared' }
      }
      break
    case 'hired':
      meta = 'Hired'
      blocker = { kind: 'done', text: 'Handed to Onboarding' }
      break
  }

  return {
    id: application.id,
    stage: application.stage,
    name: candidate.full_name,
    meta,
    signal,
    signalNote,
    blocker,
    selected: application.stage === 'offer' && !!offer && !offer.within_band && offer.approval?.status === 'pending',
  }
}

function budgetedSeats(req: RequisitionSummary): number {
  return req.candidate_count > 0 ? Math.max(1, Math.ceil(req.candidate_count / 6)) : 1
}

function filledSeats(pipeline: PipelineItem[]): number {
  return pipeline.filter((p) => p.application.stage === 'hired').length
}

const OPENS_ROLES = new Set(['tenant_founder', 'tenant_hr', 'tenant_manager'])

interface PendingDecision {
  id: string
  gate: string
  title: string
  summary?: string
  figures?: { label: string; value: number | string; note?: string }[]
  why?: string
  approveLabel?: string
}

export function HiringScreen({ source }: HiringScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getHiring(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [activeReqId, setActiveReqId] = React.useState<string | null>(null)
  const [openRoleOpen, setOpenRoleOpen] = React.useState(false)
  const [postingOpen, setPostingOpen] = React.useState(false)
  const [lookups, setLookups] = React.useState<{ positions: OpenPosition[]; people: DirectoryPerson[] } | null>(null)
  const [positionId, setPositionId] = React.useState('')
  const [managerId, setManagerId] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [payMin, setPayMin] = React.useState('')
  const [payMax, setPayMax] = React.useState('')
  const [dob, setDob] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [aadhaar, setAadhaar] = React.useState('')
  const [uan, setUan] = React.useState('')
  const [esic, setEsic] = React.useState('')

  const hiring = load.data
  if (!hiring) return <ScreenState error={load.error} onRetry={load.reload} />

  const canOpenRole = OPENS_ROLES.has(session.role)
  const openRole = () => {
    setOpenRoleOpen(true)
    if (!lookups) {
      void Promise.all([source.listOpenPositions(), source.listPeople()]).then(
        ([positions, people]) => {
          setLookups({ positions, people })
          setPositionId(positions[0]?.id ?? '')
          setManagerId(people[0]?.id ?? '')
        },
        () => setLookups({ positions: [], people: [] }),
      )
    }
  }
  const roleInvalid = !lookups
    ? 'Loading the open seats…'
    : lookups.positions.length === 0
      ? 'There is no open seat to hire for. A seat is opened in the company structure first.'
      : !positionId || !managerId
        ? 'Choose the seat and who manages it.'
        : !startDate
          ? 'Choose the day they should start.'
          : !(Number(payMin) > 0) || !(Number(payMax) >= Number(payMin))
            ? 'Enter the pay range, lowest to highest (₹ a year).'
            : null

  const requisitions = hiring.requisitions
  const active = requisitions.find((r) => r.id === activeReqId) ?? requisitions[0]
  const detail = active ? hiring.details[active.id] : undefined
  const pipeline = detail?.pipeline ?? []

  const items: StageBoardItem[] = pipeline.map(pipelineItemToCard).filter((c): c is StageBoardItem => c !== null)

  const pending: PendingDecision[] = []
  if (active?.approval?.status === 'pending') {
    pending.push({ id: active.approval.id, gate: active.approval.gate_type, title: `Approve the budget to hire a ${active.job_title}`, summary: 'The role is posted once this is approved.' })
  }
  for (const p of pipeline) {
    const who = p.candidate?.full_name ?? 'the candidate'
    if (p.screening?.approval?.status === 'pending') {
      pending.push({ id: p.screening.approval.id, gate: p.screening.approval.gate_type, title: `Shortlist ${who}?`, summary: `An automated screen scored ${p.screening.score}; a person decides.`, why: 'Automated screening never decides on its own.' })
    }
    if (p.offer && !p.offer.within_band && p.offer.approval?.status === 'pending') {
      pending.push({
        id: p.offer.approval.id,
        gate: p.offer.approval.gate_type,
        title: `Approve an offer above band for ${who}`,
        figures: [
          { label: 'Proposed CTC', value: p.offer.proposed_base, note: p.offer.band ? `band ${formatINR(p.offer.band.band_min)}–${formatINR(p.offer.band.band_max)}` : undefined },
          { label: 'Above band', value: p.offer.band ? p.offer.proposed_base - p.offer.band.band_max : 0 },
        ],
        why: "Budget policy: any offer outside the approved band needs a founder's sign-off.",
        approveLabel: `Approve ${formatINR(p.offer.proposed_base)} offer`,
      })
    }
  }

  const seats = active ? `${filledSeats(pipeline)}/${budgetedSeats(active)} seats filled` : ''
  const band = active?.posting ? `band ${formatINR(active.posting.pay_range_min)}–${formatINR(active.posting.pay_range_max)}` : null
  const channels = active?.posting ? `posted on ${active.posting.channel}` : 'not yet posted'
  const openButton = canOpenRole ? (
    <Button variant="primary" size="sm" onClick={openRole}>
      Open a role
    </Button>
  ) : undefined
  const detailsInvalid = !dob ? 'Enter the date of birth.' : address.trim().length < 3 ? 'Enter the home address.' : !/^\d{4}$/.test(aadhaar) ? 'Enter the last four digits of the Aadhaar number.' : null

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <main className="flex min-h-0 min-w-0 flex-col">
        <ScrollArea className="flex-1">
          <div className="mx-auto flex min-w-0 max-w-[1080px] flex-col gap-6 px-8 py-6">
            {!active && (
              <PageHeader eyebrow={['Hiring']} title="Hiring" description="No role is open yet." actions={openButton} />
            )}
            {active && (
              <PageHeader
                eyebrow={['Hiring']}
                title={active.job_title}
                description={`${seats}${band ? ` · ${band}` : ''} · ${channels}`}
                actions={
                  <>
                    {active.posting && (
                      <Button variant="secondary" size="sm" onClick={() => setPostingOpen(true)}>
                        View posting
                      </Button>
                    )}
                    {openButton}
                  </>
                }
                tabs={requisitions.map((r) => ({
                  label: r.job_title,
                  active: r.id === active.id,
                  count: r.candidate_count || undefined,
                  onClick: () => setActiveReqId(r.id),
                }))}
              />
            )}

            {active?.threshold_heads_up && (
              <div className="flex items-start gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] leading-[18px] text-ink-muted">
                <Badge status="pending" />
                <span>
                  Filling this seat brings headcount to{' '}
                  <strong className="font-medium text-ink">{active.threshold_heads_up.headcount_at_check + 1}</strong> — crossing the{' '}
                  <strong className="font-medium text-ink">{active.threshold_heads_up.scheme}</strong> threshold of{' '}
                  {active.threshold_heads_up.threshold}.
                </span>
              </div>
            )}

            {detail?.awaiting === 'new_hire_details' &&
              (session.role === 'tenant_hr' ? (
                <div className="flex flex-col gap-4 rounded-lg border border-warning/30 bg-warning-soft p-5">
                  <div>
                    <h3 className="m-0 text-[15px] font-semibold text-ink">Record the new hire's details</h3>
                    <p className="m-0 mt-1 text-small text-ink-muted">The hire cannot go on until you do. These are kept encrypted in the database and are never sent through the workflow.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                    <Input label="Aadhaar (last 4 digits)" inputMode="numeric" maxLength={4} value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
                    <div className="col-span-2">
                      <Input label="Home address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <Input label="UAN" optional value={uan} onChange={(e) => setUan(e.target.value)} />
                    <Input label="ESIC IP number" optional value={esic} onChange={(e) => setEsic(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-ink-muted">{detailsInvalid}</span>
                    <Button
                      variant="primary"
                      disabled={!!detailsInvalid}
                      loading={isBusy('details')}
                      onClick={() =>
                        void run(
                          'details',
                          () => source.recordNewHireDetails(active!.id, { date_of_birth: dob, personal_address: address.trim(), aadhaar_last4: aadhaar, ...(uan ? { uan_number: uan } : {}), ...(esic ? { esic_ip_number: esic } : {}) }),
                          { success: 'Details recorded' },
                        ).then((ok) => {
                          if (ok) {
                            setDob('')
                            setAddress('')
                            setAadhaar('')
                            setUan('')
                            setEsic('')
                          }
                        })
                      }
                    >
                      Record details
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="m-0 rounded-lg border border-line bg-surface px-4 py-3 text-small text-ink-muted">Waiting for HR to record the new hire's details.</p>
              ))}

            {pending.map((d) => (
              <DecisionCard
                key={d.id}
                domain="Hiring"
                gate={d.gate}
                writeClass="guarded"
                title={d.title}
                summary={d.summary}
                figures={d.figures}
                why={d.why}
                approveLabel={d.approveLabel}
                canDecide={canDecide(d.gate)}
                busy={isBusy(`decide:${d.id}`)}
                onApprove={() => void run(`decide:${d.id}`, () => source.resolveApproval(d.id, 'approved'), { success: 'Approved' })}
                onDecline={(note) => void run(`decide:${d.id}`, () => source.resolveApproval(d.id, 'rejected', note), { success: 'Declined' })}
              />
            ))}

            {active && pipeline.length > 0 ? (
              <StageBoard stages={STAGES} items={items} />
            ) : active ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-line py-12 text-[13px] text-ink-muted">
                {active.stage === 'awaiting_budget_approval'
                  ? 'Awaiting budget approval before this role can be posted.'
                  : active.stage === 'budget_rejected'
                    ? 'Budget was rejected for this role.'
                    : active.stage === 'drafting'
                      ? 'This requisition is still in drafting and has not been posted.'
                      : 'No applicants yet.'}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </main>

      <FormDialog
        open={openRoleOpen}
        title="Open a role"
        description="Daydor takes the pay band, legal entity and location from the seat. The founder approves the budget before the role is posted."
        submitLabel="Open the role"
        invalid={roleInvalid}
        busy={isBusy('open-role')}
        onClose={() => setOpenRoleOpen(false)}
        onSubmit={() =>
          run('open-role', () => source.startHiring({ position_id: positionId, hiring_manager_id: managerId, target_start_date: startDate, pay_range_min: Number(payMin), pay_range_max: Number(payMax) }), {
            success: 'Role opened: waiting for the budget approval',
          })
        }
      >
        <Select label="Seat" options={(lookups?.positions ?? []).map((p) => ({ value: p.id, label: p.label }))} value={positionId} onChange={setPositionId} />
        <Select label="Hiring manager" options={(lookups?.people ?? []).map((p) => ({ value: p.id, label: p.name }))} value={managerId} onChange={setManagerId} />
        <Input label="Start by" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Pay from (₹ a year)" type="number" min={1} value={payMin} onChange={(e) => setPayMin(e.target.value)} />
          <Input label="Pay to (₹ a year)" type="number" min={1} value={payMax} onChange={(e) => setPayMax(e.target.value)} />
        </div>
      </FormDialog>

      {active?.posting && (
        <Dialog open={postingOpen} onClose={() => setPostingOpen(false)} title={`Posting: ${active.job_title}`} confirmLabel="Close" onConfirm={() => setPostingOpen(false)}
          description={`${formatINR(active.posting.pay_range_min)}–${formatINR(active.posting.pay_range_max)} a year`}>
          <dl className="m-0 mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-small">
            <dt className="text-ink-muted">Channel</dt>
            <dd className="m-0 text-ink">{active.posting.channel} <Simulated why="The job board is simulated: nothing was published outside Daydor." /></dd>
            <dt className="text-ink-muted">Posted</dt>
            <dd className="m-0 text-ink">{new Date(active.posting.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
            <dt className="text-ink-muted">Pay range shown</dt>
            <dd className="m-0 text-ink">{active.posting.pay_transparency_checked ? 'Yes, checked' : 'Not checked'}</dd>
          </dl>
        </Dialog>
      )}
    </div>
  )
}
