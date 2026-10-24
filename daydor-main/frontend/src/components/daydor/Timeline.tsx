import { Avatar } from '@/components/daydor/Avatar'
import { WriteClass, type WriteLevel } from '@/components/daydor/WriteClass'

export interface TimelineItem {
  text: string
  domain?: string
  time: string
  writeClass?: WriteLevel
  by?: 'person'
  name?: string
}

export interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <Avatar kind={item.by === 'person' ? 'person' : 'daydor'} name={item.name} size={24} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="m-0 text-[13px] leading-[18px] text-ink">{item.text}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] leading-4 text-ink-muted">
              {item.domain && <span>{item.domain}</span>}
              {item.domain && <span aria-hidden="true">·</span>}
              <span>{item.time}</span>
              {item.writeClass && (
                <>
                  <span aria-hidden="true">·</span>
                  <WriteClass level={item.writeClass} />
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
