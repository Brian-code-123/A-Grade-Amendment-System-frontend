import { describe, expect, it, vi } from 'vitest'

async function loadApiModule(envValue) {
  vi.resetModules()
  if (envValue === undefined) {
    delete process.env.VITE_API_BASE_URL
  } else {
    process.env.VITE_API_BASE_URL = envValue
  }
  return import('@/utils/api')
}

describe('api utilities', () => {
  it('buildApiUrl returns same-origin path when no base URL is configured', async () => {
    const { buildApiUrl } = await loadApiModule(undefined)
    expect(buildApiUrl('/api/demo')).toBe('/api/demo')
  })

  it('buildApiUrl prepends configured base URL', async () => {
    const { buildApiUrl } = await loadApiModule('https://api.example.com/')
    expect(buildApiUrl('/api/demo')).toBe('https://api.example.com/api/demo')
  })

  it('apiFetch falls back to same-origin when remote host fails', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    const { apiFetch } = await loadApiModule('https://api.example.com')
    await apiFetch('/api/health')

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://api.example.com/api/health', undefined)
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/health', undefined)
  })
})
