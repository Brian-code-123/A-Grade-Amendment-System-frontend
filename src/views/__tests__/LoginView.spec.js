import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '../LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const routerMock = { replace: vi.fn(), push: vi.fn() }
vi.mock('vue-router', () => ({
  useRouter: () => routerMock
}))

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerMock.replace.mockClear()
    routerMock.push.mockClear()
  })

  it('renders the login form for a logged-out visitor', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Sign In')
    expect(routerMock.replace).not.toHaveBeenCalled()
  })

  it('redirects an already-logged-in user to their landing route', () => {
    const auth = useAuthStore()
    auth.setAuth('token', { name: 'Head', email: 'h@example.com', role: 'Head' })

    mount(LoginView)

    expect(routerMock.replace).toHaveBeenCalledWith('/pd-approvals')
  })
})
