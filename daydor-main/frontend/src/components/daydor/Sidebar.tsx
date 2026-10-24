import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/daydor/Avatar'
import { Icon, type IconName } from '@/components/daydor/Icon'

export interface NavItem {
  key?: string
  label: string
  icon: IconName
  href?: string
  active?: boolean
  count?: number
  countTone?: 'warning'
  onClick?: () => void
}

export interface SidebarProps {
  items: NavItem[]
  workspace?: string
  user?: { name: string; role?: string }
  onAsk?: () => void
  footerItems?: NavItem[]
}

function NavRow({ item }: { item: NavItem }) {
  const location = useLocation()
  const active = item.href ? location.pathname === item.href : (item.active ?? false)

  const className = cn(
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body text-ink-muted transition-colors hover:bg-surface-sunken',
    active && 'bg-surface-sunken text-ink',
  )

  const content = (
    <>
      <Icon name={item.icon} size={16} className={active ? 'text-action' : undefined} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
            item.countTone === 'warning' ? 'bg-warning-soft text-warning' : 'text-ink-muted',
          )}
        >
          {item.count}
        </span>
      )}
    </>
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={item.onClick} className={className}>
      {content}
    </button>
  )
}

export function Sidebar({ items, workspace, user, onAsk, footerItems }: SidebarProps) {
  return (
    <nav className="flex h-full w-[232px] shrink-0 flex-col gap-6 border-r border-line bg-canvas px-3 py-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-brand">daydor</span>
      </div>

      {workspace && (
        <div className="px-2 text-small text-ink-muted">
          <span className="font-medium text-ink">{workspace}</span>
        </div>
      )}

      {onAsk && (
        <button
          type="button"
          onClick={onAsk}
          className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2 text-left text-small text-ink-muted transition-colors hover:bg-surface-sunken"
        >
          <Icon name="search" size={15} />
          Ask or go to…
          <span className="ml-auto rounded-sm border border-line bg-surface px-1.5 py-0.5 text-[11px]">⌘K</span>
        </button>
      )}

      <div className="flex flex-1 flex-col gap-0.5">
        {items.map((item) => (
          <NavRow key={item.key ?? item.label} item={item} />
        ))}
      </div>

      <div className="flex flex-col gap-0.5 border-t border-line pt-3">
        {(footerItems ?? []).map((item) => (
          <NavRow key={item.key ?? item.label} item={item} />
        ))}
        {user && (
          <div className="mt-2 flex items-center gap-2.5 px-2.5 py-1.5">
            <Avatar kind="person" name={user.name} size={28} />
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-small font-medium text-ink">{user.name}</p>
              {user.role && <p className="m-0 truncate text-[12px] text-ink-muted">{user.role}</p>}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
