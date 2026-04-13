import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const pushMock = vi.fn()
const setAuthMock = vi.fn()
let mockQuery = {}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: mockQuery }),
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
    mockQuery = {}
  })

  it('auto logs in demo admin and redirects to admin dashboard', () => {
    const wrapper = mount(DemoLoginView)

    expect(wrapper.text()).toContain('Entering as Administrator')
    expect(setAuthMock).toHaveBeenCalledTimes(1)
    const [, user] = setAuthMock.mock.calls[0]
    expect(user.role).toBe('admin')
    expect(pushMock).toHaveBeenCalledWith('/admin')
  })

  it('logs in as teacher when role=teacher query param is set', () => {
    mockQuery = { role: 'teacher' }
    const wrapper = mount(DemoLoginView)

    expect(wrapper.text()).toContain('Entering as Teacher')
    expect(setAuthMock).toHaveBeenCalledTimes(1)
    const [, user] = setAuthMock.mock.calls[0]
    expect(user.role).toBe('Teacher')
    expect(user.email).toBe('teacher.demo@hkbu.edu.hk')
    expect(pushMock).toHaveBeenCalledWith('/amendments')
  })

  it('logs in as PD when role=pd query param is set', () => {
    mockQuery = { role: 'pd' }
    const wrapper = mount(DemoLoginView)

    expect(wrapper.text()).toContain('Entering as Programme Director')
    expect(setAuthMock).toHaveBeenCalledTimes(1)
    const [, user] = setAuthMock.mock.calls[0]
    expect(user.role).toBe('Programme Director')
    expect(pushMock).toHaveBeenCalledWith('/pd-approvals')
  })
})
