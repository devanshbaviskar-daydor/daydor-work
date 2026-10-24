import type { SettingsSource } from '@/data/settingsSource'
import type { SettingsData } from '@/types/settings'
import type { NotificationPreferenceInput } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpSettingsSource implements SettingsSource {
  getSettings(): Promise<SettingsData> {
    return http.get<SettingsData>('/views/settings')
  }

  updateNotificationPreference(input: NotificationPreferenceInput): Promise<void> {
    return http.put<void>('/me/notification-preferences', input)
  }
}
