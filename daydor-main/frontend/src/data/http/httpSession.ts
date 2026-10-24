import type { DevUser, Session } from '@/session/types'
import { http, setToken } from '@/data/http/httpClient'

export const sessionApi = {
  me: () => http.get<Session>('/auth/me'),
  /** Development sign-in only (the API answers 404 outside DAYDOR_API_ENV=dev). Production sign-in replaces it. */
  devUsers: async () => (await http.get<{ users: DevUser[] }>('/auth/dev-users')).users,
  devLogin: async (email: string): Promise<Session> => {
    const r = await http.post<{ token: string; session: Session }>('/auth/dev-login', { email })
    setToken(r.token)
    return r.session
  },
  signOut: () => setToken(null),
}
