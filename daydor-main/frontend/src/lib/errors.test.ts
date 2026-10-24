import { describe, expect, it } from 'vitest'

import { ApiError } from '@/data/http/httpClient'
import { describeError } from '@/lib/errors'

const d = (status: number, code = 'x', message = '') => describeError(new ApiError(status, code, message))

describe('describeError', () => {
  it('says what each status means', () => {
    expect(d(0).kind).toBe('network')
    expect(d(401).kind).toBe('signed-out')
    expect(d(403, 'forbidden', 'Only HR can do this.')).toMatchObject({ kind: 'forbidden', title: 'Your role cannot do this', message: 'Only HR can do this.' })
    expect(d(404).kind).toBe('not-found')
    expect(d(409, 'already_done', 'That task is already done.')).toMatchObject({ kind: 'conflict' })
    expect(d(409).message).toContain('refreshed')
    expect(d(422, 'invalid_request', 'Check these fields: x').kind).toBe('invalid')
    expect(d(503, 'workflow_engine_unavailable')).toMatchObject({ kind: 'unavailable', message: expect.stringContaining('Nothing was started') })
    expect(d(500).kind).toBe('error')
  })

  it('names a screen the role does not have', () => {
    expect(d(403, 'screen_not_available').title).toBe('Your role does not have this screen')
  })

  it('copes with something that is not an ApiError', () => {
    expect(describeError(new Error('boom'))).toMatchObject({ kind: 'error', message: 'boom' })
    expect(describeError('x').kind).toBe('error')
  })
})
