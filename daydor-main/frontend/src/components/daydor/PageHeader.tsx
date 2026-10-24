import * as React from 'react'

import { Avatar } from '@/components/daydor/Avatar'
import { Badge, type Status } from '@/components/daydor/Badge'
import { Tabs, type TabsItem } from '@/components/daydor/Tabs'

export interface PageHeaderProps {
  title: React.ReactNode
  eyebrow?: string | string[]
  status?: Status
  description?: React.ReactNode
  actions?: React.ReactNode
  tabs?: TabsItem[]
  person?: string
}

export function PageHeader({ title, eyebrow, status, description, actions, tabs, person }: PageHeaderProps) {
  const eyebrowParts = eyebrow ? (Array.isArray(eyebrow) ? eyebrow : [eyebrow]) : []

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        {person && <Avatar kind="person" name={person} size={48} />}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {eyebrowParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-eyebrow text-ink-muted">
              {eyebrowParts.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span className="opacity-60" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span className={i === 0 ? 'text-ink' : undefined}>{p}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="m-0 flex items-center gap-3 text-[22px] font-medium leading-[30px] tracking-[-0.02em] text-ink">
            {title}
            {status && <Badge status={status} />}
          </h1>
          {description && <p className="m-0 max-w-[640px] text-[14px] leading-[21px] text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {tabs && <Tabs items={tabs} />}
    </header>
  )
}
