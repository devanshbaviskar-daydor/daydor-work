import * as React from 'react'

import { cn } from '@/lib/utils'
import { Amount } from '@/components/daydor/Amount'
import { Button } from '@/components/daydor/Button'
import { Deadline, type DeadlineProps } from '@/components/daydor/Deadline'
import { Dialog } from '@/components/daydor/Dialog'
import { Icon } from '@/components/daydor/Icon'
import type { WriteLevel } from '@/components/daydor/WriteClass'

export interface DecisionFigure {
  label: React.ReactNode
  value: number | React.ReactNode
  note?: React.ReactNode
}

export interface DecisionCardProps {
  title: React.ReactNode
  domain?: string
  gate?: string
  writeClass?: WriteLevel
  summary?: React.ReactNode
  figures?: DecisionFigure[]
  why?: React.ReactNode
  deadline?: DeadlineProps
  approveLabel?: string
  /** The designer's second action ("Counter offer", "Ask Priya", "See the return"): shown only when there is a handler. It does not decline. */
  reviewLabel?: string
  onApprove?: () => void
  onReview?: () => void
  /** Declining asks for confirmation and an optional note, then calls `onDecline(note)`. Shown only when there is a handler. */
  onDecline?: (note?: string) => void
  /** Delegate is shown only when there is something to do on click. */
  onDelegate?: (() => void) | false
  /** False when the signed-in role may not decide this (or raised it): the buttons are replaced by `cannotDecideReason`. Undefined means unknown, so the buttons show. */
  canDecide?: boolean
  cannotDecideReason?: string
  /** True while a decision is being sent: the buttons wait. */
  busy?: boolean
  children?: React.ReactNode
  /** Rail row variant. */
  compact?: boolean
  selected?: boolean
  onOpen?: () => void
  /** Resolved record variant. */
  state?: 'open' | 'approved' | 'declined' | 'delegated'
  resolvedNote?: React.ReactNode
  /** Shown in danger above the title when a decision is stuck. */
  escalation?: React.ReactNode
  /** 'routine' for 24-48h gates (leave, expenses): quiet styling, `note` instead of a deadline. */
  pace?: 'urgent' | 'routine'
  note?: React.ReactNode
}

export function DecisionCard({
  title,
  domain,
  gate,
  writeClass = 'read',
  summary,
  figures,
  why,
  deadline,
  approveLabel = 'Approve',
  reviewLabel = 'Review',
  onApprove,
  onReview,
  onDecline,
  onDelegate,
  canDecide,
  cannotDecideReason,
  busy,
  children,
  compact,
  selected,
  onOpen,
  state = 'open',
  resolvedNote,
  escalation,
  pace,
  note,
}: DecisionCardProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [declineOpen, setDeclineOpen] = React.useState(false)
  const [declineNote, setDeclineNote] = React.useState('')
  const irreversible = writeClass === 'irreversible'

  if (state !== 'open') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] leading-[18px]">
        <span
          className={cn(
            'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full',
            state === 'approved' && 'bg-success-soft text-success',
            state === 'declined' && 'bg-surface-sunken text-ink-muted',
            state === 'delegated' && 'bg-info-soft text-info',
          )}
        >
          <Icon name={state === 'declined' ? 'x' : state === 'delegated' ? 'userPlus' : 'check'} size={13} />
        </span>
        <span className="min-w-0 flex-1 font-medium">{title}</span>
        {resolvedNote && <span className="whitespace-nowrap text-ink-muted">{resolvedNote}</span>}
      </div>
    )
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 pl-3.5 text-left transition-colors hover:bg-surface-sunken',
          selected && 'bg-brand-soft hover:bg-brand-soft',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          {domain && (
            <span className="flex items-center gap-1.5 text-eyebrow text-ink-muted">
              <span className="text-ink">{domain}</span>
            </span>
          )}
          <span className="truncate text-body font-medium text-ink">{title}</span>
          <div className="mt-0.5 flex items-center gap-2">
            {note ? (
              <span className="text-[12px] leading-4 text-ink-muted">{note}</span>
            ) : (
              deadline && <Deadline {...deadline} />
            )}
            {irreversible && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-irreversible-soft px-[5px] py-[2px] text-[12px] font-medium text-irreversible">
                <Icon name="lock" size={12} />
              </span>
            )}
          </div>
        </div>
        <Icon name="chevronRight" size={16} className="text-ink-muted" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 motion-safe:animate-[dd-rise_220ms_ease-out]',
        pace === 'routine' ? 'shadow-none' : 'shadow-sm',
      )}
    >
      {escalation && (
        <p className="-my-0.5 flex items-center gap-1.5 text-[13px] font-medium leading-[18px] text-danger">
          <Icon name="alert" size={14} />
          {escalation}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {domain && <span className="text-eyebrow text-ink-muted">{domain}</span>}
          {gate && (
            <>
              <span className="text-eyebrow text-ink-muted opacity-60">·</span>
              <span className="text-eyebrow text-ink-muted">{gate}</span>
            </>
          )}
        </div>
        {irreversible && (
          <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-sm bg-irreversible-soft px-2 py-[3px] text-[12px] font-medium text-irreversible">
            <Icon name="lock" size={13} />
            Irreversible
          </span>
        )}
      </div>

      <h3 className="title m-0 text-ink">{title}</h3>
      {summary && <p className="-mt-1.5 m-0 text-body text-ink-muted">{summary}</p>}

      {figures && figures.length > 0 && (
        <dl className="my-0.5 flex flex-wrap gap-x-8 gap-y-3">
          {figures.map((f, i) => (
            <div key={i}>
              <dt className="text-[12px] leading-4 text-ink-muted">{f.label}</dt>
              <dd className="mt-0.5 text-[20px] font-medium leading-[26px] tracking-[-0.015em] tabular-nums text-ink">
                {typeof f.value === 'number' ? <Amount value={f.value} /> : f.value}
                {f.note && <span className="block text-[12px] font-normal leading-4 text-ink-muted">{f.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {why && (
        <p className="m-0 flex gap-2 text-small text-ink-muted">
          <Icon name="scale" size={14} className="mt-0.5" />
          {why}
        </p>
      )}

      {children}

      <div className="mt-0.5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        {canDecide === false ? (
          <p className="m-0 flex items-center gap-1.5 text-small text-ink-muted">
            <Icon name="lock" size={13} />
            {cannotDecideReason ?? 'Your role cannot decide this.'}
          </p>
        ) : (
          <div className="flex gap-2">
            {onApprove && (
              <Button
                variant="primary"
                size="sm"
                icon={irreversible ? 'lock' : undefined}
                loading={busy}
                onClick={() => (irreversible ? setConfirmOpen(true) : onApprove())}
              >
                {approveLabel}
              </Button>
            )}
            {onReview && (
              <Button variant="secondary" size="sm" disabled={busy} onClick={onReview}>
                {reviewLabel}
              </Button>
            )}
            {onDecline && (
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => setDeclineOpen(true)}>
                Decline
              </Button>
            )}
            {typeof onDelegate === 'function' && (
              <Button variant="ghost" size="sm" onClick={onDelegate}>
                Delegate
              </Button>
            )}
          </div>
        )}
        {note ? (
          <span className="text-small text-ink-muted">{note}</span>
        ) : (
          deadline && <Deadline {...deadline} />
        )}
      </div>

      {onDecline && (
        <Dialog
          open={declineOpen}
          onClose={() => setDeclineOpen(false)}
          onConfirm={() => {
            setDeclineOpen(false)
            onDecline(declineNote.trim() || undefined)
            setDeclineNote('')
          }}
          title={`Decline: ${typeof title === 'string' ? title : 'this request'}`}
          description="The person who asked is told. A declined request cannot be reopened."
          confirmLabel="Decline"
        >
          <label className="mt-4 flex flex-col gap-1.5 text-label text-ink">
            Note (optional)
            <textarea
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-line-strong bg-surface px-3 py-2 text-body text-ink outline-none focus-visible:outline-2 focus-visible:outline-focus"
            />
          </label>
        </Dialog>
      )}

      {irreversible && (
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false)
            onApprove?.()
          }}
          title={title}
          description={summary}
          confirmLabel={approveLabel}
          irreversible="This cannot be undone once confirmed."
        />
      )}
    </div>
  )
}
