import * as React from 'react'

import type { SettingsSource } from '@/data/settingsSource'
import type { NotificationChannel, ProfileSettings, WorkspaceSettings } from '@/types/settings'
import { Input } from '@/components/daydor/Input'
import { PageHeader } from '@/components/daydor/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select } from '@/components/daydor/Select'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { ScreenState } from '@/components/daydor/ScreenState'
import { useLoad } from '@/lib/useLoad'
import { useNotify } from '@/lib/notify'

export interface SettingsScreenProps {
  source: SettingsSource
}

const FINANCIAL_YEAR_START_OPTIONS = ['January', 'April', 'July', 'October']

const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  inApp: 'In-app',
  whatsapp: 'WhatsApp',
}

function WorkspaceSection({ workspace }: { workspace: WorkspaceSettings }) {
  const data = workspace
  const readOnly = 'Changes to the legal entity are made by Daydor support during the pilot.'

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-line bg-surface p-6">
        <h2 className="m-0 mb-1 text-[15px] font-semibold leading-[22px] text-ink">Legal entity</h2>
        <p className="m-0 mb-4 text-[13px] leading-[18px] text-ink-muted">
          Used on payslips, offer letters and statutory filings. {readOnly}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Legal entity name"
              value={data.legalEntityName}
              readOnly
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Registered address"
              value={data.registeredAddress}
              readOnly
            />
          </div>
          <Input label="PAN" value={data.pan} readOnly />
          <Input label="TAN" value={data.tan} readOnly />
          <Input label="GSTIN" value={data.gstin} readOnly />
          <Select
            label="Financial year starts"
            options={FINANCIAL_YEAR_START_OPTIONS}
            value={data.financialYearStart}
            disabled
          />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-6">
        <h2 className="m-0 mb-1 text-[15px] font-semibold leading-[22px] text-ink">Work locations</h2>
        <p className="m-0 mb-4 text-[13px] leading-[18px] text-ink-muted">
          Used for holiday calendars and attendance. Add a location for every state you run payroll in.
        </p>
        <ul className="m-0 flex flex-col gap-2 p-0">
          {data.workLocations.map((location, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border border-line bg-surface-sunken px-3 py-2 text-[14px] text-ink"
            >
              {location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProfileSection({ profile, source }: { profile: ProfileSettings; source: SettingsSource }) {
  const [data, setData] = React.useState<ProfileSettings>(profile)

  const { fail } = useNotify()

  const setChannel = (notificationKey: string, channels: Record<NotificationChannel, boolean>) =>
    setData((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.key === notificationKey ? { ...n, channels } : n)) }))

  /** Applied at once, put back if the server refuses, with the reason shown. */
  async function toggleChannel(notificationKey: string, channel: NotificationChannel, checked: boolean) {
    const current = data.notifications.find((n) => n.key === notificationKey)
    if (!current) return
    const before = current.channels
    const next = { ...before, [channel]: checked }
    setChannel(notificationKey, next)
    try {
      await source.updateNotificationPreference({ kind: notificationKey, email: next.email, in_app: next.inApp, whatsapp: next.whatsapp })
    } catch (e) {
      setChannel(notificationKey, before)
      fail(e)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-line bg-surface p-6">
        <h2 className="m-0 mb-4 text-[15px] font-semibold leading-[22px] text-ink">Your details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" value={data.name} readOnly hint="Managed by your workspace admin." />
          <Input label="Email" type="email" value={data.email} readOnly hint="Managed by your workspace admin." />
          <Input label="Role" value={data.role} disabled hint="Set by your workspace admin." />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-6">
        <h2 className="m-0 mb-1 text-[15px] font-semibold leading-[22px] text-ink">Notifications</h2>
        <p className="m-0 mb-4 text-[13px] leading-[18px] text-ink-muted">
          Choose how you hear about each kind of update. These apply to you only.
        </p>
        <div className="flex flex-col divide-y divide-line">
          {data.notifications.map((notification) => (
            <div key={notification.key} className="flex items-start justify-between gap-6 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-col">
                <span className="text-[14px] font-medium text-ink">{notification.label}</span>
                <span className="text-[13px] leading-[18px] text-ink-muted">{notification.description}</span>
              </div>
              <div className="flex shrink-0 gap-4">
                {(Object.keys(NOTIFICATION_CHANNEL_LABELS) as NotificationChannel[]).map((channel) => (
                  <label key={channel} className="flex cursor-pointer items-center gap-1.5 text-[13px] text-ink-muted">
                    <input
                      type="checkbox"
                      checked={notification.channels[channel]}
                      onChange={(e) => void toggleChannel(notification.key, channel, e.target.checked)}
                      className="h-4 w-4 shrink-0 accent-action"
                    />
                    {NOTIFICATION_CHANNEL_LABELS[channel]}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsScreen({ source }: SettingsScreenProps) {
  const load = useLoad(() => source.getSettings(), [source])
  const [section, setSection] = React.useState<'workspace' | 'profile'>('workspace')
  const data = load.data

  if (!data) return <ScreenState error={load.error} onRetry={load.reload} />

  // Managers, employees and IT do not read the legal entity: the workspace tab is for the roles that do.
  const hasWorkspace = data.workspace.legalEntityName !== ''
  const activeSection = hasWorkspace ? section : 'profile'

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar />

      <ScrollArea className="min-h-0">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-12 py-8">
          <PageHeader
            eyebrow={['Settings']}
            title="Settings"
            description={hasWorkspace ? 'Workspace details used across payroll and filings, plus your own profile and notifications.' : 'Your profile and notifications.'}
            tabs={
              hasWorkspace
                ? [
                    { label: 'Workspace', active: activeSection === 'workspace', onClick: () => setSection('workspace') },
                    { label: 'Profile', active: activeSection === 'profile', onClick: () => setSection('profile') },
                  ]
                : undefined
            }
          />

          {activeSection === 'workspace' ? <WorkspaceSection workspace={data.workspace} /> : <ProfileSection profile={data.profile} source={source} />}
        </div>
      </ScrollArea>
    </div>
  )
}
