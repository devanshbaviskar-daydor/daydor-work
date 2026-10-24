import * as React from 'react'

import type { PayrollSource } from '@/data/payrollSource'
import type { FilingRecord, PayrollData, PayrollRun, PayrollRunStatus, Payslip } from '@/types/payroll'
import type { Status } from '@/components/daydor/Badge'
import { Amount } from '@/components/daydor/Amount'
import { Badge } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { Dialog } from '@/components/daydor/Dialog'
import { FactList } from '@/components/daydor/FactList'
import { PageHeader } from '@/components/daydor/PageHeader'
import { RunRow } from '@/components/daydor/RunRow'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { FormDialog } from '@/components/daydor/FormDialog'
import { Input } from '@/components/daydor/Input'
import { ScreenState } from '@/components/daydor/ScreenState'
import { Simulated } from '@/components/daydor/Simulated'
import { StatRow } from '@/components/daydor/StatRow'
import { Table } from '@/components/daydor/Table'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'

export interface PayrollScreenProps {
  source: PayrollSource
}

const RUN_STATUS_BADGE: Record<PayrollRunStatus, Status> = {
  draft: 'draft',
  built: 'processing',
  anomaly_check: 'in-review',
  awaiting_disbursal_approval: 'needs-you',
  disbursed: 'done',
  payslips_issued: 'done',
  filed: 'filed',
}

type LifecycleState = 'running' | 'waiting' | 'done' | 'failed'

const LIFECYCLE_ORDER: PayrollRunStatus[] = [
  'built',
  'anomaly_check',
  'awaiting_disbursal_approval',
  'disbursed',
  'payslips_issued',
  'filed',
]

function lifecycleRows(
  run: PayrollRun,
  filings: FilingRecord[],
): { title: string; state: LifecycleState; meta?: React.ReactNode }[] {
  const currentIndex = LIFECYCLE_ORDER.indexOf(run.status)

  const stateFor = (stepIndex: number): LifecycleState => {
    if (stepIndex < currentIndex) return 'done'
    if (stepIndex === currentIndex) return run.status === 'awaiting_disbursal_approval' ? 'waiting' : 'running'
    return 'waiting'
  }

  const filingsFiled = filings.length > 0 && filings.every((f) => f.filed_on)

  return [
    { title: 'Pay computed', state: 'done' as LifecycleState, meta: 'anomaly pre-check run in the same step' },
    {
      title: 'Anomaly check',
      state: stateFor(1),
      meta:
        run.anomaly_decision === 'escalated'
          ? `Escalated · score ${run.anomaly_score}`
          : run.anomaly_decision === 'clear'
            ? 'Clear'
            : undefined,
    },
    {
      title: 'Your approval to disburse',
      state: currentIndex >= 2 ? (currentIndex === 2 ? 'running' : 'done') : 'waiting',
      meta: run.approval_request_id ? `Request ${run.approval_request_id}` : undefined,
    },
    {
      title: 'Salaries disbursed',
      state: run.disbursed_at ? 'done' : currentIndex === 3 ? 'running' : 'waiting',
      meta: run.disbursed_at ? (
        <>
          {new Date(run.disbursed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} <Simulated why="The bank is simulated: nothing was paid." />
        </>
      ) : undefined,
    },
    {
      title: 'Payslips issued',
      state: currentIndex >= 4 ? 'done' : 'waiting',
      meta: currentIndex >= 4 ? `${run.payslip_ids.length} payslips` : undefined,
    },
    {
      title: 'Statutory filings',
      state: filingsFiled ? 'done' : filings.length > 0 ? 'running' : 'waiting',
      meta:
        filings.length > 0 ? (
          <>
            {filings.filter((f) => f.filed_on).length} of {filings.length} filed <Simulated why="Filing is simulated: nothing was sent to a government portal." />
          </>
        ) : (
          'not started — independent of disbursal'
        ),
    },
  ]
}

function PayslipView({ payslip, onBack }: { payslip: Payslip; onBack: () => void }) {
  const totalDeductions = payslip.deductions.reduce((sum, d) => sum + d.amount, 0)
  const totalEmployer = payslip.employerContributions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-8 py-6">
      <Button variant="ghost" size="sm" icon="undo" onClick={onBack} className="self-start">
        Back to run
      </Button>

      <div className="rounded-lg border border-line bg-surface p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="m-0 text-title-lg text-ink">{payslip.employee_name}</h1>
            <p className="m-0 text-small text-ink-muted">
              {payslip.employee_role} · PAN {payslip.pan} · UAN {payslip.uan}
            </p>
          </div>
          <div className="text-right">
            <p className="m-0 text-small text-ink-muted">Paid days</p>
            <p className="m-0 text-body text-ink">{payslip.paid_days}</p>
          </div>
        </div>

        {payslip.changeNote && (
          <p className="m-0 mt-3 rounded-md bg-surface-sunken px-3 py-2 text-[12px] text-ink-muted">{payslip.changeNote}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="m-0 mb-3 text-[12px] font-medium text-ink-muted">Earnings</p>
            <FactList items={payslip.earnings.map((e) => ({ label: e.label, value: e.amount }))} />
          </div>
          <div>
            <p className="m-0 mb-3 text-[12px] font-medium text-ink-muted">Deductions</p>
            <FactList
              items={payslip.deductions.map((d) => ({
                label: d.label,
                value: d.amount,
              }))}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
          <div>
            <p className="m-0 text-[12px] text-ink-muted">Gross pay</p>
            <Amount value={payslip.gross_pay} size="lg" />
          </div>
          <div>
            <p className="m-0 text-[12px] text-ink-muted">Total deductions</p>
            <Amount value={totalDeductions} size="lg" tone="muted" />
          </div>
          <div>
            <p className="m-0 text-[12px] text-ink-muted">Net pay</p>
            <Amount value={payslip.net_pay} size="lg" />
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="m-0 mb-3 text-[12px] font-medium text-ink-muted">Employer contributions (not part of net pay)</p>
          <FactList items={payslip.employerContributions.map((c) => ({ label: c.label, value: c.amount }))} />
          <p className="m-0 mt-2 text-[12px] text-ink-muted">Total employer cost this month: ₹{totalEmployer.toLocaleString('en-IN')}</p>
        </div>

        <p className="m-0 mt-5 border-t border-line pt-3 text-[12px] text-ink-muted">
          Paid to {payslip.bank_account_masked}
          {payslip.issued_at ? ` · issued ${new Date(payslip.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' · not yet issued'}
        </p>
      </div>
    </div>
  )
}

function lastMonth(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)).toISOString().slice(0, 7)
}

export function PayrollScreen({ source }: PayrollScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getPayroll(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [activeRunId, setActiveRunId] = React.useState<string | null>(null)
  const [activePayslipId, setActivePayslipId] = React.useState<string | null>(null)
  const [approveOpen, setApproveOpen] = React.useState(false)
  const [newRunOpen, setNewRunOpen] = React.useState(false)
  const [month, setMonth] = React.useState(lastMonth())
  const data: PayrollData | null = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const canStartRun = session.role === 'tenant_payroll' || session.role === 'tenant_founder'
  const monthRange = (m: string) => {
    const [y, mo] = m.split('-').map(Number)
    const first = new Date(Date.UTC(y, mo - 1, 1))
    const last = new Date(Date.UTC(y, mo, 0))
    return { start: first.toISOString().slice(0, 10), end: last.toISOString().slice(0, 10), label: first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }
  }
  const runs = data.runs
  const activeRun = runs.find((r) => r.payroll_run_id === activeRunId) ?? runs[0]
  const payslips = activeRun ? (data.payslipsByRunId[activeRun.payroll_run_id] ?? []) : []
  const filings = activeRun ? (data.filingsByRunId[activeRun.payroll_run_id] ?? []) : []
  const activePayslip = activePayslipId ? payslips.find((p) => p.payslip_id === activePayslipId) : undefined

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        {activePayslip ? (
          <PayslipView payslip={activePayslip} onBack={() => setActivePayslipId(null)} />
        ) : (
          <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
            {!activeRun && (
              <PageHeader
                eyebrow={['Payroll']}
                title="Payroll"
                description="No payroll has been run yet."
                actions={canStartRun ? <Button variant="primary" icon="rupee" onClick={() => setNewRunOpen(true)}>New run</Button> : undefined}
              />
            )}

            {activeRun && (
              <PageHeader
                eyebrow={['Payroll', activeRun.period_label]}
                title={`${activeRun.period_label} payroll`}
                status={RUN_STATUS_BADGE[activeRun.status]}
                description={`${activeRun.employee_count} people · pay date ${activeRun.pay_date}`}
                actions={
                  <>
                    {canStartRun && (
                      <Button icon="rupee" onClick={() => setNewRunOpen(true)}>
                        New run
                      </Button>
                    )}
                    {activeRun.status === 'awaiting_disbursal_approval' &&
                      (canDecide('g_pay_disburse') ? (
                        <Button variant="primary" icon="lock" disabled={!activeRun.approval_request_id} loading={isBusy('release')} onClick={() => setApproveOpen(true)}>
                          Approve & release
                        </Button>
                      ) : (
                        <span className="self-center text-small text-ink-muted">Waiting for the founder to approve the payment.</span>
                      ))}
                  </>
                }
                tabs={runs.map((r) => ({
                  label: r.period_label,
                  active: r.payroll_run_id === activeRun.payroll_run_id,
                  onClick: () => setActiveRunId(r.payroll_run_id),
                }))}
              />
            )}

            {activeRun && (
              <>
                <div className="rounded-lg border border-line bg-surface p-6">
                  <StatRow
                    items={[
                      { label: 'Gross pay', value: activeRun.gross_total },
                      { label: 'Net pay', value: activeRun.net_total },
                      { label: 'People', value: String(activeRun.employee_count), delta: `${activeRun.joiners} joiner, ${activeRun.leavers} leaver` },
                      ...(activeRun.anomaly_score !== null
                        ? [
                            {
                              label: 'Anomaly score',
                              value: activeRun.anomaly_score.toFixed(2),
                              delta: activeRun.anomaly_decision === 'escalated' ? 'escalated for review' : 'clear',
                              deltaTone: (activeRun.anomaly_decision === 'escalated' ? 'warning' : 'success') as 'warning' | 'success',
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>

                <div className="grid grid-cols-[1.3fr_1fr] items-start gap-6">
                  <div className="rounded-lg border border-line bg-surface p-6">
                    <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Employees</h2>
                    <Table
                      caption="Payslips in this run"
                      density="compact"
                      rows={payslips}
                      rowKey={(p) => p.payslip_id}
                      columns={[
                        {
                          key: 'employee',
                          header: 'Employee',
                          render: (p) => (
                            <button
                              type="button"
                              className="cursor-pointer bg-transparent p-0 text-left text-ink underline-offset-2 hover:underline"
                              onClick={() => setActivePayslipId(p.payslip_id)}
                            >
                              <div>{p.employee_name}</div>
                              {p.changeNote && <div className="text-[12px] text-ink-muted">{p.changeNote}</div>}
                            </button>
                          ),
                        },
                        { key: 'net', header: 'Net pay', numeric: true, render: (p) => <Amount value={p.net_pay} /> },
                        {
                          key: 'status',
                          header: 'Payslip',
                          render: (p) => <Badge status={p.issued_at ? 'paid' : 'pending'}>{p.issued_at ? 'Issued' : 'Not yet issued'}</Badge>,
                        },
                      ]}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="m-0 text-[12px] font-medium text-ink-muted">Run lifecycle</p>
                    <div className="rounded-lg border border-line bg-surface p-2">
                      {lifecycleRows(activeRun, filings).map((row) => (
                        <RunRow key={row.title} title={row.title} state={row.state} meta={row.meta} />
                      ))}
                    </div>

                    {filings.length > 0 && (
                      <>
                        <p className="m-0 mt-2 text-[12px] font-medium text-ink-muted">Statutory filings</p>
                        <div className="rounded-lg border border-line bg-surface p-4">
                          <FactList
                            items={filings.map((f) => ({
                              label: f.scheme,
                              value: f.filed_on ? (
                                <>
                                  Filed {f.filed_on} · {f.acknowledgement_no} <Simulated why="Filing is simulated: nothing was sent to a government portal." />
                                </>
                              ) : (
                                'Not filed yet'
                              ),
                            }))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {activeRun && (
        <Dialog
          title={`Approve & release ${activeRun.period_label} payroll`}
          description={`${activeRun.employee_count} people · net pay ₹${activeRun.net_total.toLocaleString('en-IN')} · pay date ${activeRun.pay_date}`}
          open={approveOpen}
          onClose={() => setApproveOpen(false)}
          onConfirm={() => {
            setApproveOpen(false)
            if (activeRun.approval_request_id) {
              const id = activeRun.approval_request_id
              void run('release', () => source.resolveApproval(id, 'approved'), { success: 'Payment approved' })
            }
          }}
          confirmLabel="Approve & release"
          irreversible="Once approved, the payment is released and cannot be recalled."
        >
          {activeRun.anomaly_decision === 'escalated' && (
            <p className="m-0 text-small text-ink-muted">
              This run was escalated for review — anomaly score {activeRun.anomaly_score}. Filing statutory returns is independent and
              will not be blocked by this approval.
            </p>
          )}
        </Dialog>
      )}

      <FormDialog
        open={newRunOpen}
        title={`Start the run for ${monthRange(month).label}?`}
        description="Daydor computes everyone's pay for the month. Nothing is paid until the founder approves it."
        submitLabel="Start run"
        busy={isBusy('new-run')}
        invalid={month ? null : 'Choose the month.'}
        onClose={() => setNewRunOpen(false)}
        onSubmit={() => {
          const { start, end } = monthRange(month)
          return run('new-run', () => source.createPayrollRun({ period_start: start, period_end: end }), { success: 'Payroll run started' })
        }}
      >
        <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </FormDialog>
    </div>
  )
}
