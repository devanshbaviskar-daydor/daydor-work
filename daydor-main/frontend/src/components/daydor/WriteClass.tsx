import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'

export type WriteLevel = 'read' | 'guarded' | 'irreversible'

const CONFIG = {
  read: { icon: 'eye', label: 'Read-only', className: 'text-ink-muted' },
  guarded: { icon: 'shield', label: 'Reversible', className: 'text-info' },
  irreversible: {
    icon: 'lock',
    label: 'Irreversible',
    className: 'rounded-sm bg-irreversible-soft px-2 py-[3px] text-irreversible',
  },
} as const

export interface WriteClassProps {
  level?: WriteLevel
  iconOnly?: boolean
  className?: string
}

export function WriteClass({ level = 'read', iconOnly, className }: WriteClassProps) {
  const { icon, label, className: toneClass } = CONFIG[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] whitespace-nowrap text-[12px] leading-4 font-medium text-ink-muted',
        toneClass,
        className,
      )}
    >
      <Icon name={icon} size={13} />
      {!iconOnly && label}
    </span>
  )
}
