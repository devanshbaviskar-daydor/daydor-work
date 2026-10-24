import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/components/daydor/Icon'

export type Status =
  | 'needs-you'
  | 'running'
  | 'done'
  | 'failed'
  | 'pending'
  | 'upcoming'
  | 'shortlist'
  | 'hold'
  | 'awaiting-consent'
  | 'in-review'
  | 'manager-review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'draft'
  | 'processing'
  | 'paid'
  | 'overdue'
  | 'filed'
  | 'active'
  | 'pending_confirmation'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

const STATUS_TONE: Record<Status, Tone> = {
  'needs-you': 'warning',
  running: 'info',
  done: 'success',
  failed: 'danger',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
  upcoming: 'neutral',
  shortlist: 'success',
  hold: 'neutral',
  'awaiting-consent': 'info',
  'in-review': 'info',
  'manager-review': 'neutral',
  draft: 'neutral',
  processing: 'info',
  paid: 'success',
  overdue: 'danger',
  filed: 'success',
  active: 'success',
  pending_confirmation: 'warning',
}

const STATUS_LABEL: Record<Status, string> = {
  'needs-you': 'Needs you',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  pending: 'Pending',
  upcoming: 'Upcoming',
  shortlist: 'Shortlist',
  hold: 'Hold',
  'awaiting-consent': 'Awaiting consent',
  'in-review': 'In review',
  'manager-review': 'With manager',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
  processing: 'Processing',
  paid: 'Paid',
  overdue: 'Overdue',
  filed: 'Filed',
  active: 'Active',
  pending_confirmation: 'Pending confirmation',
}

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  brand: 'bg-brand-soft text-brand',
}

const TONE_ICON: Record<Tone, IconName> = {
  neutral: 'dot',
  success: 'check',
  warning: 'clock',
  danger: 'alert',
  info: 'refresh',
  brand: 'dot',
}

export interface BadgeProps {
  status?: Status
  tone?: Tone
  icon?: IconName | false
  children?: React.ReactNode
  className?: string
}

export function Badge({ status, tone, icon, children, className }: BadgeProps) {
  const resolvedTone = tone ?? (status ? STATUS_TONE[status] : 'neutral')
  const resolvedIcon = icon === false ? null : icon ?? TONE_ICON[resolvedTone]
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-sm px-2 text-[12px] leading-4 font-medium',
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      {resolvedIcon ? <Icon name={resolvedIcon} size={13} /> : null}
      {children ?? (status ? STATUS_LABEL[status] : null)}
    </span>
  )
}
