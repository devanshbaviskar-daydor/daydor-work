import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ALL_SCREENS, makeSession, renderScreen } from '@/test/helpers'

describe('the sidebar', () => {
  it('shows who is signed in and where', () => {
    renderScreen(<AppSidebar />, { session: makeSession('tenant_hr', { display_name: 'Kavya Menon', tenant_name: 'Acme Technologies' }) })
    expect(screen.getByText('Kavya Menon')).toBeInTheDocument()
    expect(screen.getByText('Acme Technologies')).toBeInTheDocument()
    expect(screen.queryByText('Abhijeet Singh')).toBeNull()
  })

  it('lists only the screens the role has', () => {
    const screens = Object.fromEntries(ALL_SCREENS.map((s) => [s, ['home', 'leave', 'people', 'settings'].includes(s)]))
    renderScreen(<AppSidebar />, { session: makeSession('tenant_manager', {}, { screens }) })
    for (const name of ['Home', 'People', 'Leave & attendance', 'Settings']) expect(screen.getByRole('link', { name: new RegExp(name) })).toBeInTheDocument()
    for (const name of ['Payroll', 'Compliance', 'Benefits', 'Documents', 'Hiring', 'Expenses']) expect(screen.queryByRole('link', { name: new RegExp(name) })).toBeNull()
  })

  it('offers switching user only where the development sign-in is on', () => {
    const { unmount } = renderScreen(<AppSidebar />, { devLogin: false })
    expect(screen.queryByText(/Switch user/)).toBeNull()
    unmount()
    renderScreen(<AppSidebar />, { devLogin: true })
    expect(screen.getByText(/Switch user/)).toBeInTheDocument()
  })

  it('shows the counts it is given', () => {
    renderScreen(<AppSidebar needsYouCount={3} peopleCount={12} />)
    expect(screen.getByRole('link', { name: /Home/ })).toHaveTextContent('3')
    expect(screen.getByRole('link', { name: /People/ })).toHaveTextContent('12')
  })
})
