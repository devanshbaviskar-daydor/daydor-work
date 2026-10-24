import { cn } from '@/lib/utils'
import type { AttendanceDay, AttendancePerson } from '@/types/leave'

export interface AttendanceGridProps {
  days: AttendanceDay[]
  people: AttendancePerson[]
  legend?: boolean
}

const MARK: Record<string, { cellClass: string; text: string; label: string }> = {
  P: { cellClass: 'bg-brand-soft', text: '', label: 'Present' },
  A: { cellClass: 'bg-danger-soft text-danger', text: 'A', label: 'Absent' },
  H: { cellClass: 'bg-warning-soft text-warning', text: '½', label: 'Half day' },
  L: { cellClass: 'bg-info-soft text-info', text: 'L', label: 'On leave' },
  O: { cellClass: 'bg-surface-sunken', text: '', label: 'Weekly off / holiday' },
  '-': { cellClass: 'border border-dashed border-line', text: '', label: 'Upcoming' },
}

const LEGEND_ORDER = ['P', 'L', 'H', 'A', 'O'] as const

export function AttendanceGrid({ days, people, legend = true }: AttendanceGridProps) {
  return (
    <div>
      <table className="w-full border-separate text-[13px] leading-[18px]" style={{ borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            <th scope="col" className="p-0 pr-3 text-left font-medium text-ink-muted">
              <span className="sr-only">Person</span>
            </th>
            {days.map((d, i) => (
              <th key={i} scope="col" className={cn('font-normal', d.today && 'text-ink')}>
                <div>{d.label}</div>
                {d.sub && <div className="text-[11px] font-normal text-ink-muted">{d.sub}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.name}>
              <th scope="row" className="whitespace-nowrap pr-3 text-left text-[13px] font-medium text-ink">
                {p.name}
              </th>
              {p.marks.split('').map((m, i) => {
                const mark = MARK[m] ?? MARK['-']
                return (
                  <td key={i} className={cn(days[i]?.today && 'text-ink')}>
                    <span
                      className={cn(
                        'inline-flex h-[18px] w-5 items-center justify-center rounded-sm text-[10px] font-semibold tabular-nums',
                        mark.cellClass,
                      )}
                      title={mark.label}
                    >
                      {mark.text}
                      <span className="sr-only">{mark.label}</span>
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {legend && (
        <div className="flex flex-wrap gap-4 text-[12px] leading-4 text-ink-muted">
          {LEGEND_ORDER.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={cn('inline-flex h-[18px] w-5 items-center justify-center rounded-sm text-[10px] font-semibold', MARK[k].cellClass)}>
                {MARK[k].text}
              </span>
              {MARK[k].label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
