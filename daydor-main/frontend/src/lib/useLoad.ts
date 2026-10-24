import * as React from 'react'

export interface Loaded<T> {
  data: T | null
  error: unknown
  loading: boolean
  /** Fetch again (after an action, or after a refused or conflicting one). */
  reload: () => void
}

/** Load once per `deps` and again on `reload()`. A failed load is returned, never swallowed, so the screen can say what happened. */
export function useLoad<T>(load: () => Promise<T>, deps: React.DependencyList): Loaded<T> {
  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<unknown>(null)
  const [loading, setLoading] = React.useState(true)
  const [rev, setRev] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    load().then(
      (d) => {
        if (cancelled) return
        setData(d)
        setError(null)
        setLoading(false)
      },
      (e) => {
        if (cancelled) return
        setError(e)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, rev])

  const reload = React.useCallback(() => setRev((n) => n + 1), [])
  return { data, error, loading, reload }
}
