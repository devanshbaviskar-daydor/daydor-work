import * as React from 'react'

import type { ComplianceSource } from '@/data/complianceSource'
import type { ChecklistItem, ComplianceData, FilingRecord, FilingStatus, ThresholdObligation } from '@/types/compliance'
import { Amount } from '@/components/daydor/Amount'
import { Badge, type Status } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { Icon } from '@/components/daydor/Icon'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ScreenState } from '@/components/daydor/ScreenState'
import { Simulated } from '@/components/daydor/Simulated'
import { StatRow } from '@/components/daydor/StatRow'
import { Table } from '@/components/daydor/Table'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'

function filingBadgeStatus(status: FilingStatus): Status {
  if (status === 'filed') return 'filed'
  if (status === 'overdue') return 'overdue'
  if (status === 'needs-you') return 'needs-you'
  return 'upcoming'
}

function isRegistrationOverdue(obligation: ThresholdObligation): boolean {
  if (!obligation.registrationDeadline) return false
  return obligation.registrationDeadline < new Date().toISOString().slice(0, 10)
}

function filingBadgeLabel(status: FilingStatus): string {
  if (status === 'filed') return 'Filed'
  if (status === 'overdue') return 'Overdue'
  if (status === 'needs-you') return 'Needs you'
  return 'Upcoming'
}

function ChecklistRow({ item, onComplete, busy }: { item: ChecklistItem; onComplete?: () => void; busy?: boolean }) {
  const done = item.status === 'done'
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span
        className={done ? 'mt-0.5 text-success' : 'mt-0.5 text-ink-muted'}
      >
        <Icon name={done ? 'check' : 'clock'} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={done ? 'm-0 text-small text-ink-muted line-through' : 'm-0 text-small text-ink'}>{item.title}</p>
        {!done && item.dueDate && <p className="m-0 text-[12px] text-ink-muted">Due {item.dueDate}</p>}
      </div>
      {item.blocking && !done && <Badge status="overdue">Blocking</Badge>}
      {!done && onComplete && (
        <Button variant="ghost" size="sm" loading={busy} onClick={onComplete}>
          Mark done
        </Button>
      )}
    </div>
  )
}

function ObligationCard({ obligation, canComplete, onComplete, isBusy }: {
  obligation: ThresholdObligation
  canComplete: boolean
  onComplete: (taskId: string) => void
  isBusy: (taskId: string) => boolean
}) {
  const [reviewing, setReviewing] = React.useState(false)
  const openItems = obligation.checklist.filter((c) => c.status === 'pending').length
  const registrationOverdue = isRegistrationOverdue(obligation)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-[15px] font-semibold leading-[22px] text-ink">{obligation.scheme}</h3>
            {obligation.applicable ? (
              <Badge status={obligation.registrationDeadline ? (registrationOverdue ? 'overdue' : 'needs-you') : 'active'}>
                {obligation.registrationDeadline ? 'Registration pending' : 'Applicable'}
              </Badge>
            ) : (
              <Badge tone="neutral">Not yet applicable</Badge>
            )}
          </div>
          <p className="m-0 mt-1 text-[12px] text-ink-muted">
            {obligation.headcountAtCheck} of {obligation.threshold} threshold
            {obligation.crossedAt ? ` · crossed ${obligation.crossedAt}` : ''}
          </p>
        </div>
      </div>

      {obligation.checklist.length > 0 && (
        <div className="rounded-md border border-line px-3">
          {(reviewing ? obligation.checklist : obligation.checklist.filter((c) => c.status === 'pending').slice(0, 2)).map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              busy={isBusy(item.id)}
              onComplete={reviewing && canComplete ? () => onComplete(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {obligation.applicable && obligation.checklist.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-muted">
            {reviewing && !canComplete ? 'Only the founder or HR can tick tasks off.' : `${openItems} open of ${obligation.checklist.length}`}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setReviewing((v) => !v)}>
            {reviewing ? 'Hide checklist' : 'Review checklist'}
          </Button>
        </div>
      )}
    </div>
  )
}

export interface ComplianceScreenProps {
  source: ComplianceSource
}

export function ComplianceScreen({ source }: ComplianceScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getCompliance(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [decisionOpen, setDecisionOpen] = React.useState(false)
  const data: ComplianceData | null = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const canComplete = session.role === 'tenant_founder' || session.role === 'tenant_hr'

  const overdueObligation = data.obligations.find((o) => o.applicable && isRegistrationOverdue(o))
  const applicableObligations = data.obligations.filter((o) => o.applicable)
  const upcomingFilings = data.filings.filter((f) => f.status !== 'filed')
  const filedFilings = data.filings.filter((f) => f.status === 'filed')

  const filingColumns = [
    {
      key: 'filing',
      header: 'Filing',
      render: (f: FilingRecord) => (
        <div>
          <div className="text-ink">
            {f.scheme} — {f.period}
          </div>
          <div className="text-[12px] text-ink-muted">{f.authority}</div>
        </div>
      ),
    },
    { key: 'due', header: 'Due', render: (f: FilingRecord) => f.dueDate },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      render: (f: FilingRecord) => (f.amount !== undefined ? <Amount value={f.amount} /> : <span className="text-ink-muted">—</span>),
    },
    {
      key: 'status',
      header: 'Status',
      render: (f: FilingRecord) => <Badge status={filingBadgeStatus(f.status)}>{filingBadgeLabel(f.status)}</Badge>,
    },
  ]

  const filedColumns = [
    {
      key: 'filing',
      header: 'Filing',
      render: (f: FilingRecord) => (
        <div>
          <div className="text-ink">
            {f.scheme} — {f.period}
          </div>
          <div className="text-[12px] text-ink-muted">{f.authority}</div>
        </div>
      ),
    },
    { key: 'filedOn', header: 'Filed on', render: (f: FilingRecord) => (f.filedOn ? <span>{f.filedOn} <Simulated why="The filing is simulated: nothing was sent to the government portal." /></span> : '—') },
    { key: 'ack', header: 'Acknowledgement no.', render: (f: FilingRecord) => f.acknowledgementNo ?? '—' },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      render: (f: FilingRecord) => (f.amount !== undefined ? <Amount value={f.amount} /> : <span className="text-ink-muted">—</span>),
    },
  ]

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
          <PageHeader
            eyebrow={['Compliance']}
            title="Statutory calendar"
            description={`PF, ESI, PT and TDS${data.legalEntityName ? ` for ${data.legalEntityName}` : ''}. Daydor prepares the files; a person submits them.`}
          />

          {overdueObligation && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-danger" />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-small font-medium text-danger">{overdueObligation.scheme} registration is overdue.</p>
                <p className="m-0 mt-0.5 text-[12px] text-ink-muted">
                  {overdueObligation.crossedAt
                    ? `You crossed ${overdueObligation.threshold} people on ${overdueObligation.crossedAt}; registration was due by ${overdueObligation.registrationDeadline}.`
                    : `Registration was due by ${overdueObligation.registrationDeadline}.`}
                </p>
              </div>
              {overdueObligation.approvalRequestId && (
                <Button variant="secondary" size="sm" onClick={() => setDecisionOpen((v) => !v)}>
                  {decisionOpen ? 'Hide decision' : 'Open decision'}
                </Button>
              )}
            </div>
          )}

          {overdueObligation?.approvalRequestId && decisionOpen && (
            <DecisionCard
              domain="Compliance"
              gate="threshold_crossing"
              writeClass="guarded"
              title={`Confirm that ${overdueObligation.scheme} applies to your company`}
              summary={`Your headcount is ${overdueObligation.headcountAtCheck}, past the threshold of ${overdueObligation.threshold}.`}
              canDecide={canDecide('threshold_crossing')}
              cannotDecideReason="Only the founder confirms a statutory scheme."
              busy={isBusy(`decide:${overdueObligation.approvalRequestId}`)}
              onApprove={() =>
                void run(`decide:${overdueObligation.approvalRequestId}`, () => source.resolveApproval(overdueObligation.approvalRequestId!, 'approved'), { success: 'Confirmed' })
              }
              onDecline={(note) =>
                void run(`decide:${overdueObligation.approvalRequestId}`, () => source.resolveApproval(overdueObligation.approvalRequestId!, 'rejected', note), { success: 'Declined' })
              }
            />
          )}

          <div className="rounded-lg border border-line bg-surface p-6">
            <StatRow items={data.stats} />
          </div>

          <div>
            <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Headcount-threshold obligations</h2>
            <div className="grid grid-cols-2 gap-4">
              {applicableObligations.map((o) => (
                <ObligationCard
                  key={o.id}
                  obligation={o}
                  canComplete={canComplete}
                  isBusy={(id) => isBusy(`task:${id}`)}
                  onComplete={(id) => void run(`task:${id}`, () => source.completeTask(id), { success: 'Task done' })}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Upcoming filings</h2>
            <Table
              caption="Upcoming statutory filings"
              rows={upcomingFilings}
              rowKey={(f) => f.id}
              columns={filingColumns}
            />
          </div>

          <div>
            <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Filed this year</h2>
            <Table
              caption="Filed statutory filings"
              density="compact"
              rows={filedFilings}
              rowKey={(f) => f.id}
              columns={filedColumns}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
