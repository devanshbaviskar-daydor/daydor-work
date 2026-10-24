import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useLoad } from '@/lib/useLoad'

describe('useLoad', () => {
  it('loads, then reloads on demand', async () => {
    const load = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b')
    const { result } = renderHook(() => useLoad(load, []))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('a'))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toBe('b'))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('returns a failure instead of swallowing it, and recovers on reload', async () => {
    const boom = new Error('nope')
    const load = vi.fn().mockRejectedValueOnce(boom).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useLoad(load, []))
    await waitFor(() => expect(result.current.error).toBe(boom))
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toBe('ok'))
    expect(result.current.error).toBeNull()
  })
})
