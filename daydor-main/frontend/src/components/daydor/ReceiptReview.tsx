import * as React from 'react'

import { cn } from '@/lib/utils'
import { Amount } from '@/components/daydor/Amount'
import { Icon } from '@/components/daydor/Icon'

export interface ExtractedField {
  label: React.ReactNode
  value: number | React.ReactNode
  confidence?: 'high' | 'low'
  flag?: string
  confirmed?: boolean
}

export interface ReceiptReviewProps {
  fields: ExtractedField[]
  src?: string
  alt?: string
  photo?: React.ReactNode
  caption?: React.ReactNode
  heading?: React.ReactNode
  layout?: 'side' | 'stacked'
  children?: React.ReactNode
}

export function ReceiptReview({ fields, src, alt, photo, caption, heading, layout = 'side', children }: ReceiptReviewProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-5',
        layout === 'stacked' ? 'grid-cols-1 gap-4' : 'grid-cols-[200px_1fr]',
      )}
    >
      <figure
        className={cn(
          'relative m-0 flex items-center justify-center overflow-hidden rounded-lg bg-photo-ground',
          layout === 'stacked' ? 'aspect-[16/10]' : 'aspect-[3/4]',
        )}
      >
        {src ? <img src={src} alt={alt ?? 'Receipt'} className="h-full w-full object-contain" /> : photo}
        {caption && (
          <figcaption className="absolute bottom-2 left-2 rounded-full bg-surface px-2 py-0.5 text-[11px] leading-[15px] text-ink-muted">
            {caption}
          </figcaption>
        )}
      </figure>

      <div className="flex min-w-0 flex-col gap-3">
        {heading && <div className="flex items-center gap-2 text-[12px] font-medium leading-4 text-ink-muted">{heading}</div>}

        <dl className="m-0 overflow-hidden rounded-lg border border-line bg-surface">
          {fields.map((field, i) => {
            const isLow = field.confidence === 'low'
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-body last:border-b-0',
                  isLow && 'bg-warning-soft',
                )}
              >
                <dt className="shrink-0 text-ink-muted">{field.label}</dt>
                <dd className="m-0 flex min-w-0 items-center gap-2 text-right tabular-nums">
                  {field.flag && (
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium leading-[15px]',
                        field.confirmed ? 'text-success' : 'text-warning',
                      )}
                    >
                      <Icon name="alert" size={11} />
                      {field.flag}
                    </span>
                  )}
                  <span className={cn(!field.confirmed && 'border-b border-dashed border-line-strong')}>
                    {typeof field.value === 'number' ? <Amount value={field.value} paise /> : field.value}
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>

        {children}
      </div>
    </div>
  )
}
