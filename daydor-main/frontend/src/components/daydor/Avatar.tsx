import { cn } from '@/lib/utils'

export interface AvatarProps {
  kind?: 'daydor' | 'person'
  name?: string
  size?: number
  live?: boolean
  className?: string
}

function initials(name?: string) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

export function Avatar({ kind = 'daydor', name, size = 28, live = false }: AvatarProps) {
  const isDaydor = kind === 'daydor'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none',
        isDaydor
          ? 'bg-brand text-on-brand'
          : 'border border-line bg-surface-sunken font-medium text-ink-muted',
        live && 'animate-[dd-pulse_1.8s_ease-out_infinite]',
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden={isDaydor ? true : undefined}
    >
      {isDaydor ? 'd' : initials(name)}
    </span>
  )
}
