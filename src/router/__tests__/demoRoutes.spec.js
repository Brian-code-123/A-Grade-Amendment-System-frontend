import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('demo routes', () => {
  beforeEach(() => vi.resetModules())

  it('are registered when demo mode is enabled', async () => {
    vi.doMock('@/config/demo', () => ({ demoEnabled: true }))
    const { default: router } = await import('../index.js')
    const names = router.getRoutes().map((r) => r.name)
    expect(names).toContain('demo-login')
    expect(names).toContain('demo-verify')
  })

  it('are not registered when demo mode is disabled', async () => {
    vi.doMock('@/config/demo', () => ({ demoEnabled: false }))
    const { default: router } = await import('../index.js')
    const names = router.getRoutes().map((r) => r.name)
    expect(names).not.toContain('demo-login')
    expect(names).not.toContain('demo-verify')
    expect(names).toContain('login')
  })
})
