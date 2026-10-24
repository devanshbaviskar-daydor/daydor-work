import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/data/http/httpClient'
import { NotifyProvider } from '@/lib/notify'
import { useAction } from '@/lib/useAction'

const wrapper = ({ children }: { children: ReactNode }) => <NotifyProvider>{children}</NotifyProvider>

describe('useAction', () => {
  it('reloads after success and says it worked', async () => {
    const reload = vi.fn()
    const { result } = renderHook(() => useAction(reload), { wrapper })
    let ok = false
    await act(async () => { ok = await result.current.run('k', async () => 1) })
    expect(ok).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('returns false and does not reload on a refusal; reloads on a conflict; is not busy afterwards', async () => {
    const reload = vi.fn()
    const { result } = renderHook(() => useAction(reload), { wrapper })
    let ok = true
    await act(async () => { ok = await result.current.run('k', () => Promise.reject(new ApiError(403, 'forbidden', 'no'))) })
    expect(ok).toBe(false)
    expect(reload).not.toHaveBeenCalled()
    await act(async () => { await result.current.run('k', () => Promise.reject(new ApiError(409, 'already_resolved', 'done'))) })
    expect(reload).toHaveBeenCalledTimes(1)
    expect(result.current.busy).toBeNull()
  })
})
