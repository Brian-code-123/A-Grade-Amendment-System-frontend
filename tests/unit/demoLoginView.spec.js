import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const pushMock = vi.fn()
const setAuthMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    setAuth: setAuthMock,
  }),
}))

import DemoLoginView from '@/views/DemoLoginView.vue'

describe('DemoLoginView', () => {
  beforeEach(() => {
    pushMock.mockReset()
    setAuthMock.mockReset()
  })

  it('auto logs in demo admin and redirects home', () => {
    const wrapper = mount(DemoLoginView)

    expect(wrapper.text()).toContain('Entering as Administrator')
    expect(setAuthMock).toHaveBeenCalledTimes(1)
    const [, user] = setAuthMock.mock.calls[0]
    expect(user.role).toBe('admin')
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
