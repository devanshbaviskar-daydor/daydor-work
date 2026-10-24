import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'

export interface RunRowProps {
  title: React.ReactNode
  state?: 'running' | 'waiting' | 'done' | 'failed'
  domain?: string
  meta?: React.ReactNode
  progress?: number
}

export function RunRow({ title, state = 'running', domain, meta, progress }: RunRowProps) {
  const isDone = state === 'done'

  return (
    <div className="flex items-start gap-1 py-2 pr-3">
      {state === 'running' ? (
        <span className="mt-1.5 ml-1.5 h-2 w-2 shrink-0 rounded-full bg-brand motion-safe:animate-[dd-pulse_1.6s_ease-out_infinite]" />
      ) : (
        <span
          className={cn(
            'm-[1px_5px_0_5px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
            state === 'done' && 'text-success',
            state === 'failed' && 'text-danger',
            state === 'waiting' && 'text-warning',
          )}
        >
          <Icon
            name={state === 'done' ? 'check' : state === 'failed' ? 'alert' : 'clock'}
            size={14}
          />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className={cn('m-0 text-small font-medium text-ink', isDone && 'font-normal text-ink-muted')}>
          {title}
        </p>
        {(domain || meta) && (
          <p className="m-0 mt-0.5 text-[12px] leading-4 text-ink-muted">
            {domain}
            {domain && meta && ' · '}
            {meta}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <span className="mt-2 h-1 w-12 shrink-0 self-center overflow-hidden rounded-full bg-surface-sunken">
          <span className="block h-full rounded-[inherit] bg-brand" style={{ width: `${progress}%` }} />
        </span>
      )}
    </div>
  )
}
