import * as React from 'react'

import { Sidebar, type NavItem } from '@/components/daydor/Sidebar'
import { mainNavItems } from '@/components/daydor/navItems'
import { useSession } from '@/session/SessionContext'
import type { DevUser } from '@/session/types'

export interface AppSidebarProps {
  needsYouCount?: number
  peopleCount?: number
}

/** The navigation every screen shares: the signed-in person and workspace, and only the screens their role has. */
export function AppSidebar({ needsYouCount, peopleCount }: AppSidebarProps) {
  const { session, canOpen, devLoginAvailable, devUsers, switchTo } = useSession()
  const [users, setUsers] = React.useState<DevUser[] | null>(null)
  const [open, setOpen] = React.useState(false)

  const items = mainNavItems({ needsYouCount, peopleCount }).filter((i) => canOpen(i.screen))
  const footer: NavItem[] = devLoginAvailable
    ? [{ key: 'switch', label: 'Switch user (dev)', icon: 'users', onClick: () => { setOpen((v) => !v); if (!users) devUsers().then(setUsers) } }]
    : []

  return (
    <div className="relative h-full">
      <Sidebar
        workspace={session.tenant_name ?? 'Daydor'}
        user={{ name: session.display_name, role: session.role_label }}
        items={items}
        footerItems={footer}
      />
      {open && users && (
        <div className="absolute bottom-16 left-3 z-40 flex w-[208px] flex-col gap-0.5 rounded-lg border border-line bg-surface p-1.5 shadow-md">
          {users.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => void switchTo(u.email)}
              className="flex flex-col rounded-md px-2.5 py-1.5 text-left hover:bg-surface-sunken"
            >
              <span className="text-small font-medium text-ink">{u.display_name}</span>
              <span className="text-[12px] text-ink-muted">{u.role_label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
