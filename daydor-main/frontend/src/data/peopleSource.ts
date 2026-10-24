import type { PeopleData, PersonDetail } from '@/types/people'

/**
 * Data-fetching contract for the People directory and profile screens. A real
 * implementation (backed by the HTTP API once it exists) can replace
 * MockPeopleSource without any change to the components that consume it.
 */
export interface PeopleSource {
  getPeople(): Promise<PeopleData>
  getPerson(id: string): Promise<PersonDetail | null>
}
