import * as React from 'react'

import { Badge } from '@/components/daydor/Badge'
import { Button } from '@/components/daydor/Button'
import { Icon } from '@/components/daydor/Icon'
import { cn } from '@/lib/utils'

export type ProfileFieldTier = 'direct' | 'review' | 'gated'

export interface ProfileFieldProps {
  label: React.ReactNode
  value: React.ReactNode
  tier?: ProfileFieldTier
  pending?: React.ReactNode
  onEdit?: () => void
  actionLabel?: string
}

const TIER_ACTION_LABEL: Record<ProfileFieldTier, string> = {
  direct: 'Edit',
  review: 'Request change',
  gated: 'Change',
}

export function ProfileField({ label, value, tier = 'direct', pending, onEdit, actionLabel }: ProfileFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className={cn('flex items-center gap-1.5 text-[12px] leading-4 text-ink-muted', tier === 'gated' && 'text-irreversible')}>
          {tier === 'gated' && <Icon name="lock" size={12} />}
          {label}
        </dt>
        <dd className="m-0 text-[14px] leading-5 text-ink">{value}</dd>
        {pending && (
          <span className="mt-0.5 inline-flex w-fit items-center">
            <Badge tone="info" icon="clock">
              In review · {pending}
            </Badge>
          </span>
        )}
      </div>
      {onEdit && (
        <Button size="sm" variant="ghost" onClick={onEdit}>
          {actionLabel ?? TIER_ACTION_LABEL[tier]}
        </Button>
      )}
    </div>
  )
}

export interface ProfileFieldGroupProps {
  title: string
  fields: ProfileFieldProps[]
}

export function ProfileFieldGroup({ title, fields }: ProfileFieldGroupProps) {
  return (
    <div className="flex flex-col">
      <p className="m-0 mb-1 text-[12px] font-medium text-ink-muted">{title}</p>
      <dl className="divide-y divide-line">
        {fields.map((field, i) => (
          <ProfileField key={i} {...field} />
        ))}
      </dl>
    </div>
  )
}
