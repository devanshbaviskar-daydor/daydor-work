import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'

export interface DeadlineProps {
  daysLeft?: number
  date?: string
  className?: string
}

function relativeLabel(daysLeft?: number) {
  if (daysLeft === undefined) return undefined
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}`
  if (daysLeft === 0) return 'Due today'
  return `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
}

export function Deadline({ daysLeft, date, className }: DeadlineProps) {
  const overdue = daysLeft !== undefined && daysLeft < 0
  const soon = daysLeft !== undefined && daysLeft >= 0 && daysLeft <= 3
  const label = relativeLabel(daysLeft)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] whitespace-nowrap text-[12px] leading-4 font-medium tabular-nums text-ink-muted',
        soon && 'text-warning',
        overdue && 'text-danger',
        className,
      )}
    >
      <Icon name="calendar" size={13} />
      {label}
      {label && date && <span className="font-normal"> · {date}</span>}
      {!label && date}
    </span>
  )
}
