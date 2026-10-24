import * as React from 'react'

import { cn } from '@/lib/utils'
import { Avatar } from '@/components/daydor/Avatar'
import { Badge, type Status } from '@/components/daydor/Badge'
import { Icon, type IconName } from '@/components/daydor/Icon'

export type CandidateBlockerKind = 'you' | 'external' | 'agent' | 'done'

export interface CandidateBlocker {
  kind: CandidateBlockerKind
  text: React.ReactNode
}

export interface CandidateCardProps {
  name: string
  meta?: React.ReactNode
  signal?: Status
  signalNote?: React.ReactNode
  blocker?: CandidateBlocker
  selected?: boolean
  onOpen?: () => void
}

const BLOCKER_ICON: Record<CandidateBlockerKind, IconName | null> = {
  you: 'dot',
  external: 'clock',
  agent: null,
  done: 'check',
}

const BLOCKER_CLASS: Record<CandidateBlockerKind, string> = {
  you: 'text-warning font-medium',
  external: 'text-info',
  agent: 'text-ink-muted',
  done: 'text-success',
}

export function CandidateCard({ name, meta, signal, signalNote, blocker, selected, onOpen }: CandidateCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full flex-col gap-2 rounded-md border border-line bg-surface p-2.5 text-left shadow-sm transition-colors hover:border-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        selected && 'border-action shadow-[0_0_0_1px_var(--action)]',
        blocker?.kind === 'you' && 'ring-1 ring-warning/30',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar kind="person" name={name} size={26} />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium leading-[18px] text-ink">{name}</div>
          {meta && <div className="truncate text-[11.5px] leading-[15px] text-ink-muted">{meta}</div>}
        </div>
      </div>

      {signal && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] leading-[15px] text-ink-muted">
          <Badge status={signal} className="h-5 text-[11px]" />
          {signalNote && <span>{signalNote}</span>}
        </div>
      )}

      {blocker && (
        <div
          className={cn(
            'flex items-start gap-[5px] border-t border-line pt-2 text-[11.5px] leading-[15px]',
            BLOCKER_CLASS[blocker.kind],
          )}
        >
          {blocker.kind === 'agent' ? (
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand motion-safe:animate-[dd-pulse_1.6s_ease-out_infinite]" />
          ) : (
            <Icon name={BLOCKER_ICON[blocker.kind] ?? 'dot'} size={13} strokeWidth={2} className="mt-0.5" />
          )}
          <span>{blocker.text}</span>
        </div>
      )}
    </button>
  )
}
