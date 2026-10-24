import * as React from 'react'

import { defaultKind } from '@/data/sources'
import { ApiError } from '@/data/http/httpClient'
import { sessionApi } from '@/data/http/httpSession'
import { describeError } from '@/lib/errors'
import { Button } from '@/components/daydor/Button'
import type { DevUser, Session } from '@/session/types'

type State = { status: 'loading' } | { status: 'ready'; session: Session } | { status: 'signed-out' } | { status: 'error'; title: string; message: string }

export interface SessionApi {
  session: Session
  /** Does the signed-in role have this screen? */
  canOpen: (screen: string) => boolean
  /** May the signed-in role decide an approval of this gate? (The database still decides; this only leaves the button out.) */
  canDecide: (gate: string | undefined) => boolean
  /** Development only: switch to another seeded person. */
  switchTo: (email: string) => Promise<void>
  devUsers: () => Promise<DevUser[]>
  devLoginAvailable: boolean
}

const MOCK_SESSION: Session = {
  id: 'mock', email: 'founder@example.test', display_name: 'Abhijeet Singh', role: 'tenant_founder', role_letter: 'F', role_label: 'Founder',
  tenant_id: null, tenant_name: 'Acme Labs', user_id: null, employee_id: null,
  capabilities: {
    workflow_timeline: true, directory: true, decides: ['*'],
    screens: { home: true, leave: true, hiring: true, payroll: true, compliance: true, expenses: true, benefits: true, documents: true, people: true, settings: true },
  },
}

const SessionContext = React.createContext<SessionApi | null>(null)

export function buildSessionApi(session: Session, devLoginAvailable: boolean, over: Partial<SessionApi> = {}): SessionApi {
  return {
    session,
    canOpen: (screen) => session.capabilities.screens[screen] === true,
    canDecide: (gate) => session.capabilities.decides.includes('*') || (gate !== undefined && session.capabilities.decides.includes(gate)),
    switchTo: async (email) => {
      await sessionApi.devLogin(email)
      window.location.assign('/')
    },
    devUsers: sessionApi.devUsers,
    devLoginAvailable,
    ...over,
  }
}

/** A session that is simply given (tests, design previews): no sign-in, no request. */
export function StaticSessionProvider({ session, devLoginAvailable = false, over, children }: {
  session: Session
  devLoginAvailable?: boolean
  over?: Partial<SessionApi>
  children: React.ReactNode
}) {
  const api = React.useMemo(() => buildSessionApi(session, devLoginAvailable, over), [session, devLoginAvailable, over])
  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}

function devLoginOffered(force?: boolean): boolean {
  if (force !== undefined) return force
  const env = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env ?? {}
  return env.DEV === true || env.VITE_DEV_LOGIN === '1'
}

/** `kind` and `devLogin` default to the build's settings; a test or a preview can say otherwise. */
export function SessionProvider({ children, kind, devLogin }: { children: React.ReactNode; kind?: 'mock' | 'http'; devLogin?: boolean }) {
  const mock = (kind ?? defaultKind()) === 'mock'
  const [state, setState] = React.useState<State>(mock ? { status: 'ready', session: MOCK_SESSION } : { status: 'loading' })
  const [rev, setRev] = React.useState(0)

  React.useEffect(() => {
    if (mock) return
    let cancelled = false
    sessionApi.me().then(
      (session) => !cancelled && setState({ status: 'ready', session }),
      (e) => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 401) setState({ status: 'signed-out' })
        else {
          const d = describeError(e)
          setState({ status: 'error', title: d.title, message: d.message })
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [mock, rev])

  const api = React.useMemo<SessionApi | null>(
    () => (state.status === 'ready' ? buildSessionApi(state.session, devLoginOffered(devLogin) && !mock) : null),
    [state, mock],
  )

  if (state.status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-canvas text-body text-ink-muted">Loading…</div>
  }
  if (state.status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-center">
        <p className="m-0 text-body font-medium text-ink">{state.title}</p>
        <p className="m-0 max-w-[420px] text-small text-ink-muted">{state.message}</p>
        <Button variant="secondary" onClick={() => setRev((n) => n + 1)}>Try again</Button>
      </div>
    )
  }
  if (state.status === 'signed-out' || api === null) return <SignedOut onDone={() => setRev((n) => n + 1)} devLogin={devLogin} />
  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}

/** Shown when there is no valid session. Production sign-in is not built (deferred); in development the seeded people are offered. */
function SignedOut({ onDone, devLogin }: { onDone: () => void; devLogin?: boolean }) {
  const [users, setUsers] = React.useState<DevUser[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const offered = devLoginOffered(devLogin)

  React.useEffect(() => {
    if (!offered) return
    sessionApi.devUsers().then(setUsers, () => setFailed(true))
  }, [offered])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="m-0 text-[17px] font-semibold tracking-[-0.03em] text-brand">daydor</p>
      <p className="m-0 text-body font-medium text-ink">You are signed out</p>
      {!offered && <p className="m-0 max-w-[420px] text-small text-ink-muted">Sign-in is not available yet in this environment. Ask your administrator for access.</p>}
      {offered && failed && <p className="m-0 max-w-[420px] text-small text-ink-muted">The development sign-in is not available on this server.</p>}
      {offered && users && (
        <div className="flex w-[360px] flex-col gap-1.5">
          <p className="m-0 text-[12px] text-ink-muted">Development sign-in: choose who to be</p>
          {users.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => sessionApi.devLogin(u.email).then(onDone)}
              className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-left text-small hover:bg-surface-sunken"
            >
              <span className="font-medium text-ink">{u.display_name}</span>
              <span className="text-ink-muted">{u.role_label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function useSession(): SessionApi {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}
