import { AppSidebar } from '@/components/daydor/AppSidebar'
import { Button } from '@/components/daydor/Button'
import { describeError } from '@/lib/errors'

export interface ScreenStateProps {
  error?: unknown
  /** Fetch again. */
  onRetry?: () => void
  /** Shown while loading when there is no error. */
  loadingLabel?: string
}

/** What a screen shows before it has data: the shell, and either "Loading…" or why the data did not come (403, 503, network) with a way to retry. */
export function ScreenState({ error, onRetry, loadingLabel = 'Loading…' }: ScreenStateProps) {
  const d = error ? describeError(error) : null
  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />
      <div className="flex flex-col items-center justify-center gap-2 px-8 text-center">
        {d ? (
          <>
            <p role="alert" className="m-0 text-body font-medium text-ink">{d.title}</p>
            <p className="m-0 max-w-[420px] text-small text-ink-muted">{d.message}</p>
            {d.kind !== 'forbidden' && onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">Try again</Button>
            )}
          </>
        ) : (
          <p className="m-0 text-body text-ink-muted">{loadingLabel}</p>
        )}
      </div>
    </div>
  )
}
