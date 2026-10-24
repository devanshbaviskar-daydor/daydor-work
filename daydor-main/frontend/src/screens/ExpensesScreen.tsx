import * as React from 'react'

import type { ExpensesSource } from '@/data/expensesSource'
import type { ExpenseCategoryCode, ExpenseClaim, ExpensesData } from '@/types/expenses'
import { Amount } from '@/components/daydor/Amount'
import { Badge, type Status } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { Icon } from '@/components/daydor/Icon'
import { Input } from '@/components/daydor/Input'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ReceiptReview } from '@/components/daydor/ReceiptReview'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select } from '@/components/daydor/Select'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { FormDialog } from '@/components/daydor/FormDialog'
import { ScreenState } from '@/components/daydor/ScreenState'
import { StatRow } from '@/components/daydor/StatRow'
import { Table } from '@/components/daydor/Table'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'

function claimStatus(claim: ExpenseClaim): Status {
  if (claim.reimbursedAt) return 'paid'
  if (claim.approvalRequest?.status === 'declined') return 'rejected'
  if (claim.approvalRequest?.status === 'approved') return 'approved'
  if (claim.approvalRequest?.stage === 'founder') return 'needs-you'
  return 'pending'
}

function statusLabel(claim: ExpenseClaim): string {
  if (claim.reimbursedAt) return 'Paid'
  if (claim.approvalRequest?.status === 'declined') return 'Declined'
  if (claim.approvalRequest?.status === 'approved') return 'Approved'
  if (claim.approvalRequest?.stage === 'founder') return 'Needs you'
  return 'With manager'
}

const CATEGORY_LABEL: Record<ExpenseCategoryCode, string> = {
  meals: 'Meals',
  travel: 'Travel',
  client_entertainment: 'Client entertainment',
  office_supplies: 'Office supplies',
  professional_development: 'Professional development',
}

function SubmitClaimDialog({ open, onClose, onSubmit, busy }: {
  open: boolean
  onClose: () => void
  onSubmit: (amount: number, category: ExpenseCategoryCode) => Promise<boolean>
  busy: boolean
}) {
  const [category, setCategory] = React.useState<ExpenseCategoryCode>('meals')
  const [amount, setAmount] = React.useState('')
  const invalid = !(Number(amount) > 0) ? 'Enter the amount on the bill.' : null
  return (
    <FormDialog
      open={open}
      title="Claim an expense"
      description="Your manager decides, and above their limit the founder does. Approved claims are paid with your next salary. Receipts cannot be attached yet."
      submitLabel={Number(amount) > 0 ? `Submit ₹${Number(amount).toLocaleString('en-IN')} claim` : 'Submit claim'}
      invalid={invalid}
      busy={busy}
      onClose={onClose}
      onSubmit={() => onSubmit(Number(amount), category).then((ok) => { if (ok) setAmount(''); return ok })}
    >
      <Select
        label="Category"
        options={(Object.keys(CATEGORY_LABEL) as ExpenseCategoryCode[]).map((value) => ({ value, label: CATEGORY_LABEL[value] }))}
        value={category}
        onChange={(v) => setCategory(v as ExpenseCategoryCode)}
      />
      <Input label="Amount (₹)" type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
    </FormDialog>
  )
}

export interface ExpensesScreenProps {
  source: ExpensesSource
}

export function ExpensesScreen({ source }: ExpensesScreenProps) {
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getExpenses(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [submitOpen, setSubmitOpen] = React.useState(false)
  const data: ExpensesData | null = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const pending = data.claims.filter((c) => c.approvalRequest?.status === 'pending')
  const gateOf = (c: ExpenseClaim) => (c.approvalRequest?.stage === 'founder' ? 'g_expense_founder' : 'g_expense')
  const mayDecide = (c: ExpenseClaim) => (c.approvalRequest?.canDecide !== undefined ? c.approvalRequest.canDecide : canDecide(gateOf(c)))
  const needsYou = pending.filter(mayDecide)
  const withManagers = pending.filter((c) => c.approvalRequest?.stage === 'manager')
  const thresholdFor = (c: ExpenseClaim) => data.categoryRules.find((r) => r.categoryCode === c.categoryCode)?.managerApprovalThreshold
  const nextBatch = data.reimbursementBatches.find((b) => !b.disbursedAt)
  const nextBatchClaims = data.claims.filter((c) => c.reimbursementBatchId === nextBatch?.id)
  const inNextBatchTotal = withManagers.reduce((sum, c) => sum + c.amount, 0) + nextBatchClaims.reduce((sum, c) => sum + c.amount, 0)
  const needsYouTotal = needsYou.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-conversation flex-col gap-6 px-8 py-6">
          <PageHeader
            eyebrow={['Expenses']}
            title="Expenses"
            description="Managers approve claims up to their category's limit; anything above goes to the founder. Approved claims are paid with the next salary — no separate payout."
            actions={
              session.employee_id !== null ? (
                <Button variant="primary" icon="receipt" onClick={() => setSubmitOpen(true)}>
                  Claim an expense
                </Button>
              ) : undefined
            }
          />

          <div className="rounded-lg border border-line bg-surface p-5">
            <StatRow
              items={[
                { label: 'With managers', value: withManagers.reduce((s, c) => s + c.amount, 0), delta: `${withManagers.length} claims` },
                {
                  label: 'Needs you',
                  value: String(needsYou.length),
                  delta: needsYou.length ? `₹${needsYouTotal.toLocaleString('en-IN')}` : undefined,
                  deltaTone: 'warning',
                },
                {
                  label: nextBatch ? `In ${nextBatch.payrollRunLabel}` : 'Next payroll cycle',
                  value: inNextBatchTotal,
                  delta: nextBatch ? `paid ${nextBatch.scheduledDisbursementDate}` : undefined,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] items-start gap-6">
            <div className="flex flex-col gap-3">
              <p className="m-0 text-[12px] font-medium text-ink-muted">Needs you</p>
              {needsYou.length === 0 && (
                <p className="m-0 rounded-lg border border-line bg-surface p-5 text-body text-ink-muted">Nothing is waiting on you right now.</p>
              )}
              {needsYou.map((claim) => (
                <DecisionCard
                  key={claim.id}
                  domain="Expenses"
                  gate={claim.approvalRequest?.stage === 'founder' ? (thresholdFor(claim) ? `Above ₹${thresholdFor(claim)!.toLocaleString('en-IN')}` : 'Above the category limit') : 'Manager approval'}
                  writeClass="guarded"
                  title={`Approve ${claim.employeeName.split(' ')[0]}'s ${CATEGORY_LABEL[claim.categoryCode].toLowerCase()} claim — ₹${claim.amount.toLocaleString('en-IN')}`}
                  summary={claim.note}
                  why={claim.approvalRequest?.stage === 'founder' ? `Expense policy: ${CATEGORY_LABEL[claim.categoryCode].toLowerCase()} above the category limit needs a founder.` : undefined}
                  approveLabel={`Approve ₹${claim.amount.toLocaleString('en-IN')}`}
                  canDecide={mayDecide(claim)}
                  cannotDecideReason={claim.approvalRequest?.cannotDecideReason}
                  busy={isBusy(`decide:${claim.id}`)}
                  onApprove={() => void run(`decide:${claim.id}`, () => source.resolveApproval(claim.approvalRequest!.id, 'approved'), { success: 'Claim approved' })}
                  onDecline={(note) => void run(`decide:${claim.id}`, () => source.resolveApproval(claim.approvalRequest!.id, 'rejected', note), { success: 'Claim declined' })}
                >
                  {claim.extractedFields && (
                    <ReceiptReview
                      layout="stacked"
                      heading={`Read from the receipt · confirmed by ${claim.employeeName.split(' ')[0]}`}
                      photo={
                        <div className="flex h-full w-full items-center justify-center text-on-ink/60">
                          <Icon name="receipt" size={28} />
                        </div>
                      }
                      fields={claim.extractedFields.map((f) => ({ ...f, confirmed: true }))}
                    />
                  )}
                  {nextBatch && (
                    <p className="m-0 text-[12px] text-ink-muted">Rides on {nextBatch.payrollRunLabel} if approved in time</p>
                  )}
                </DecisionCard>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="m-0 text-[12px] font-medium text-ink-muted">All claims</p>
              <Table
                caption="Expense claims"
                density="compact"
                rows={data.claims}
                rowKey={(c) => c.id}
                columns={[
                  {
                    key: 'employee',
                    header: 'Employee',
                    render: (c) => (
                      <div>
                        <div className="text-ink">{c.employeeName}</div>
                        <div className="text-[12px] text-ink-muted">{CATEGORY_LABEL[c.categoryCode]}</div>
                      </div>
                    ),
                  },
                  { key: 'amount', header: 'Amount', numeric: true, render: (c) => <Amount value={c.amount} /> },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (c) => (
                      <div className="flex flex-col items-end gap-1">
                        <Badge status={claimStatus(c)}>{statusLabel(c)}</Badge>
                        {c.policyFlags.map((flag, i) => (
                          <span key={i} className="text-[11px] text-warning">
                            {flag.message}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
              <p className="m-0 text-small text-ink-muted">
                Approved claims are added to each person's salary as a non-taxable reimbursement line — never paid out separately.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <SubmitClaimDialog
        open={submitOpen}
        busy={isBusy('submit')}
        onClose={() => setSubmitOpen(false)}
        onSubmit={(amount, category) => run('submit', () => source.submitExpense({ amount, category }), { success: 'Claim sent for approval' })}
      />
    </div>
  )
}
