/** Minimal fetch wrapper: JSON in/out, bearer token, typed errors, idempotency keys on POST. */

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface HttpConfig {
  baseUrl?: string
  token?: string | null
}

const TOKEN_KEY = 'daydor.token'
let override: HttpConfig = {}

/** Override base URL / token (used by the Node smoke script, where import.meta.env is unavailable). */
export function configure(config: HttpConfig): void {
  override = { ...override, ...config }
}

function env(): Record<string, string | undefined> {
  return ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {})
}

/** Remember the signed-in person's token (dev sign-in today; production sign-in replaces it) or forget it. */
export function setToken(token: string | null): void {
  override = { ...override, token }
  try {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token)
    else globalThis.localStorage?.removeItem(TOKEN_KEY)
  } catch {
    /* localStorage unavailable */
  }
}

export function getBaseUrl(): string {
  return (override.baseUrl ?? env().VITE_API_URL ?? '/api').replace(/\/+$/, '')
}

export function getToken(): string | null {
  if (override.token !== undefined) return override.token
  try {
    const stored = globalThis.localStorage?.getItem(TOKEN_KEY)
    if (stored) return stored
  } catch {
    /* localStorage unavailable */
  }
  return env().VITE_API_TOKEN ?? null
}

async function parseError(res: Response): Promise<ApiError> {
  let code = 'http_error'
  let message = res.statusText || `HTTP ${res.status}`
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string }
      detail?: unknown
    }
    if (body?.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
    } else if (body?.detail !== undefined) {
      message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    }
  } catch {
    /* non-JSON body */
  }
  return new ApiError(res.status, code, message)
}

async function request<T>(method: string, path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['Idempotency-Key'] = idempotencyKey ?? crypto.randomUUID()

  let res: Response
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    throw new ApiError(0, 'network_error', e instanceof Error ? e.message : 'Network error')
  }
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  /** Any method, with the idempotency key a confirmed command was given (so a double click cannot do it twice). */
  send: <T>(method: string, path: string, body?: unknown, idempotencyKey?: string) =>
    request<T>(method, path, method === 'GET' ? undefined : (body ?? {}), idempotencyKey),
  /** A file: the response is returned as a Blob with the server's file name (Content-Disposition), for downloads. */
  download: async (path: string): Promise<{ blob: Blob; filename: string }> => {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    let res: Response
    try {
      res = await fetch(`${getBaseUrl()}${path}`, { headers })
    } catch (e) {
      throw new ApiError(0, 'network_error', e instanceof Error ? e.message : 'Network error')
    }
    if (!res.ok) throw await parseError(res)
    const m = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') ?? '')
    return { blob: await res.blob(), filename: m?.[1] ?? 'download' }
  },
}
