import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label: React.ReactNode
  options: Array<string | SelectOption>
  placeholder?: string
  hint?: React.ReactNode
  error?: React.ReactNode
  optional?: boolean
  onChange?: (value: string) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, hint, error, optional, className, id, onChange, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="flex items-baseline gap-1.5 text-label text-ink">
          {label}
          {optional && <span className="text-[12px] font-normal text-ink-muted">Optional</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-control-md w-full appearance-none rounded-md border bg-surface px-3 pr-9 text-body text-ink outline-none transition-colors',
              'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
              error ? 'border-danger' : 'border-line-strong',
              className,
            )}
            aria-invalid={!!error}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const o = typeof opt === 'string' ? { value: opt, label: opt } : opt
              return (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              )
            })}
          </select>
          <Icon name="chevronDown" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        </div>
        {error ? (
          <p className="m-0 text-[12px] leading-4 text-danger">{error}</p>
        ) : hint ? (
          <p className="m-0 text-[12px] leading-4 text-ink-muted">{hint}</p>
        ) : null}
      </div>
    )
  },
)
Select.displayName = 'Select'
