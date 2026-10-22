import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

const routerMock = { replace: vi.fn(), push: vi.fn() }
vi.mock('vue-router', () => ({ useRouter: () => routerMock }))

describe('LoginView demo access', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetModules()
  })

  it('shows demo buttons when demo mode is enabled', async () => {
    vi.doMock('@/config/demo', () => ({ demoEnabled: true }))
    const { default: LoginView } = await import('../LoginView.vue')
    const wrapper = mount(LoginView)
    expect(wrapper.findAll('.lp-demo-btn').length).toBe(3)
  })

  it('hides demo buttons and their divider when demo mode is disabled', async () => {
    vi.doMock('@/config/demo', () => ({ demoEnabled: false }))
    const { default: LoginView } = await import('../LoginView.vue')
    const wrapper = mount(LoginView)
    expect(wrapper.find('.lp-demo-btn').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Quick demo access')
    expect(wrapper.text()).not.toContain('or sign in with credentials')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })
})
