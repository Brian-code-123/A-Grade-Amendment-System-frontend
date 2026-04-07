import { describe, expect, it, vi, beforeEach } from 'vitest'

const mountMock = vi.fn()
const useMock = vi.fn().mockReturnThis()
const createAppMock = vi.fn(() => ({
  use: useMock,
  mount: mountMock,
}))

vi.mock('vue', () => ({
  createApp: createAppMock,
}))

vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({ __pinia: true })),
}))

vi.mock('@/App.vue', () => ({
  default: { name: 'AppStub' },
}))

vi.mock('@/router', () => ({
  default: { __router: true },
}))

vi.mock('@oruga-ui/oruga-next', () => ({
  default: { __oruga: true },
}))

vi.mock('@oruga-ui/theme-bootstrap', () => ({
  bootstrapConfig: { __bootstrapConfig: true },
}))

describe('main bootstrap', () => {
  beforeEach(() => {
    createAppMock.mockClear()
    useMock.mockClear()
    mountMock.mockClear()
  })

  it('creates app and mounts with plugins', async () => {
    await import('@/main.js')

    expect(createAppMock).toHaveBeenCalledTimes(1)
    expect(useMock).toHaveBeenCalledTimes(3)
    expect(mountMock).toHaveBeenCalledWith('#app')
  })
})
