import * as React from 'react'

import { ApiError } from '@/data/http/httpClient'
import { useNotify } from '@/lib/notify'

export interface ActionOptions {
  /** Shown when the action succeeds. */
  success?: string
}

/**
 * The one way a screen does something to the world. While it runs `busy` is true; when it ends the screen reloads (after a conflict too, because the thing
 * changed under the person); a failure is shown in words (403, 409, 503, network...) and returned as `false`, never swallowed.
 */
export function useAction(reload: () => void) {
  const { notify, fail } = useNotify()
  const [busy, setBusy] = React.useState<string | null>(null)

  const run = React.useCallback(
    async (key: string, fn: () => Promise<unknown>, opts: ActionOptions = {}): Promise<boolean> => {
      setBusy(key)
      try {
        await fn()
        if (opts.success) notify({ tone: 'success', title: opts.success })
        reload()
        return true
      } catch (e) {
        fail(e)
        if (e instanceof ApiError && e.status === 409) reload()
        return false
      } finally {
        setBusy(null)
      }
    },
    [reload, notify, fail],
  )

  return { run, busy, isBusy: (key: string) => busy === key }
}
