import { cn } from '@/lib/utils'

export function formatINR(value: number, opts?: { compact?: boolean; paise?: boolean }): string {
  const negative = value < 0
  const abs = Math.abs(value)

  if (opts?.compact) {
    if (abs >= 1e7) return `${negative ? '−' : ''}₹${(abs / 1e7).toFixed(2)} Cr`
    if (abs >= 1e5) return `${negative ? '−' : ''}₹${(abs / 1e5).toFixed(2)} L`
  }

  const [rupeesStr, paiseStr] = abs.toFixed(2).split('.')
  const lastThree = rupeesStr.slice(-3)
  const rest = rupeesStr.slice(0, -3)
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}` : lastThree

  const showPaise = opts?.paise === true || (opts?.paise !== false && paiseStr !== '00')
  const amount = showPaise ? `${grouped}.${paiseStr}` : grouped
  return `${negative ? '−' : ''}₹${amount}`
}

export interface AmountProps {
  value: number
  compact?: boolean
  paise?: boolean
  size?: 'md' | 'lg'
  tone?: 'muted' | 'danger' | 'success'
  className?: string
}

const TONE_CLASS = {
  muted: 'text-ink-muted',
  danger: 'text-danger',
  success: 'text-success',
}

export function Amount({ value, compact, paise, size = 'md', tone, className }: AmountProps) {
  const formatted = formatINR(value, { compact, paise })
  return (
    <span
      className={cn(
        'tabular-nums',
        size === 'lg' && 'text-figure',
        tone && TONE_CLASS[tone],
        className,
      )}
      title={compact ? formatINR(value) : undefined}
    >
      {formatted}
    </span>
  )
}
