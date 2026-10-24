import { cn } from '@/lib/utils'

export type TabsItem = string | { label: string; active?: boolean; count?: number; onClick?: () => void }

export interface TabsProps {
  items: TabsItem[]
}

export function Tabs({ items }: TabsProps) {
  return (
    <div className="flex gap-5 border-b border-line" role="tablist">
      {items.map((t) => {
        const it = typeof t === 'string' ? { label: t } : t
        return (
          <button
            key={it.label}
            type="button"
            role="tab"
            aria-selected={it.active ? 'true' : 'false'}
            onClick={it.onClick}
            className={cn(
              'relative inline-flex items-center gap-1.5 whitespace-nowrap pb-2.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              it.active && 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-sm after:bg-ink',
            )}
          >
            {it.label}
            {it.count != null && <span className="tabular-nums text-ink-muted">{it.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
