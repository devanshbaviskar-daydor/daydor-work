import * as React from 'react'

import { cn } from '@/lib/utils'
import { Amount } from '@/components/daydor/Amount'

export interface Stat {
  label: React.ReactNode
  value: number | React.ReactNode
  delta?: React.ReactNode
  deltaTone?: 'warning' | 'success'
}

export interface StatRowProps {
  items: Stat[]
  className?: string
}

export function StatRow({ items, className }: StatRowProps) {
  return (
    <dl className={cn('flex flex-wrap gap-x-8 gap-y-3', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <dt className="text-[12px] leading-4 text-ink-muted">{item.label}</dt>
          <dd className="m-0 text-figure tabular-nums text-ink">
            {typeof item.value === 'number' ? <Amount value={item.value} /> : item.value}
          </dd>
          {item.delta && (
            <span
              className={cn(
                'text-[12px] leading-4 text-ink-muted',
                item.deltaTone === 'warning' && 'text-warning',
                item.deltaTone === 'success' && 'text-success',
              )}
            >
              {item.delta}
            </span>
          )}
        </div>
      ))}
    </dl>
  )
}
