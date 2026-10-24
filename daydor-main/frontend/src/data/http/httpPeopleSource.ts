import type { PeopleSource } from '@/data/peopleSource'
import type { PeopleData, PersonDetail } from '@/types/people'
import { ApiError, http } from '@/data/http/httpClient'

export class HttpPeopleSource implements PeopleSource {
  getPeople(): Promise<PeopleData> {
    return http.get<PeopleData>('/views/people')
  }

  async getPerson(id: string): Promise<PersonDetail | null> {
    try {
      return await http.get<PersonDetail>(`/views/people/${encodeURIComponent(id)}`)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  }
}
