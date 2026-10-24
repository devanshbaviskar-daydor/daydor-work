import * as React from 'react'

import type { LeaveSource } from '@/data/leaveSource'
import type { LeavePolicy } from '@/types/leave'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { AttendanceGrid } from '@/components/daydor/AttendanceGrid'
import { Button } from '@/components/daydor/Button'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { Dialog } from '@/components/daydor/Dialog'
import { FormDialog } from '@/components/daydor/FormDialog'
import { Input } from '@/components/daydor/Input'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScreenState } from '@/components/daydor/ScreenState'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select } from '@/components/daydor/Select'
import { StatRow } from '@/components/daydor/StatRow'

export interface LeaveScreenProps {
  source: LeaveSource
}

const label = (t: string) => t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

function policyLine(p: LeavePolicy): string {
  const accrual = p.daysPerMonth ? `${p.daysPerMonth} day${p.daysPerMonth === 1 ? '' : 's'} a month` : 'no monthly accrual'
  return `${accrual} · carries forward up to ${p.carryForwardCap} days`
}

export function LeaveScreen({ source }: LeaveScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getLeave(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [requestOpen, setRequestOpen] = React.useState(false)
  const [policyOpen, setPolicyOpen] = React.useState(false)
  const [policyId, setPolicyId] = React.useState('')
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const [reason, setReason] = React.useState('')

  const leave = load.data
  if (!leave) return <ScreenState error={load.error} onRetry={load.reload} />

  const [primaryRequest, ...otherRequests] = leave.requests
  const mayDecide = (r: { canDecide?: boolean; gate?: string }) => (r.canDecide !== undefined ? r.canDecide : canDecide(r.gate))
  const policies = leave.policies ?? []
  const canRequest = session.employee_id !== null && policies.length > 0
  const peopleCount = leave.attendance.people.length + (leave.attendance.moreCount ?? 0)
  const description = [
    peopleCount ? `${peopleCount} people` : null,
    ...policies.map((p) => `${label(p.leaveType)}: ${p.daysPerMonth ? `${p.daysPerMonth} a month` : 'no accrual'}`),
  ]
    .filter(Boolean)
    .join(' · ')
  const invalid = !policyId ? 'Choose the kind of leave.' : !start || !end ? 'Choose the first and last day.' : end < start ? 'Leave cannot end before it starts.' : null

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
          <PageHeader
            eyebrow={['Leave & attendance', leave.period]}
            title="Leave & attendance"
            description={description || undefined}
            actions={
              <>
                {policies.length > 0 && (
                  <Button icon="file" onClick={() => setPolicyOpen(true)}>
                    Leave policy
                  </Button>
                )}
                {canRequest && (
                  <Button
                    variant="primary"
                    icon="calendar"
                    onClick={() => {
                      setPolicyId(policies[0].id)
                      setRequestOpen(true)
                    }}
                  >
                    Request leave
                  </Button>
                )}
              </>
            }
          />

          <div className="rounded-lg border border-line bg-surface p-6">
            <StatRow items={leave.stats} />
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] items-start gap-6">
            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">This month</h2>
              <AttendanceGrid days={leave.attendance.days} people={leave.attendance.people} />
              {leave.attendance.moreCount ? (
                <p className="mt-3 text-[12px] leading-[17px] text-ink-muted">+ {leave.attendance.moreCount} more</p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              {primaryRequest && (
                <>
                  <p className="m-0 text-[12px] font-medium text-ink-muted">
                    {mayDecide(primaryRequest) ? 'Waiting on you as manager' : 'Waiting on a manager'}
                  </p>
                  <DecisionCard
                    pace="routine"
                    {...primaryRequest}
                    canDecide={mayDecide(primaryRequest)}
                    busy={isBusy(`decide:${primaryRequest.id}`)}
                    onApprove={() => void run(`decide:${primaryRequest.id}`, () => source.resolveApproval(primaryRequest.id, 'approved'), { success: 'Leave approved' })}
                    onDecline={(note) => void run(`decide:${primaryRequest.id}`, () => source.resolveApproval(primaryRequest.id, 'rejected', note), { success: 'Leave declined' })}
                  />
                </>
              )}

              {otherRequests.length > 0 && (
                <>
                  <p className="mt-2 text-[12px] font-medium text-ink-muted">Other requests</p>
                  <div className="flex flex-col gap-2">
                    {otherRequests.map((request) => (
                      <DecisionCard
                        key={request.id}
                        pace="routine"
                        {...request}
                        canDecide={mayDecide(request)}
                        busy={isBusy(`decide:${request.id}`)}
                        onApprove={() => void run(`decide:${request.id}`, () => source.resolveApproval(request.id, 'approved'), { success: 'Leave approved' })}
                        onDecline={(note) => void run(`decide:${request.id}`, () => source.resolveApproval(request.id, 'rejected', note), { success: 'Leave declined' })}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Leave balances</h2>
            <StatRow
              items={leave.balances.map((b) => ({
                label: label(b.leaveType),
                value: `${b.balanceDays} day${b.balanceDays === 1 ? '' : 's'}`,
              }))}
            />
          </div>
        </div>
      </ScrollArea>

      <FormDialog
        open={requestOpen}
        title="Request leave"
        description="Your manager decides. You are told when they have."
        submitLabel="Send request"
        invalid={invalid}
        busy={isBusy('request')}
        onClose={() => setRequestOpen(false)}
        onSubmit={() =>
          run('request', () => source.submitLeaveRequest({ leave_policy_id: policyId, start_date: start, end_date: end, reason }), { success: 'Request sent to your manager' }).then(
            (ok) => {
              if (ok) {
                setStart('')
                setEnd('')
                setReason('')
              }
              return ok
            },
          )
        }
      >
        <Select label="Kind of leave" options={policies.map((p) => ({ value: p.id, label: label(p.leaveType) }))} value={policyId} onChange={setPolicyId} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="First day" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="Last day" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Input label="Reason" optional value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} />
      </FormDialog>

      <Dialog open={policyOpen} onClose={() => setPolicyOpen(false)} title="Leave policy" description="How leave is earned and carried forward in your company." confirmLabel="Close" onConfirm={() => setPolicyOpen(false)}>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {policies.map((p) => (
            <li key={p.id} className="rounded-md border border-line px-3 py-2 text-small text-ink">
              <span className="font-medium">{label(p.leaveType)}</span>
              <span className="block text-ink-muted">{policyLine(p)}</span>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  )
}
