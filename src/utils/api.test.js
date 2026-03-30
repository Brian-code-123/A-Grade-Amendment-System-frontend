import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildApiUrl, apiFetch } from './api'

// NOTE: import.meta.env.VITE_API_BASE_URL is captured as a module-level constant
// in api.js at load time, so its value reflects whatever is set when the module
// was first imported.  In the test environment this value is '' (empty), so
// buildApiUrl acts as a simple pass-through – that is what we test here.

describe('buildApiUrl (no base URL configured)', () => {
  it('returns the path unchanged for absolute paths', () => {
    expect(buildApiUrl('/api/auth/login')).toBe('/api/auth/login')
  })

  it('returns a relative path unchanged when no base is set', () => {
    expect(buildApiUrl('api/test')).toBe('api/test')
  })

  it('returns the path unchanged for deeply-nested routes', () => {
    expect(buildApiUrl('/api/amendments/123')).toBe('/api/amendments/123')
  })
})

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls fetch with the correct URL', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    await apiFetch('/api/test')
    expect(mockFetch).toHaveBeenCalledWith('/api/test', undefined)
  })

  it('passes options to fetch', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    await apiFetch('/api/test', options)
    expect(mockFetch).toHaveBeenCalledWith('/api/test', options)
  })

  it('returns the raw fetch Response object', async () => {
    const fakeResponse = { ok: true, status: 200, json: async () => ({ id: 1 }) }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(fakeResponse)

    const result = await apiFetch('/api/anything')
    expect(result).toBe(fakeResponse)
  })
})

