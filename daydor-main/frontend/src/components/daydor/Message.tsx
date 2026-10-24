import { cn } from '@/lib/utils'
import { Avatar } from '@/components/daydor/Avatar'

export interface MessageProps {
  from?: 'daydor' | 'user'
  domain?: string
  time?: string
  streaming?: boolean
  children?: React.ReactNode
}

export function Message({ from = 'daydor', domain, time, streaming, children }: MessageProps) {
  if (from === 'user') {
    return (
      <div className="flex flex-col items-end gap-1 motion-safe:animate-[dd-rise_220ms_ease-out]">
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-surface-sunken px-3.5 py-2.5 text-reading text-ink">
          {children}
        </div>
        {time && <span className="text-[12px] text-ink-muted">{time}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 motion-safe:animate-[dd-rise_220ms_ease-out]">
      <Avatar kind="daydor" live={streaming} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-[5px]">
        {(domain || time) && (
          <div className="flex flex-wrap items-center gap-1.5 text-eyebrow text-ink-muted">
            {domain && <span className="text-ink">{domain}</span>}
            {domain && time && <span className="opacity-60">·</span>}
            {time && <span>{time}</span>}
          </div>
        )}
        <div
          className={cn(
            'space-y-3 text-reading text-ink [&>*:last-child]:mb-0',
            streaming && "[&>*:last-child]:after:ml-0.5 [&>*:last-child]:after:inline-block [&>*:last-child]:after:h-[15px] [&>*:last-child]:after:w-[7px] [&>*:last-child]:after:animate-pulse [&>*:last-child]:after:rounded-[1px] [&>*:last-child]:after:bg-brand [&>*:last-child]:after:align-[-2px] [&>*:last-child]:after:content-['']",
          )}
        >
          {Array.isArray(children) || typeof children === 'string' ? <p>{children}</p> : children}
        </div>
      </div>
    </div>
  )
}
