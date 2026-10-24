import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/data/http/httpClient'
import { sessionApi } from '@/data/http/httpSession'
import { SessionProvider, useSession } from '@/session/SessionContext'
import { makeSession } from '@/test/helpers'

function Who() {
  const { session, canOpen, canDecide } = useSession()
  return <p>{`${session.display_name}|${canOpen('payroll')}|${canDecide('g_leave')}`}</p>
}

let DEV = false
afterEach(() => {
  DEV = false
  vi.restoreAllMocks()
})

describe('SessionProvider (against the API)', () => {
  it('shows the app with what the API says about the role', async () => {
    vi.spyOn(sessionApi, 'me').mockResolvedValue(makeSession('tenant_manager', { display_name: 'Meera Iyer' }, { screens: { payroll: false }, decides: ['g_leave'] }))
    render(<SessionProvider kind="http" devLogin={DEV}><Who /></SessionProvider>)
    expect(await screen.findByText('Meera Iyer|false|true')).toBeInTheDocument()
  })

  it('says you are signed out on a 401 and offers the development people only in development', async () => {
    DEV = true
    vi.spyOn(sessionApi, 'me').mockRejectedValue(new ApiError(401, 'session_expired', 'x'))
    vi.spyOn(sessionApi, 'devUsers').mockResolvedValue([{ email: 'a@acme.test', display_name: 'Arjun Rao', role: 'tenant_employee', role_label: 'Employee', tenant_name: 'Acme' }])
    render(<SessionProvider kind="http" devLogin={DEV}><Who /></SessionProvider>)
    expect(await screen.findByText('You are signed out')).toBeInTheDocument()
    expect(await screen.findByText('Arjun Rao')).toBeInTheDocument()
  })

  it('says sign-in is not available when the development sign-in is off', async () => {
    vi.spyOn(sessionApi, 'me').mockRejectedValue(new ApiError(401, 'not_signed_in', 'x'))
    const users = vi.spyOn(sessionApi, 'devUsers')
    render(<SessionProvider kind="http" devLogin={DEV}><Who /></SessionProvider>)
    expect(await screen.findByText(/Sign-in is not available yet/)).toBeInTheDocument()
    expect(users).not.toHaveBeenCalled()
  })

  it('shows a failure to load the session instead of an empty page', async () => {
    vi.spyOn(sessionApi, 'me').mockRejectedValue(new ApiError(503, 'workflow_engine_unavailable', 'x'))
    render(<SessionProvider kind="http" devLogin={DEV}><Who /></SessionProvider>)
    expect(await screen.findByText('The workflow service is not available')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
