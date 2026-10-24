import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  optional?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, suffix, optional, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="flex items-baseline gap-1.5 text-label text-ink">
          {label}
          {optional && <span className="text-[12px] font-normal text-ink-muted">Optional</span>}
        </label>
        <div className="relative flex items-center">
          {prefix && <span className="pointer-events-none absolute left-3 text-body text-ink-muted">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-control-md w-full rounded-md border bg-surface px-3 text-body text-ink outline-none transition-colors placeholder:text-ink-muted',
              'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
              error ? 'border-danger' : 'border-line-strong',
              prefix && 'pl-7',
              suffix && 'pr-9',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
          {suffix && <span className="pointer-events-none absolute right-3 text-body text-ink-muted">{suffix}</span>}
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
Input.displayName = 'Input'
