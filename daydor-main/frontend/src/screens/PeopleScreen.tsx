import { useNavigate } from 'react-router-dom'

import type { PeopleSource } from '@/data/peopleSource'
import type { EmploymentStatus, PersonSummary } from '@/types/people'
import { Avatar } from '@/components/daydor/Avatar'
import { Badge } from '@/components/daydor/Badge'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ScreenState } from '@/components/daydor/ScreenState'
import { StatRow } from '@/components/daydor/StatRow'
import { Table } from '@/components/daydor/Table'
import { useLoad } from '@/lib/useLoad'

export interface PeopleScreenProps {
  source: PeopleSource
}

const STATUS_BADGE: Record<EmploymentStatus, 'active' | 'pending' | 'withdrawn'> = {
  active: 'active',
  'on-leave': 'pending',
  withdrawn: 'withdrawn',
}

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  active: 'Active',
  'on-leave': 'On leave',
  withdrawn: 'Withdrawn',
}

export function PeopleScreen({ source }: PeopleScreenProps) {
  const navigate = useNavigate()
  const load = useLoad(() => source.getPeople(), [source])
  const data = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  const onLeave = data.people.filter((p) => p.status === 'on-leave').length
  const active = data.people.filter((p) => p.status === 'active').length

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar peopleCount={data.headcount} />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
          <PageHeader
            eyebrow={['People']}
            title="People"
            description={`${data.headcount} people`}
          />

          <div className="rounded-lg border border-line bg-surface p-6">
            <StatRow
              items={[
                { label: 'Headcount', value: `${data.headcount}` },
                { label: 'Active', value: `${active}` },
                { label: 'On leave today', value: `${onLeave}` },
              ]}
            />
          </div>

          <Table<PersonSummary>
            density="compact"
            rows={data.people}
            rowKey={(row) => row.id}
            columns={[
              {
                key: 'name',
                header: 'Name',
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => navigate(`/people/${row.id}`)}
                    className="flex items-center gap-2.5 text-left hover:underline"
                  >
                    <Avatar kind="person" name={row.name} size={24} />
                    <span className="font-medium text-ink">{row.name}</span>
                  </button>
                ),
              },
              { key: 'role', header: 'Role' },
              { key: 'department', header: 'Department' },
              { key: 'location', header: 'Location' },
              ...(data.people.some((p) => p.joinDate) ? [{ key: 'joinDate', header: 'Joined' }] : []),
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Badge status={STATUS_BADGE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
              },
            ]}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
