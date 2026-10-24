import { cn } from '@/lib/utils'

export interface BriefStat {
  value: React.ReactNode
  label: React.ReactNode
  tone?: 'warning' | 'brand'
}

export interface BriefProps {
  greeting: React.ReactNode
  date?: React.ReactNode
  summary?: React.ReactNode
  stats?: BriefStat[]
  children?: React.ReactNode
}

export function Brief({ greeting, date, summary, stats, children }: BriefProps) {
  return (
    <div className="max-w-conversation">
      {date && <p className="eyebrow m-0 text-ink-muted">{date}</p>}
      <h1 className="display mt-1.5 text-ink">{greeting}</h1>
      {summary && <p className="mt-3 max-w-[600px] text-reading text-ink-muted">{summary}</p>}
      {stats && stats.length > 0 && (
        <dl className="mt-6 flex gap-8">
          {stats.slice(0, 4).map((stat, i) => (
            <div key={i} className="flex flex-col-reverse">
              <dt className="mt-0.5 text-[12px] leading-4 text-ink-muted">{stat.label}</dt>
              <dd
                className={cn(
                  'text-figure tabular-nums text-ink',
                  stat.tone === 'warning' && 'text-warning',
                  stat.tone === 'brand' && 'text-brand',
                )}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </div>
  )
}
