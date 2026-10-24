import { useNavigate, useParams } from 'react-router-dom'

import type { PeopleSource } from '@/data/peopleSource'
import { Button } from '@/components/daydor/Button'
import { FactList } from '@/components/daydor/FactList'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ProfileFieldGroup } from '@/components/daydor/ProfileField'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ScreenState } from '@/components/daydor/ScreenState'
import { StatRow } from '@/components/daydor/StatRow'
import { Timeline } from '@/components/daydor/Timeline'
import { useLoad } from '@/lib/useLoad'

export interface PersonScreenProps {
  source: PeopleSource
}

export function PersonScreen({ source }: PersonScreenProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const load = useLoad(() => (id ? source.getPerson(id) : Promise.resolve(null)), [source, id])
  const person = load.data

  if (load.loading && person === null && !load.error) return <ScreenState />
  if (load.error) return <ScreenState error={load.error} onRetry={load.reload} />
  if (person === null) {
    return (
      <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
        <AppSidebar />
        <div className="flex items-center justify-center text-body text-ink-muted">Person not found.</div>
      </div>
    )
  }

  const directFields = person.fields.filter((f) => f.tier === 'direct')
  const reviewFields = person.fields.filter((f) => f.tier === 'review')
  const gatedFields = person.fields.filter((f) => f.tier === 'gated')

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-12 py-8">
          <PageHeader
            person={person.name}
            eyebrow={['People']}
            title={person.name}
            description={[person.role, person.joinDate ? `since ${person.joinDate}` : '', person.location].filter(Boolean).join(' · ')}
            actions={
              <Button icon="message" onClick={() => navigate('/', { state: { ask: { id: person.id, name: person.name } } })}>
                Ask about {person.name.split(' ')[0]}
              </Button>
            }
            tabs={[{ label: 'Overview', active: true }]}
          />

          <div className="grid grid-cols-[1.4fr_1fr] items-start gap-6">
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-line bg-surface p-6">
                {person.stats.length > 0 ? <StatRow items={person.stats} /> : <p className="m-0 text-small text-ink-muted">Your role does not see pay or leave figures.</p>}
              </div>

              <div className="rounded-lg border border-line bg-surface p-6">
                <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Details</h2>
                <FactList
                  columns={2}
                  items={[
                    { label: 'Employee ID', value: person.employeeId, mono: true },
                    { label: 'Manager', value: person.manager },
                    ...(person.monthlyCtc !== undefined ? [{ label: 'Monthly CTC', value: person.monthlyCtc }] : []),
                    ...(person.taxRegime !== undefined ? [{ label: 'Tax regime', value: person.taxRegime }] : []),
                    { label: 'Work location', value: person.location },
                    { label: 'Department', value: person.department },
                  ]}
                />
              </div>

              <div className="rounded-lg border border-line bg-surface p-6">
                <h2 className="m-0 mb-1 text-[15px] font-semibold leading-[22px] text-ink">Profile</h2>
                <div className="flex flex-col divide-y divide-line">
                  {directFields.length > 0 && <ProfileFieldGroup title="Contact" fields={directFields} />}
                  {reviewFields.length > 0 && <ProfileFieldGroup title="Kept by HR" fields={reviewFields} />}
                  {gatedFields.length > 0 && <ProfileFieldGroup title="Protected: shown only as on file" fields={gatedFields} />}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">
                What happened on {person.name.split(' ')[0]}&rsquo;s record
              </h2>
              <Timeline items={person.timeline} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
