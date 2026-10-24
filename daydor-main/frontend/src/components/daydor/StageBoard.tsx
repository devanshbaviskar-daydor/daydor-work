import * as React from 'react'

import { CandidateCard, type CandidateCardProps } from '@/components/daydor/CandidateCard'

export interface StageBoardStage {
  key: string
  label: string
  count?: number
  empty?: React.ReactNode
}

export interface StageBoardItem extends CandidateCardProps {
  stage: string
  id?: string
}

export interface StageBoardProps {
  stages: StageBoardStage[]
  items: StageBoardItem[]
}

export function StageBoard({ stages, items }: StageBoardProps) {
  return (
    <div className="grid auto-cols-[minmax(160px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1" role="list">
      {stages.map((st) => {
        const cards = items.filter((it) => it.stage === st.key)
        return (
          <section
            key={st.key}
            role="listitem"
            aria-label={st.label}
            className="flex min-w-0 flex-col gap-2 rounded-lg bg-surface-sunken p-2 pt-3"
          >
            <header className="flex items-center justify-between px-1.5 pb-0.5 text-[12px] font-semibold leading-4">
              <span>{st.label}</span>
              <span className="font-medium tabular-nums text-ink-muted">{st.count ?? cards.length}</span>
            </header>
            <div className="flex flex-col gap-2">
              {cards.length ? (
                cards.map((c) => <CandidateCard key={c.id ?? c.name} {...c} />)
              ) : (
                <div className="px-1.5 py-4 text-center text-[12px] text-ink-muted">{st.empty ?? '—'}</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
