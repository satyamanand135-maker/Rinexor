import { config } from '../app/config'

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
  token?: string | null
  headers?: Record<string, string | undefined>
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message = (payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string')
      ? payload.detail
      : `Request failed (${res.status})`
    throw new ApiError(message, res.status, payload)
  }

  return payload as T
}

