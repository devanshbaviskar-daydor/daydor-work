import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/components/daydor/Icon'

export interface ChoiceCardProps {
  title: string
  selected: boolean
  onToggle?: (checked: boolean) => void
  description?: string
  icon?: IconName
  meta?: string
  children?: React.ReactNode
}

export function ChoiceCard({ title, selected, onToggle, description, icon, meta, children }: ChoiceCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-surface p-4 transition-colors',
        selected ? 'border-action' : 'border-line',
      )}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onToggle?.(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-action"
        />
        {icon && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
              selected ? 'bg-brand-soft text-action' : 'bg-surface-sunken text-ink-muted',
            )}
          >
            <Icon name={icon} size={16} />
          </span>
        )}
        <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col">
            <span className="text-body font-medium text-ink">{title}</span>
            {description && <span className="text-[13px] leading-[18px] text-ink-muted">{description}</span>}
          </span>
          {meta && <span className="whitespace-nowrap text-[13px] font-medium text-ink-muted">{meta}</span>}
        </span>
      </label>

      {selected && children && (
        <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">{children}</div>
      )}
    </div>
  )
}
