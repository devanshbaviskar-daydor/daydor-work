import { Amount } from '@/components/daydor/Amount'
import { Icon } from '@/components/daydor/Icon'
import { cn } from '@/lib/utils'

export interface FactListItem {
  label: string
  value: number | React.ReactNode
  mono?: boolean
  locked?: boolean
}

export interface FactListProps {
  items: FactListItem[]
  columns?: 1 | 2
}

export function FactList({ items, columns = 1 }: FactListProps) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-2.5', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {items.map((item, i) => (
        <div key={i} className="flex items-baseline justify-between gap-3 text-[13px] leading-[18px]">
          <dt className="flex items-center gap-1 text-ink-muted">
            {item.locked && <Icon name="lock" size={12} />}
            {item.label}
          </dt>
          <dd className={cn('font-medium text-ink', item.mono && 'font-mono tabular-nums')}>
            {typeof item.value === 'number' ? <Amount value={item.value} /> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
