import type { SettingsSource } from '@/data/settingsSource'
import type { NotificationPreferenceInput } from '@/data/actions'
import type { SettingsData } from '@/types/settings'

const MOCK_SETTINGS: SettingsData = {
  workspace: {
    legalEntityName: 'Acme Labs Private Limited',
    registeredAddress: '4th Floor, Prestige Tech Park, Kadubeesanahalli, Bengaluru, Karnataka 560103',
    pan: 'AACCA1234F',
    tan: 'BLRA12345B',
    gstin: '29AACCA1234F1Z5',
    workLocations: ['Bengaluru HQ', 'Mumbai office', 'Remote — India'],
    financialYearStart: 'April',
  },
  profile: {
    name: 'Abhijeet Singh',
    email: 'abhijeet.singh@acmelabs.com',
    role: 'Founder',
    notifications: [
      {
        key: 'approvals',
        label: 'Approvals waiting on you',
        description: 'Leave, expense and hiring decisions that need your sign-off.',
        channels: { email: true, inApp: true, whatsapp: true },
      },
      {
        key: 'payroll',
        label: 'Payroll run reminders',
        description: 'Heads-up before each pay run locks, and the summary after it ships.',
        channels: { email: true, inApp: true, whatsapp: false },
      },
      {
        key: 'compliance',
        label: 'Compliance deadlines',
        description: 'PF, ESI, TDS and other filings coming due.',
        channels: { email: true, inApp: false, whatsapp: false },
      },
      {
        key: 'digest',
        label: 'Weekly digest',
        description: "What changed across the team this week.",
        channels: { email: true, inApp: false, whatsapp: false },
      },
    ],
  },
}

export class MockSettingsSource implements SettingsSource {
  async getSettings(): Promise<SettingsData> {
    return MOCK_SETTINGS
  }

  async updateNotificationPreference(_input: NotificationPreferenceInput): Promise<void> {}
}
