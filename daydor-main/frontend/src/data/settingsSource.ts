import type { SettingsData } from '@/types/settings'
import type { NotificationPreferenceInput } from '@/data/actions'

/**
 * Data-fetching contract for the Settings screen. MockSettingsSource and
 * HttpSettingsSource both implement it; pick one via src/data/sources.ts.
 */
export interface SettingsSource {
  getSettings(): Promise<SettingsData>
  updateNotificationPreference(input: NotificationPreferenceInput): Promise<void>
}
