import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TableColumn<Row> {
  key: string
  header: React.ReactNode
  numeric?: boolean
  align?: 'left' | 'right'
  width?: number | string
  render?: (row: Row) => React.ReactNode
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[]
  rows: Row[]
  rowKey?: (row: Row, index: number) => React.Key
  caption?: string
  density?: 'comfortable' | 'compact'
  empty?: React.ReactNode
  className?: string
}

export function Table<Row>({
  columns,
  rows,
  rowKey,
  caption,
  density = 'comfortable',
  empty,
  className,
}: TableProps<Row>) {
  const rowHeight = density === 'compact' ? 'h-9' : 'h-12'

  if (rows.length === 0 && empty) {
    return (
      <div className={cn('rounded-lg border border-line bg-surface p-6 text-center text-body text-ink-muted', className)}>
        {empty}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <table className="w-full border-collapse text-body">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-2 text-[12px] font-medium text-ink-muted',
                  (col.align ?? (col.numeric ? 'right' : 'left')) === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? rowKey(row, i) : i} className={cn(rowHeight, 'border-b border-line last:border-b-0')}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 text-ink',
                    (col.align ?? (col.numeric ? 'right' : 'left')) === 'right' ? 'text-right tabular-nums' : 'text-left',
                  )}
                >
                  {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
