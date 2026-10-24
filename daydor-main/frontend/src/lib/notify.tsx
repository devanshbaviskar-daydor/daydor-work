import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'
import { describeError } from '@/lib/errors'

export interface Notice {
  id: number
  tone: 'success' | 'danger' | 'info'
  title: string
  message?: string
}

interface NotifyApi {
  notify: (n: Omit<Notice, 'id'>) => void
  /** Show a failed call in words (403, 409, 503, ...). */
  fail: (e: unknown) => void
}

const NotifyContext = React.createContext<NotifyApi>({ notify: () => undefined, fail: () => undefined })

export function NotifyProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = React.useState<Notice[]>([])
  const next = React.useRef(1)

  const dismiss = React.useCallback((id: number) => setNotices((all) => all.filter((n) => n.id !== id)), [])
  const notify = React.useCallback(
    (n: Omit<Notice, 'id'>) => {
      const id = next.current++
      setNotices((all) => [...all.slice(-3), { ...n, id }])
      window.setTimeout(() => dismiss(id), n.tone === 'danger' ? 9000 : 4500)
    },
    [dismiss],
  )
  const fail = React.useCallback(
    (e: unknown) => {
      const d = describeError(e)
      notify({ tone: 'danger', title: d.title, message: d.message })
    },
    [notify],
  )
  const api = React.useMemo(() => ({ notify, fail }), [notify, fail])

  return (
    <NotifyContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[360px] flex-col gap-2">
        {notices.map((n) => (
          <div
            key={n.id}
            role={n.tone === 'danger' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-surface p-3.5 shadow-md',
              n.tone === 'danger' ? 'border-danger/30' : n.tone === 'success' ? 'border-success/30' : 'border-line',
            )}
          >
            <Icon
              name={n.tone === 'danger' ? 'alert' : 'check'}
              size={16}
              className={cn('mt-0.5 shrink-0', n.tone === 'danger' ? 'text-danger' : n.tone === 'success' ? 'text-success' : 'text-ink-muted')}
            />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-small font-medium text-ink">{n.title}</p>
              {n.message && <p className="m-0 mt-0.5 text-[12px] leading-[17px] text-ink-muted">{n.message}</p>}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(n.id)} className="text-ink-muted hover:text-ink">
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  )
}

export function useNotify(): NotifyApi {
  return React.useContext(NotifyContext)
}
