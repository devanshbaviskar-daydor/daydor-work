import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ScreenState } from '@/components/daydor/ScreenState'
import { ApiError } from '@/data/http/httpClient'
import { renderScreen } from '@/test/helpers'

describe('ScreenState', () => {
  it('says it is loading when there is no error', () => {
    renderScreen(<ScreenState />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('says a screen is not for the role, with no retry', () => {
    renderScreen(<ScreenState error={new ApiError(403, 'screen_not_available', 'x')} onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Your role does not have this screen')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })

  it('says the service is unavailable and offers a retry that works', async () => {
    const retry = vi.fn()
    renderScreen(<ScreenState error={new ApiError(503, 'workflow_engine_unavailable', '')} onRetry={retry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('The workflow service is not available')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalled()
  })

  it('says it could not reach Daydor on a network failure', () => {
    renderScreen(<ScreenState error={new ApiError(0, 'network_error', 'x')} onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not reach Daydor')
  })
})
