import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ApiError } from '@/data/http/httpClient'
import { NotifyProvider } from '@/lib/notify'
import { StaticSessionProvider, type SessionApi } from '@/session/SessionContext'
import type { Session } from '@/session/types'

export const ALL_SCREENS = ['home', 'leave', 'hiring', 'payroll', 'compliance', 'expenses', 'benefits', 'documents', 'people', 'settings']

export function makeSession(role = 'tenant_founder', over: Partial<Session> = {}, caps: Partial<Session['capabilities']> = {}): Session {
  return {
    id: 's1', email: 'x@acme.test', display_name: 'Rohan Mehta', role, role_letter: 'F', role_label: role.replace('tenant_', '').replace(/^./, (c) => c.toUpperCase()),
    tenant_id: 't1', tenant_name: 'Acme Technologies', user_id: 'u1', employee_id: 'e1',
    capabilities: { workflow_timeline: true, directory: true, decides: [], screens: Object.fromEntries(ALL_SCREENS.map((s) => [s, true])), ...caps },
    ...over,
  }
}

export function renderScreen(ui: ReactElement, opts: { session?: Session; devLogin?: boolean; over?: Partial<SessionApi>; route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[opts.route ?? '/']}>
      <NotifyProvider>
        <StaticSessionProvider session={opts.session ?? makeSession()} devLoginAvailable={opts.devLogin} over={opts.over}>
          {ui}
        </StaticSessionProvider>
      </NotifyProvider>
    </MemoryRouter>,
  )
}

/** A source that is the given one with some methods replaced (a method of the prototype chain is still found). */
export function withOverrides<T extends object>(base: T, over: Partial<Record<keyof T, unknown>>): T {
  return Object.assign(Object.create(base), over) as T
}

export const never = <T,>() => new Promise<T>(() => {})
export const refused = (status: number, code = 'forbidden', message = '') => Promise.reject(new ApiError(status, code, message))
