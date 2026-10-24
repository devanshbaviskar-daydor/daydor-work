import * as React from 'react'

import type { DocumentsSource } from '@/data/documentsSource'
import type { Document, DocumentCategory, RetentionClass } from '@/types/documents'
import { Badge } from '@/components/daydor/Badge'
import { Icon } from '@/components/daydor/Icon'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ScreenState } from '@/components/daydor/ScreenState'
import { Table } from '@/components/daydor/Table'
import { useLoad } from '@/lib/useLoad'

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  payslip: 'Payslip',
  filing: 'Filing',
  'offer-letter': 'Offer letter',
  policy: 'Policy',
  'employee-record': 'Employee record',
  receipt: 'Receipt',
}

const RETENTION_LABEL: Record<RetentionClass, string> = {
  'statutory-7y': 'Keep 7 years (statutory)',
  'statutory-8y': 'Keep 8 years (statutory)',
  'duration-of-employment': 'Keep for duration of employment',
  'duration-plus-3y': 'Keep employment + 3 years',
  indefinite: 'Keep indefinitely',
}

const CATEGORY_FILTERS: Array<{ value: DocumentCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'payslip', label: 'Payslips' },
  { value: 'filing', label: 'Filings' },
  { value: 'offer-letter', label: 'Offer letters' },
  { value: 'policy', label: 'Policy' },
  { value: 'employee-record', label: 'Employee records' },
  { value: 'receipt', label: 'Receipts' },
]

function DocumentViewer({ document, onClose }: { document: Document; onClose: () => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="m-0 text-[12px] font-medium text-ink-muted">{CATEGORY_LABEL[document.category]}</p>
          <h2 className="m-0 text-[17px] font-semibold leading-[24px] text-ink">{document.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-sm p-1 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="flex aspect-[1/1.3] w-full items-center justify-center rounded-lg border border-line bg-canvas">
        <div className="flex flex-col items-center gap-2 text-ink-muted">
          <Icon name="file" size={32} />
          <p className="m-0 text-[12px]">No file stored for this mock record</p>
        </div>
      </div>

      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
        <dt className="text-ink-muted">Owner</dt>
        <dd className="m-0 text-ink">{document.ownerEmployeeId ?? 'Company-wide'}</dd>
        <dt className="text-ink-muted">Related to</dt>
        <dd className="m-0 text-ink">
          {document.relatedEntityType} · {document.relatedEntityId}
        </dd>
        <dt className="text-ink-muted">Created</dt>
        <dd className="m-0 text-ink">{document.createdAt}</dd>
        <dt className="text-ink-muted">Retention</dt>
        <dd className="m-0 text-ink">{document.retentionClass ? RETENTION_LABEL[document.retentionClass] : 'Not shown to your role'}</dd>
      </dl>
    </div>
  )
}

export interface DocumentsScreenProps {
  source: DocumentsSource
}

export function DocumentsScreen({ source }: DocumentsScreenProps) {
  const load = useLoad(() => source.getDocuments(), [source])
  const [category, setCategory] = React.useState<DocumentCategory | 'all'>('all')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const data = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const filtered = category === 'all' ? data.documents : data.documents.filter((d) => d.category === category)
  const selected = selectedId ? data.documents.find((d) => d.id === selectedId) ?? null : null

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
          <PageHeader
            eyebrow={['Documents']}
            title="Documents"
            description="Payslips, filings, offer letters, policy documents and employee records in one index."
            tabs={CATEGORY_FILTERS.map((f) => ({
              label: f.label,
              active: category === f.value,
              count: f.value === 'all' ? data.documents.length : data.documents.filter((d) => d.category === f.value).length,
              onClick: () => setCategory(f.value),
            }))}
          />

          <div className="grid grid-cols-[1.3fr_1fr] items-start gap-6">
            <Table
              caption="Documents"
              rows={filtered}
              rowKey={(d) => d.id}
              empty="No documents in this category."
              columns={[
                {
                  key: 'title',
                  header: 'Document',
                  render: (d) => (
                    <button
                      type="button"
                      onClick={() => setSelectedId(d.id)}
                      className="flex min-w-0 items-center gap-2 text-left hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Icon name="file" size={14} className="shrink-0 text-ink-muted" />
                      <span className="truncate text-ink">{d.title}</span>
                    </button>
                  ),
                },
                {
                  key: 'category',
                  header: 'Category',
                  render: (d) => <Badge tone="neutral">{CATEGORY_LABEL[d.category]}</Badge>,
                },
                { key: 'createdAt', header: 'Created', render: (d) => d.createdAt },
              ]}
            />

            {selected ? (
              <DocumentViewer document={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex aspect-[1/1.3] items-center justify-center rounded-lg border border-dashed border-line text-[13px] text-ink-muted">
                Select a document to view its details
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
