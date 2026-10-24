import { ApiError } from '@/data/http/httpClient'

export interface Described {
  /** One line: what happened. */
  title: string
  /** What the person can do about it. */
  message: string
  kind: 'forbidden' | 'conflict' | 'unavailable' | 'invalid' | 'signed-out' | 'not-found' | 'network' | 'error'
}

/** The words the screens use for a failed call. 403, 409 and 503 each say what they mean; nothing fails silently. */
export function describeError(e: unknown): Described {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 0:
        return { kind: 'network', title: 'Could not reach Daydor', message: 'Check your connection and try again.' }
      case 401:
        return { kind: 'signed-out', title: 'You are signed out', message: 'Your session has ended. Sign in again to continue.' }
      case 403:
        if (e.code === 'screen_not_available') return { kind: 'forbidden', title: 'Your role does not have this screen', message: 'Ask an administrator if you think you should.' }
        return { kind: 'forbidden', title: 'Your role cannot do this', message: e.message || 'Ask someone with the right role to do it.' }
      case 404:
        return { kind: 'not-found', title: 'Not found', message: e.message || 'That record no longer exists.' }
      case 409:
        return { kind: 'conflict', title: 'This changed while you were looking', message: `${e.message || 'It was already decided or updated.'} The screen has been refreshed.` }
      case 422:
        return { kind: 'invalid', title: 'Check what you entered', message: e.message }
      case 503:
        return { kind: 'unavailable', title: 'The workflow service is not available', message: 'Nothing was started. Try again in a moment.' }
      default:
        return { kind: 'error', title: 'Something went wrong', message: e.message || 'Try again, and tell us if it keeps happening.' }
    }
  }
  return { kind: 'error', title: 'Something went wrong', message: e instanceof Error ? e.message : 'Try again.' }
}
