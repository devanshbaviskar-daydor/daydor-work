export interface WorkspaceSettings {
  legalEntityName: string
  registeredAddress: string
  pan: string
  tan: string
  gstin: string
  workLocations: string[]
  financialYearStart: string
}

export type NotificationChannel = 'email' | 'inApp' | 'whatsapp'

export interface NotificationPreference {
  key: string
  label: string
  description: string
  channels: Record<NotificationChannel, boolean>
}

export interface ProfileSettings {
  name: string
  email: string
  role: string
  notifications: NotificationPreference[]
}

export interface SettingsData {
  workspace: WorkspaceSettings
  profile: ProfileSettings
}
